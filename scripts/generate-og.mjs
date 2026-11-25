/**
 * SNS でリンクを共有したときに出る画像（public/og.png、1200 x 630）を作る。
 *   node scripts/generate-og.mjs
 * 右に顔写真（public/covers/artist.webp）、左に名前と肩書き。名前や肩書きを変えたら、もう一度実行する。
 */
import sharp from 'sharp';

const W = 1200;
const H = 630;
const PHOTO = 630; // 右側の写真の一辺
const FONT = "Futura, 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";

const photo = await sharp('public/covers/artist.webp').resize(PHOTO, PHOTO, { fit: 'cover' }).png().toBuffer();

// 背景：暗い地に、左上と右下にごく淡い光
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="60%"><stop offset="0" stop-color="#2b4cff" stop-opacity="0.16"/><stop offset="1" stop-color="#2b4cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="85%" cy="100%" r="55%"><stop offset="0" stop-color="#b13cff" stop-opacity="0.12"/><stop offset="1" stop-color="#b13cff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0b0d"/><rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/>
</svg>`;

// 写真の左端を背景になじませるグラデーション
const fade = `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO}" height="${H}">
  <defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#0b0b0d" stop-opacity="1"/><stop offset="0.28" stop-color="#0b0b0d" stop-opacity="0"/></linearGradient></defs>
  <rect width="${PHOTO}" height="${H}" fill="url(#f)"/>
</svg>`;

const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <g font-family="${FONT}" fill="#ffffff">
    <text x="72" y="92" font-size="26" font-weight="700" letter-spacing="7" fill-opacity="0.6">PORTFOLIO</text>
    <text x="72" y="300" font-size="104" font-weight="800">Kentaro</text>
    <text x="72" y="408" font-size="104" font-weight="800">Oshimoto</text>
    <text x="76" y="486" font-size="36" font-weight="500" fill-opacity="0.72">Full Stack Engineer</text>
    <text x="76" y="534" font-size="30" font-weight="500" fill-opacity="0.5">Tokyo, Japan</text>
  </g>
</svg>`;

await sharp(Buffer.from(background))
  .composite([
    { input: photo, left: W - PHOTO, top: 0 },
    { input: Buffer.from(fade), left: W - PHOTO, top: 0 },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png');

console.log('wrote public/og.png');
