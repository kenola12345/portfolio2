/**
 * Sketchfab の「Record player」(Temmie_Dola, CC-BY-4.0) を Web 用に軽くする。
 *   node scripts/optimize-record-player.mjs <元の .glb> [出力先]
 *
 * 元ファイルは約 64MB（ほぼ 4K テクスチャ）。このサイトで使うのはプレーヤー本体とトーンアームだけなので、
 *  - モデルに入っているジャケット 3 枚と盤（ノード Convert / Vinyl disk / Convert.001 / Convert.002）を消す
 *  - アニメーションを消す（アームは静止ポーズで使う）
 *  - 天板のロゴ（青い鳥のマーク）を消し、黒いターンテーブルの円周に沿って名前を印字する（ベースカラーのテクスチャを直接書き換える）
 *  - 使われなくなったテクスチャ等を prune し、ベースカラーは 2048px、他は 1024px の webp にする
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';

const [input, output = 'public/models/record_player.glb'] = process.argv.slice(2);
if (!input) {
  console.error('usage: node scripts/optimize-record-player.mjs <input.glb> [output.glb]');
  process.exit(1);
}

const REMOVE_NODES = ['Convert', 'Vinyl disk', 'Convert.001', 'Convert.002'];

/**
 * ベースカラー（4096px）は展開図になっている。以下の座標は、それを 1024px に縮めたときのもの。
 *  - 右上の正方形が天板（x 517〜1020、y 5〜515）。左下にロゴがあるので白で塗りつぶす
 *  - 左下の円が黒いターンテーブル（中心 (215, 740)、黒い面の半径 205）。この上に名前を円形に印字する
 * ターンテーブルの展開図は、モデル上では上下が反転して見える（展開図の上 = 手前、右 = 右）。
 * そのため「見たままの向き」で描いて、最後に上下反転の変換（matrix(1 0 0 -1 …)）を掛けている
 */
const PLATTER = { cx: 215, cy: 740 };
const RING = {
  /** 大きい文字：名前。ターンテーブルの上側の円弧に、文字の上が外側を向くように並べる */
  name: 'KENTARO OSHIMOTO',
  nameRadius: 146, // 文字の底（ベースライン）の半径
  nameSize: 50,
  nameSpacing: 3,
  /** 小さい文字：肩書き。下側の円弧に、文字の上が内側を向くように並べる */
  sub: 'FULL STACK ENGINEER',
  subRadius: 186,
  subSize: 22,
  subSpacing: 2.5,
  color: '#f4f4f5',
  // Montserrat に近い幾何学的なゴシック。環境にあるものを順に使う
  font: "Futura, 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
};

/**
 * SVG の textPath（曲線に沿った文字）は、この環境の SVG レンダラーが対応していないので、
 * 1 文字ずつ幅を測り、円周上の角度を計算して回転・配置する。
 */
async function inkWidthEm(ch) {
  if (ch === ' ') return 0.3;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#fff"/>
    <text x="100" y="200" font-size="100" font-family="${RING.font}" font-weight="800" fill="#000">${ch}</text></svg>`;
  const { info } = await sharp(Buffer.from(svg)).trim({ threshold: 20 }).toBuffer({ resolveWithObject: true });
  return info.width / 100;
}

/**
 * 文字列を円周に並べた <text> 群を返す（原点が円の中心、y が下向き）。
 *  - 'top'    : 上側の弧に、文字の上が外側を向くように左から右へ
 *  - 'bottom' : 下側の弧に、文字の上が内側を向くように左から右へ
 * radius は文字の底（ベースライン）の半径
 */
async function ringText(text, { radius, size, spacing, side }) {
  const widths = [];
  for (const ch of text) widths.push((await inkWidthEm(ch)) * size);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (widths.length - 1);
  let cursor = -total / 2; // 円周に沿った位置（中心 = 0）
  const parts = [];
  [...text].forEach((ch, i) => {
    const mid = cursor + widths[i] / 2;
    cursor += widths[i] + spacing;
    if (ch === ' ') return;
    const deg = ((mid / radius) * 180) / Math.PI; // 右へ進むほど増える
    const t = side === 'top' ? `rotate(${deg.toFixed(3)}) translate(0 ${-radius})` : `rotate(${(-deg).toFixed(3)}) translate(0 ${radius})`;
    parts.push(`<text transform="${t}" text-anchor="middle">${ch}</text>`);
  });
  return { svg: parts.join('\n    '), spanDeg: ((total / radius) * 180) / Math.PI };
}

const LOGO_PATCH = { x: 522, y: 395, width: 83, height: 113 };

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();

for (const node of root.listNodes()) {
  if (REMOVE_NODES.includes(node.getName())) node.dispose();
}
root.listAnimations().forEach((a) => a.dispose());

// ベースカラーのテクスチャにロゴ消しと名前を焼き込む
const playerMaterial = root.listMaterials().find((m) => m.getName() === 'Player');
const baseTexture = playerMaterial?.getBaseColorTexture();
if (!baseTexture) throw new Error('Player material has no base color texture');
const name = await ringText(RING.name, { radius: RING.nameRadius, size: RING.nameSize, spacing: RING.nameSpacing, side: 'top' });
const sub = await ringText(RING.sub, { radius: RING.subRadius, size: RING.subSize, spacing: RING.subSpacing, side: 'bottom' });
console.log(`name arc ${name.spanDeg.toFixed(0)}°, sub arc ${sub.spanDeg.toFixed(0)}°`);
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="4096" viewBox="0 0 1024 1024">
  <rect x="${LOGO_PATCH.x}" y="${LOGO_PATCH.y}" width="${LOGO_PATCH.width}" height="${LOGO_PATCH.height}" fill="#ffffff"/>
  <g transform="matrix(1 0 0 -1 ${PLATTER.cx} ${PLATTER.cy})" fill="${RING.color}" font-family="${RING.font}" font-weight="800">
    <g font-size="${RING.nameSize}">
    ${name.svg}
    </g>
    <g font-size="${RING.subSize}">
    ${sub.svg}
    </g>
  </g>
</svg>`;
const edited = await sharp(Buffer.from(baseTexture.getImage()))
  .composite([{ input: Buffer.from(overlay) }])
  .png()
  .toBuffer();
baseTexture.setImage(new Uint8Array(edited));

await doc.transform(
  prune(),
  dedup(),
  // 文字をくっきり見せるため、ベースカラーだけ 2048px。ほかは 1024px
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /baseColor/, resize: [2048, 2048], quality: 90 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(normal|metallicRoughness)/, resize: [1024, 1024], quality: 85 }),
);

await io.write(output, doc);
console.log('wrote', output);
