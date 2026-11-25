import type { Group } from 'three';
import type { HomeLayoutKey } from './config';

/**
 * カメラと DOM の対応。CameraRig が毎回書き込み、レコードが読む。
 * worldPerPx = z=0 の面で 1 CSS px が何メートルか（ページのスロットの位置・大きさをワールドに直す係数）
 */
export const view = {
  worldPerPx: 0.002,
  visibleHeight: 2,
  visibleWidth: 3,
  /** いま使っているホームの配置（画面の縦横比で決まる） */
  layoutKey: 'wide' as HomeLayoutKey,
};

/** ホームの台（プレーヤーとジャケットを載せた傾いたグループ）。レコードがここを基準に動く */
export const home: { group: Group | null } = { group: null };
