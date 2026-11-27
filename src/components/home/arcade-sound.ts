/**
 * アーケードゲームの効果音。音源ファイルは使わず、Web Audio API で矩形波・三角波を鳴らして作る（レトロな音）。
 * ブラウザは「ユーザーの操作のあと」でしか音を出せないので、AudioContext はゲーム開始のクリックで作る。
 */

export type Sfx = 'jump' | 'light' | 'heavy' | 'hit' | 'smash' | 'ko' | 'round' | 'win' | 'over';

const MUTE_KEY = 'arcade-muted';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  /* 保存できない環境では、毎回音ありで始まる */
}

/** 開始のクリックの中で呼ぶ。2 回目以降は何もしない */
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export const isMuted = () => muted;

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* 保存できなくても、このページの間は効く */
  }
}

/** 周波数を from → to へなめらかに動かす 1 音 */
function tone(type: OscillatorType, from: number, to: number, start: number, length: number, volume = 0.06) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + length);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + length + 0.02);
}

export function play(name: Sfx) {
  if (muted || !ctx || ctx.state !== 'running') return;
  switch (name) {
    case 'jump':
      tone('square', 280, 560, 0, 0.1, 0.04);
      break;
    case 'light': // 弱攻撃：短くて軽い
      tone('square', 520, 300, 0, 0.06, 0.04);
      break;
    case 'heavy': // 強攻撃：低くて重い
      tone('sawtooth', 240, 90, 0, 0.14, 0.06);
      break;
    case 'hit':
      tone('triangle', 200, 80, 0, 0.1, 0.12);
      tone('square', 900, 400, 0, 0.04, 0.04);
      break;
    case 'smash': // 大きく吹き飛ばしたとき
      tone('triangle', 160, 40, 0, 0.3, 0.18);
      tone('sawtooth', 700, 120, 0, 0.18, 0.06);
      break;
    case 'ko':
      tone('sawtooth', 420, 50, 0, 0.5, 0.08);
      break;
    case 'round':
      tone('square', 392, 392, 0, 0.1);
      tone('square', 523, 523, 0.12, 0.1);
      tone('square', 784, 784, 0.24, 0.22);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, i * 0.11, 0.2));
      tone('square', 1047, 1047, 0.5, 0.4);
      break;
    case 'over':
      [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.95, i * 0.18, 0.28, 0.1));
      break;
  }
}
