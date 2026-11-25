/**
 * Sketchfab の「Record player」(Temmie_Dola, CC-BY-4.0) を Web 用に軽くする。
 *   node scripts/optimize-record-player.mjs <元の .glb> [出力先]
 *
 * 元ファイルは約 64MB（ほぼ 4K テクスチャ）。このサイトで使うのはプレーヤー本体とトーンアームだけなので、
 *  - モデルに入っているジャケット 3 枚と盤（ノード Convert / Vinyl disk / Convert.001 / Convert.002）を消す
 *  - アニメーションを消す（アームは静止ポーズで使う）
 *  - 天板のロゴ（青い鳥のマーク）を消し、手前の縁に名前を印字する（ベースカラーのテクスチャを直接書き換える）
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
 * ベースカラー（4096px）は展開図になっていて、右上の正方形が天板。
 * 以下の座標は、その展開図を 1024px に縮めたときのもの（天板は x 517〜1020、y 5〜515）。
 * 天板の左下（= 手前の左）にロゴがあるので白で塗りつぶし、同じ手前の縁に名前を入れる。
 */
const NAME = {
  text: 'KENTARO OSHIMOTO',
  // 天板の展開図は横向き＋左右反転で貼られている（展開図の左端 = モデルの手前の縁、下端 = モデルの左端）。
  // そのため文字は展開図の上向きに走らせ、反転した行列（matrix(0 -1 -1 0 …)）で描くと、
  // 手前の縁に沿って左から右へ正しく読める。baseline = 文字の底の x 位置、center = 縁に沿った中心の y 位置
  baseline: 538,
  center: 260,
  fontSize: 26,
  letterSpacing: 3.5,
  color: '#1d2330',
  // Montserrat に近い幾何学的なゴシック。環境にあるものを順に使う
  font: "Futura, 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
};
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
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="4096" viewBox="0 0 1024 1024">
  <rect x="${LOGO_PATCH.x}" y="${LOGO_PATCH.y}" width="${LOGO_PATCH.width}" height="${LOGO_PATCH.height}" fill="#ffffff"/>
  <text transform="matrix(0 -1 -1 0 ${NAME.baseline} ${NAME.center})" text-anchor="middle"
        font-family="${NAME.font}" font-weight="800" font-size="${NAME.fontSize}"
        letter-spacing="${NAME.letterSpacing}" fill="${NAME.color}">${NAME.text}</text>
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
