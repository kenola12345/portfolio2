import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';
import { RECORD } from './config';

type Drawable = CanvasImageSource & { width: number; height: number };

const newCanvas = (size: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  return { canvas, ctx };
};

/**
 * 盤面の絵：黒い盤に、中央のラベルとしてアルバム画像を円形に貼ったテクスチャ。
 * 円柱のフタの UV は円形なので、正方形のテクスチャの内接円が盤面になる（盤の半径 = 1 辺の半分）
 */
export function createRecordTexture(cover: Texture): CanvasTexture {
  const size = RECORD.textureSize;
  const c = size / 2;
  const { canvas, ctx } = newCanvas(size);

  ctx.fillStyle = '#0b0b0d';
  ctx.fillRect(0, 0, size, size);

  // 溝の帯（ごくわずかに明るくして、無地の黒との差をつける）
  ctx.strokeStyle = 'rgb(255 255 255 / 0.045)';
  ctx.lineWidth = 1;
  for (let r = c * RECORD.grooveInner; r < c * RECORD.grooveOuter; r += 3) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ラベル：アルバム画像を、短辺に合わせて正方形に切り出し、円形に貼る
  const img = cover.image as Drawable;
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  const labelR = c * RECORD.labelRatio;
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, labelR, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(c, c);
  ctx.rotate(RECORD.labelRotation);
  if (RECORD.labelMirrorX) ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, side, side, -labelR, -labelR, labelR * 2, labelR * 2);
  ctx.restore();

  // ラベルの縁と、中央の穴
  ctx.strokeStyle = 'rgb(0 0 0 / 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c, c, labelR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#050506';
  ctx.beginPath();
  ctx.arc(c, c, c * 0.022, 0, Math.PI * 2);
  ctx.fill();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

let grooveTexture: CanvasTexture | null = null;

/**
 * 溝のバンプマップ（凹凸）。全レコードで 1 枚を共有する。
 * 細い同心円を交互に明暗にして、光が当たると溝が輪になって見えるようにする
 */
export function getGrooveTexture(): CanvasTexture {
  if (grooveTexture) return grooveTexture;
  const size = RECORD.textureSize;
  const c = size / 2;
  const { canvas, ctx } = newCanvas(size);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  ctx.lineWidth = RECORD.grooveStep * 0.55;
  let i = 0;
  for (let r = c * RECORD.grooveInner; r < c * RECORD.grooveOuter; r += RECORD.grooveStep) {
    ctx.strokeStyle = i++ % 2 ? '#a4a4a4' : '#5c5c5c';
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 曲と曲の間の、少し広い無地の帯を 2 本
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 7;
  for (const ratio of [0.62, 0.8]) {
    ctx.beginPath();
    ctx.arc(c, c, c * ratio, 0, Math.PI * 2);
    ctx.stroke();
  }

  grooveTexture = new CanvasTexture(canvas);
  grooveTexture.anisotropy = 8;
  return grooveTexture;
}
