/**
 * アーケードゲームの効果音。音源ファイルは使わず、Web Audio API で矩形波・三角波を鳴らして作る（レトロな音）。
 * ブラウザは「ユーザーの操作のあと」でしか音を出せないので、AudioContext はゲーム開始のクリックで作る。
 */

export type Sfx = 'jump' | 'coin' | 'stomp' | 'hurt' | 'win' | 'over';

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
      tone('square', 280, 620, 0, 0.14);
      break;
    case 'coin':
      tone('square', 988, 988, 0, 0.07);
      tone('square', 1319, 1319, 0.07, 0.16);
      break;
    case 'stomp':
      tone('triangle', 220, 70, 0, 0.16, 0.12);
      break;
    case 'hurt':
      tone('sawtooth', 420, 60, 0, 0.45, 0.08);
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
