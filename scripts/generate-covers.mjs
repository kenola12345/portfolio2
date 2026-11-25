/**
 * アルバムのカバー画像（public/covers）のうち、このスクリプトで作るもの。
 *   node scripts/generate-covers.mjs
 *  - projects.webp : 制作した seta-tei.jp のスクリーンショットを正方形に切り出したもの
 *  - skills.webp   : 技術のアイコン（HTML / CSS / JS / TS / React / Next.js）を並べたもの
 *  - contact.webp  : メールのアイコン（public/icons/gmail.svg の形）
 * work.webp（アニメのパソコンの絵）と artist.webp（写真）は用意した画像をそのまま使う。
 *
 * レコードの中央ラベルは正方形のカバーを丸く切り抜いて貼るので、
 * 大事な絵は正方形の中心の円（直径 = 辺の長さ）に収めている。
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const OUT = 'public/covers';
const SIZE = 1024;
const FONT = "Futura, 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";

// ---- Projects：seta-tei.jp のスクリーンショットを中央で正方形に ----
await sharp('public/projects/seta-tei.png')
  .extract({ left: 316, top: 16, width: 880, height: 880 })
  .resize(SIZE)
  .webp({ quality: 88 })
  .toFile(`${OUT}/projects.webp`);

// ---- Skills：技術のバッジ（ロゴを簡略化して描いたもの） ----
const BADGE = 250; // 1 つの大きさ
const cols = [262, 512, 762];
const rows = [372, 652];
const badge = (i, svg) => {
  const cx = cols[i % 3];
  const cy = rows[Math.floor(i / 3)];
  // 少し縮めて、バッジ同士に隙間をあける
  return `<g transform="translate(${cx} ${cy}) scale(0.88) translate(${-BADGE / 2} ${-BADGE / 2})">${svg}</g>`;
};
const label = (text, x, y, size, fill) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${size}" fill="${fill}">${text}</text>`;

const html5 = `<path d="M30 18H220L202 208L125 232L48 208Z" fill="#E44D26"/><path d="M125 34V216L186 198L203 34Z" fill="#F16529"/>${label('5', 125, 160, 130, '#fff')}`;
const css3 = `<path d="M30 18H220L202 208L125 232L48 208Z" fill="#1572B6"/><path d="M125 34V216L186 198L203 34Z" fill="#33A9DC"/>${label('3', 125, 160, 130, '#fff')}`;
const js = `<rect width="${BADGE}" height="${BADGE}" rx="28" fill="#F7DF1E"/>${label('JS', 178, 228, 96, '#1b1b1b')}`;
const ts = `<rect width="${BADGE}" height="${BADGE}" rx="28" fill="#3178C6"/>${label('TS', 178, 228, 96, '#fff')}`;
const react = `<rect width="${BADGE}" height="${BADGE}" rx="40" fill="#20232A"/>
  <g transform="translate(125 125)" fill="none" stroke="#61DAFB" stroke-width="9">
    <ellipse rx="86" ry="33"/><ellipse rx="86" ry="33" transform="rotate(60)"/><ellipse rx="86" ry="33" transform="rotate(120)"/>
    <circle r="13" fill="#61DAFB" stroke="none"/>
  </g>`;
const next = `<circle cx="125" cy="125" r="118" fill="#000"/><circle cx="125" cy="125" r="118" fill="none" stroke="#fff" stroke-width="5" opacity="0.85"/>${label('N', 125, 170, 138, '#fff')}`;

const skillsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs><radialGradient id="g" cx="35%" cy="28%" r="90%"><stop offset="0" stop-color="#3fc7bf"/><stop offset="1" stop-color="#0f3a3a"/></radialGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  ${[html5, css3, js, ts, react, next].map((b, i) => badge(i, b)).join('\n  ')}
</svg>`;
await sharp(Buffer.from(skillsSvg)).webp({ quality: 90 }).toFile(`${OUT}/skills.webp`);

// ---- Contact：メールのアイコン（public/icons/gmail.svg と同じ形を白で） ----
const mailPath = readFileSync('public/icons/gmail.svg', 'utf8').match(/ d="([^"]+)"/)?.[1];
if (!mailPath) throw new Error('gmail.svg の path が読み取れません');
const scale = 4.4; // 元は 134 x 102
const contactSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs><radialGradient id="g" cx="35%" cy="28%" r="90%"><stop offset="0" stop-color="#f1c957"/><stop offset="1" stop-color="#8f6a14"/></radialGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  <g transform="translate(${(SIZE - 134 * scale) / 2} ${(SIZE - 102 * scale) / 2}) scale(${scale})"><path d="${mailPath}" fill="#ffffff"/></g>
</svg>`;
await sharp(Buffer.from(contactSvg)).webp({ quality: 90 }).toFile(`${OUT}/contact.webp`);

console.log('generated projects / skills / contact covers');
