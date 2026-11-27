/**
 * 守秘のため、クライアント案件の実際のスクリーンショットは載せない。代わりに、案件の種類を表す抽象的な絵を作る。
 * 使い方: node scripts/generate-anon-covers.mjs  →  public/projects/anon-*.webp（1200×1200）
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../public/projects/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const INK = '#11110f';
const INK2 = '#1c1c18';
const PAPER = '#eeeade';

const covers = {
  'anon-real-estate': { color: '#b8ff35', label: 'REAL ESTATE', art: () => {
    // 高さの違うビルが並ぶ
    const bars = [[120, 520], [300, 760], [480, 440], [660, 880], [840, 620]];
    return bars.map(([x, h]) => `<rect x="${x}" y="${1000 - h}" width="140" height="${h}" fill="${INK2}" stroke="#b8ff35" stroke-width="3"/>`
      + Array.from({ length: Math.floor(h / 90) }, (_, i) => `<rect x="${x + 28}" y="${1000 - h + 30 + i * 90}" width="30" height="36" fill="#b8ff35" opacity="0.55"/><rect x="${x + 82}" y="${1000 - h + 30 + i * 90}" width="30" height="36" fill="#b8ff35" opacity="0.3"/>`).join('')).join('');
  } },
  'anon-resort-hotel': { color: '#ff5c45', label: 'RESORT HOTEL', art: () => {
    // 太陽と波
    return `<circle cx="600" cy="470" r="210" fill="#ff5c45"/>`
      + Array.from({ length: 7 }, (_, i) => `<path d="M0 ${660 + i * 52} Q 150 ${620 + i * 52} 300 ${660 + i * 52} T 600 ${660 + i * 52} T 900 ${660 + i * 52} T 1200 ${660 + i * 52}" fill="none" stroke="${PAPER}" stroke-width="4" opacity="${1 - i * 0.12}"/>`).join('');
  } },
  'anon-housing-gallery': { color: '#7157ff', label: 'HOUSING GALLERY', art: () => {
    // 額縁と間取り図
    return `<rect x="200" y="220" width="800" height="600" fill="${INK2}" stroke="#7157ff" stroke-width="8"/>`
      + `<path d="M280 300 H 640 V 520 H 920 V 740 H 280 Z M 640 520 V 740 M 460 300 V 520 H 280" fill="none" stroke="${PAPER}" stroke-width="5"/>`
      + `<rect x="700" y="340" width="150" height="110" fill="#7157ff" opacity="0.7"/>`;
  } },
  'anon-luxury-rental': { color: '#eeeade', label: 'LUXURY RENTAL', art: () => {
    // 屋根の形を重ねる
    return Array.from({ length: 5 }, (_, i) => `<path d="M ${100 + i * 40} ${900 - i * 60} L 600 ${280 + i * 70} L ${1100 - i * 40} ${900 - i * 60} Z" fill="${i % 2 ? INK2 : INK}" stroke="${PAPER}" stroke-width="4" opacity="${1 - i * 0.12}"/>`).join('');
  } },
};

for (const [name, { color, label, art }] of Object.entries(covers)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <rect width="1200" height="1200" fill="${INK}"/>
    <rect x="40" y="40" width="1120" height="1120" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="3"/>
    ${art()}
    <text x="80" y="1130" font-family="Helvetica, Arial, sans-serif" font-size="44" letter-spacing="8" fill="${color}">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(`${OUT}${name}.webp`);
  console.log('wrote', `public/projects/${name}.webp`);
}
