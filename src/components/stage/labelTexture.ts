import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';
import { LABEL } from './config';

type Drawable = CanvasImageSource & { width: number; height: number };

/**
 * GLB の元テクスチャの上に、アルバム画像を中央ラベルとして円形に描き込んだテクスチャを作る。
 * A 面・B 面の両方のラベルを覆う。モデルのジオメトリや他のマップはそのまま共有できる。
 */
export function createLabelTexture(base: Texture, cover: Texture): CanvasTexture {
  const size = LABEL.textureSize;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');

  ctx.drawImage(base.image as Drawable, 0, 0, size, size);

  const img = cover.image as Drawable;
  // 画像の短辺に合わせて正方形に切り出す（object-fit: cover と同じ考え方）
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  const r = LABEL.radius;

  for (const { x, y } of LABEL.centers) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(x, y);
    ctx.rotate(LABEL.rotation);
    if (LABEL.mirrorX) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, side, side, -r, -r, r * 2, r * 2);
    ctx.restore();

    // スピンドルの穴
    ctx.beginPath();
    ctx.arc(x, y, LABEL.holeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  // glTF のテクスチャは flipY=false 前提なので合わせる
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
