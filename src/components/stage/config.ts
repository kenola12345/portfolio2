/** 3D ステージの調整値。数値はコンポーネントに直書きせずここにまとめる */

/** レコードの GLB（Sketchfab「Vinyl Record」by liamo123） */
export const RECORD_MODEL_URL = '/models/vinyl_record.glb';

/**
 * GLB のノード変換を合計すると X 軸 -90°（盤面が真上 +Y を向く）になっているため、
 * +90° 戻してカメラ（+Z）に盤面を向ける
 */
export const RECORD_FACING_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];

/**
 * GLB のベースカラーテクスチャ（1024px）上の中央ラベルの位置。
 * テクスチャには A 面（上半分）と B 面（下半分）の 2 枚の盤面が並んでいる。
 * 元のラベルには他人の文字が入っているので、半径は少し大きめにして必ず覆う。
 */
export const LABEL = {
  textureSize: 1024,
  centers: [
    { x: 257, y: 257 },
    { x: 257, y: 770 },
  ],
  radius: 90,
  /** ラベル画像の回転（ラジアン）。モデルの UV の向きに合わせる */
  rotation: 0,
  /** モデルの UV が左右反転しているため、画像も反転して描くと正しい向きで見える */
  mirrorX: true,
  /** 中央の穴の半径（px） */
  holeRadius: 6,
} as const;

/** ショーケース（仮の棚）の配置 */
export const SHOWCASE = {
  spacing: 2.3,
  /** 自転の速さ（ラジアン/秒）。約 8rpm 相当より少し遅め */
  spinSpeed: 0.6,
  /** 盤面を少し寝かせて立体感を出す */
  tiltX: -0.35,
} as const;
