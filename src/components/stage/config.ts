/** 3D ステージの調整値。数値はコンポーネントに直書きせずここにまとめる */

/** レコードの GLB（Sketchfab「Vinyl Record」by liamo123, Sketchfab Standard License） */
export const RECORD_MODEL_URL = '/models/vinyl_record.glb';

/**
 * レコードプレーヤーの GLB（Sketchfab「Record player」by Temmie_Dola, CC-BY-4.0）。
 * 元は約 64MB。scripts/optimize-record-player.mjs でジャケット等を除き 1024px の webp にしてある
 */
export const RECORD_PLAYER_URL = '/models/record_player.glb';

/**
 * GLB のノード変換を合計すると X 軸 -90°（盤面が真上 +Y を向く）になっているため、
 * +90° 戻してカメラ（+Z）に盤面を向ける
 */
export const RECORD_FACING_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];

/** GLB のディスク半径（モデル単位）。ワールドの大きさへの換算に使う */
export const RECORD_MODEL_RADIUS = 0.949;

/** レコードの縁の光の輪（モデル単位、ディスク半径 0.949 の外周に重ねる）と映り込みの強さ */
export const RECORD_RIM = {
  inner: 0.925,
  outer: 0.955,
  color: '#d9dde6',
  opacity: 0.32,
  envIntensity: 2.2,
} as const;

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

/**
 * ホーム（レコードプレーヤー + ジャケット + レコード）の配置。単位はメートル。
 * 台（XZ 平面、Y が上）の上に並べ、全体を X 軸まわりに傾けて斜め上から見下ろす形にする。
 */
export const HOME = {
  /** カメラの画角（度）。z=0 の面での見える範囲から距離を逆算する */
  fov: 30,
  /** 台を手前に起こす角度（ラジアン）。大きいほど真上から見る */
  tilt: 0.95,
  sleeve: { size: 0.31, thickness: 0.006, inset: 0.012 },
  /** 12 インチ盤の半径（メートル） */
  recordRadius: 0.151,
  /** ジャケットの縁から盤がはみ出す長さ（メートル） */
  peek: { rest: 0.08, hover: 0.15, pulled: 0.27 },
  /** クリックで引き出したとき、盤を持ち上げる高さ */
  lift: 0.09,
  /** プレーヤーは主役なので実寸より少し大きく見せる */
  playerScale: 1.35,
  /**
   * 画面の縦横比に合わせた 2 つの配置。wide = PC など横長、tall = スマホなど縦長。
   *  - viewHeight / viewWidth: 画面に必ず収めたい範囲（メートル、z=0 の面）。足りない側に合わせてカメラを引く
   *  - offset: 全体の中心合わせ（台の座標系）
   *  - sleeves: 各ジャケットの位置と、盤が出てくる向き（台の XZ 平面での単位ベクトル）
   */
  layouts: {
    wide: {
      viewHeight: 1.6,
      viewWidth: 2.55,
      offset: [0, 0, -0.35] as [number, number, number],
      playerPosition: [0, 0, -0.05] as [number, number, number],
      sleeves: {
        artist: { x: -0.8, z: 0.05, dir: [-1, 0] },
        projects: { x: -0.42, z: 0.62, dir: [0, 1] },
        work: { x: 0, z: 0.82, dir: [0, 1] },
        skills: { x: 0.42, z: 0.62, dir: [0, 1] },
        contact: { x: 0.8, z: 0.05, dir: [1, 0] },
      } as Record<string, { x: number; z: number; dir: [number, number] }>,
    },
    tall: {
      viewHeight: 2.5,
      viewWidth: 1.3,
      offset: [0, 0, -0.85] as [number, number, number],
      playerPosition: [0, 0, -0.1] as [number, number, number],
      sleeves: {
        artist: { x: -0.4, z: 0.5, dir: [0, 1] },
        projects: { x: 0.4, z: 0.5, dir: [0, 1] },
        work: { x: -0.4, z: 1.05, dir: [0, 1] },
        skills: { x: 0.4, z: 1.05, dir: [0, 1] },
        contact: { x: 0, z: 1.6, dir: [0, 1] },
      } as Record<string, { x: number; z: number; dir: [number, number] }>,
    },
  },
} as const;

export type HomeLayoutKey = keyof typeof HOME.layouts;

/** 縦横比から配置を選ぶ（縦長ならスマホ向けの tall） */
export const layoutKeyFor = (aspect: number): HomeLayoutKey => (aspect < 1 ? 'tall' : 'wide');

/** ステージの動き */
export const STAGE = {
  /** クリックして盤を引き出してからページ遷移を始めるまで（ms） */
  pullMs: 480,
  /** 位置・向き・大きさの追従の速さ。大きいほど速い（指数減衰） */
  damp: 8,
  /** 自転の速さ（ラジアン/秒） */
  spinPulled: 1.4,
  spinHover: 0.6,
  spinSlot: 0.9,
  /** アルバムページで盤面を少し傾けて立体感を出す（ラジアン） */
  slotTilt: 0.16,
  /** ローディング完了後、画面を開くまでの待ち（ms）。追加の読み込みが始まったら取り消す */
  loadSettleMs: 450,
  /** 読み込みが終わらなくてもローディングを閉じるまでの上限（ms） */
  loadTimeoutMs: 15000,
} as const;
