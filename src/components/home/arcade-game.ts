/**
 * アーケード筐体の画面で遊べる、小さな 2D 対戦格闘ゲーム（canvas 2D だけ。外部ライブラリなし）。
 * スマブラ（Melee）のような「足場の上で戦い、ダメージが溜まるほど遠くへ吹き飛ばされ、画面外に出たら 1 ストック失う」
 * タイプ。攻撃は Footsies のように 2 種類だけ：弱（速い・短い）と強（遅い・長い・大きく飛ばす）。
 *
 * ルール：使えるキャラは 1 人。CPU と戦い、勝つと次の相手へ。3 人倒すとボス。ライフ（ストック）は 3 つで、
 * 1 回の挑戦の間ずっと続く。ボスを倒せばクリア。
 *
 * 論理解像度 240×240 を CSS で拡大して表示する（ドット絵風）。動きは 60 フレーム/秒の固定刻みで進める。
 */

export const VIEW = 240;

/** 本ステージ（床）と、空中の足場（下からすり抜けて、上に乗れる） */
const STAGE = { x0: 40, x1: 200, y: 168 };
const SOFT = { x0: 94, x1: 146, y: 118 };
/** この外に出たらやられる（画面よりずっと外） */
const BLAST = { left: -60, right: 300, top: -110, bottom: 300 };

const C = {
  player: '#b8ff35',
  playerDark: '#618f14',
  sky: '#0f1512',
  star: '#b8ff3522',
  ground: '#2c2c27',
  groundTop: '#b8ff35',
  platform: '#3b3b35',
  paper: '#eeeade',
  coral: '#ff5c45',
  violet: '#7157ff',
  hud: '#b8ff35',
} as const;

export type GameState = 'ready' | 'playing' | 'won' | 'over';
export type SoundName = 'jump' | 'light' | 'heavy' | 'hit' | 'smash' | 'ko' | 'round' | 'win' | 'over';
export type InputKey = 'left' | 'right' | 'jump' | 'down' | 'light' | 'heavy';

export interface GameEvents {
  onSound?: (name: SoundName) => void;
  /** 得点・ライフの表示を更新するとき */
  onHud?: (score: number, lives: number) => void;
  /** クリアまたはゲームオーバーになったとき */
  onEnd: (result: 'won' | 'over', score: number) => void;
}

export interface Game {
  start: () => void;
  stop: () => void;
  /** キーボードや、筐体のスティック・ボタンから操作を送る */
  setInput: (key: InputKey, down: boolean) => void;
  setPaused: (paused: boolean) => void;
  /** テスト用 */
  snapshot: () => Snapshot;
  /** テスト用：1 フレームだけ進める */
  step: () => void;
}

type Phase = 'intro' | 'fight' | 'clear' | 'over' | 'won';

export interface Snapshot {
  phase: Phase;
  round: number;
  lives: number;
  score: number;
  player: { x: number; y: number; percent: number; onGround: boolean; atk: string | null; hitstun: number };
  cpu: { x: number; y: number; percent: number; stocks: number };
}

interface Input {
  left: boolean;
  right: boolean;
  jump: boolean;
  down: boolean;
  light: boolean;
  heavy: boolean;
}
const noInput = (): Input => ({ left: false, right: false, jump: false, down: false, light: false, heavy: false });

/** 攻撃 2 種。startup = 発生まで / active = 持続 / recovery = 硬直（フレーム）。reach = 届く距離（px） */
const MOVES = {
  light: { startup: 4, active: 4, recovery: 9, reach: 15, hitH: 10, yOff: 15, dmg: 4, base: 1.7, scale: 0.02, stun: 12, stop: 3 },
  heavy: { startup: 13, active: 5, recovery: 21, reach: 27, hitH: 12, yOff: 11, dmg: 12, base: 3.1, scale: 0.05, stun: 22, stop: 7 },
} as const;
type MoveKind = keyof typeof MOVES;

interface Fighter {
  x: number; // 足元の中心
  y: number; // 足元
  w: number;
  h: number;
  scale: number;
  vx: number;
  vy: number;
  face: 1 | -1;
  onGround: boolean;
  jumps: number;
  percent: number;
  stocks: number;
  hitstun: number;
  invuln: number;
  /** 下を押して、空中の足場をすり抜けている残りフレーム数 */
  drop: number;
  /** やられて、復活を待っているフレーム数（0 = 生きている） */
  respawn: number;
  out: boolean;
  atk: { kind: MoveKind; t: number; hit: boolean } | null;
  prev: Input;
  color: string;
  dark: string;
  /** 受けたときの吹き飛びやすさ（ボスは重い） */
  kbMul: number;
  /** 与えるダメージの倍率 */
  dmgMul: number;
  flash: number;
  ai: { next: number; hold: Input } | null;
}

interface Opponent {
  name: string;
  stocks: number;
  /** 反応の遅さ（フレーム）。小さいほど強い */
  react: number;
  /** 攻める頻度（0〜1） */
  aggr: number;
  color: string;
  dark: string;
  scale: number;
  kbMul: number;
  dmgMul: number;
}

const OPPONENTS: Opponent[] = [
  { name: 'CPU 1', stocks: 2, react: 26, aggr: 0.45, color: C.coral, dark: '#9a2e21', scale: 1, kbMul: 1, dmgMul: 0.9 },
  { name: 'CPU 2', stocks: 2, react: 17, aggr: 0.62, color: C.paper, dark: '#8a877d', scale: 1, kbMul: 1, dmgMul: 1 },
  { name: 'CPU 3', stocks: 2, react: 11, aggr: 0.78, color: C.violet, dark: '#3a2a99', scale: 1, kbMul: 0.95, dmgMul: 1.1 },
  { name: 'BOSS', stocks: 3, react: 7, aggr: 0.9, color: '#ff2e63', dark: '#7a0f2e', scale: 1.28, kbMul: 0.72, dmgMul: 1.35 },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function createGame(canvas: HTMLCanvasElement, events: GameEvents): Game {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  canvas.width = VIEW;
  canvas.height = VIEW;
  const g = ctx;

  const input = noInput();
  let player: Fighter | undefined;
  let cpu: Fighter | undefined;
  let round = 0;
  let score = 0;
  let phase: Phase = 'intro';
  let phaseT = 0;
  let hitstop = 0;
  let shake = 0;
  let frame = 0;
  let state: GameState = 'ready';
  let raf = 0;
  let last = 0;
  let acc = 0;
  let paused = false;
  let particles: Particle[] = [];

  const rand = () => Math.random();

  function makeFighter(color: string, dark: string, scale = 1): Fighter {
    return {
      x: 120,
      y: STAGE.y,
      w: Math.round(12 * scale),
      h: Math.round(22 * scale),
      scale,
      vx: 0,
      vy: 0,
      face: 1,
      onGround: true,
      jumps: 2,
      percent: 0,
      stocks: 3,
      hitstun: 0,
      invuln: 0,
      drop: 0,
      respawn: 0,
      out: false,
      atk: null,
      prev: noInput(),
      color,
      dark,
      kbMul: 1,
      dmgMul: 1,
      flash: 0,
      ai: null,
    };
  }

  function place(f: Fighter, x: number, face: 1 | -1) {
    f.x = x;
    f.y = STAGE.y;
    f.vx = 0;
    f.vy = 0;
    f.face = face;
    f.onGround = true;
    f.jumps = 2;
    f.hitstun = 0;
    f.atk = null;
  }

  function startRound() {
    const o = OPPONENTS[round];
    const c = makeFighter(o.color, o.dark, o.scale);
    c.stocks = o.stocks;
    c.kbMul = o.kbMul;
    c.dmgMul = o.dmgMul;
    c.ai = { next: 0, hold: noInput() };
    cpu = c;
    const p = player!;
    p.percent = 0;
    place(p, 88, 1);
    place(c, 152, -1);
    p.invuln = 0;
    particles = [];
    phase = 'intro';
    phaseT = 0;
    events.onSound?.('round');
    events.onHud?.(score, p.stocks);
  }

  function reset() {
    player = makeFighter(C.player, C.playerDark);
    player.stocks = 3;
    round = 0;
    score = 0;
    frame = 0;
    startRound();
  }

  // ---------- 判定 ----------
  type Box = { x: number; y: number; w: number; h: number };
  const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const hurtbox = (f: Fighter): Box => ({ x: f.x - f.w / 2, y: f.y - f.h, w: f.w, h: f.h });

  function hitbox(f: Fighter): Box | null {
    if (!f.atk) return null;
    const m = MOVES[f.atk.kind];
    if (f.atk.t <= m.startup || f.atk.t > m.startup + m.active) return null;
    const reach = m.reach * f.scale;
    const x = f.face > 0 ? f.x + f.w / 2 - 2 : f.x - f.w / 2 + 2 - reach;
    return { x, y: f.y - m.yOff * f.scale - m.hitH / 2, w: reach, h: m.hitH };
  }

  function spark(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const s = 0.8 + rand() * 2;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4, life: 14 + Math.floor(rand() * 10), color });
    }
  }

  function tryHit(att: Fighter, def: Fighter) {
    if (!att.atk || att.atk.hit || def.out || def.respawn > 0 || def.invuln > 0) return;
    const box = hitbox(att);
    if (!box || !overlap(box, hurtbox(def))) return;
    const m = MOVES[att.atk.kind];
    att.atk.hit = true;
    def.percent += m.dmg * att.dmgMul;
    const kb = (m.base + def.percent * m.scale) * def.kbMul;
    def.vx = att.face * kb;
    def.vy = -(kb * 0.45 + 0.9);
    def.onGround = false;
    def.face = (att.face * -1) as 1 | -1;
    def.hitstun = Math.round(m.stun + kb * 2.5);
    def.atk = null;
    def.flash = 6;
    hitstop = Math.max(hitstop, m.stop);
    shake = att.atk.kind === 'heavy' ? 5 : 2;
    spark(def.x, def.y - def.h * 0.55, '#ffffff', att.atk.kind === 'heavy' ? 9 : 5);
    events.onSound?.(kb > 5.5 ? 'smash' : att.atk.kind === 'heavy' ? 'heavy' : 'hit');
  }

  // ---------- 1 体ぶんの動き ----------
  function control(f: Fighter, inp: Input) {
    const pressed = (k: InputKey) => inp[k] && !f.prev[k];
    const canAct = f.hitstun <= 0 && !f.atk && f.respawn <= 0 && !f.out;

    if (canAct) {
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      const accel = f.onGround ? 0.45 : 0.13;
      const max = f.onGround ? 1.55 : 1.35;
      if (dir) {
        f.vx += dir * accel;
        f.vx = Math.max(-max, Math.min(max, f.vx));
        f.face = dir > 0 ? 1 : -1;
      }
      // 空中の足場の上で「下」を押すと、足場をすり抜けて降りる
      if (inp.down && f.onGround && f.y <= SOFT.y + 0.5 && f.y >= SOFT.y - 0.5 && f.x > SOFT.x0 && f.x < SOFT.x1) {
        f.drop = 14;
        f.onGround = false;
        f.vy = Math.max(f.vy, 1);
      }
      if (pressed('jump') && f.jumps > 0) {
        f.vy = f.onGround ? -4.7 : -4.2;
        f.jumps--;
        f.onGround = false;
        events.onSound?.('jump');
      }
      if (pressed('light')) f.atk = { kind: 'light', t: 0, hit: false };
      else if (pressed('heavy')) f.atk = { kind: 'heavy', t: 0, hit: false };
      if (f.atk) events.onSound?.(f.atk.kind === 'heavy' ? 'heavy' : 'light');
    }
    f.prev = { ...inp };
  }

  function physics(f: Fighter) {
    if (f.respawn > 0 || f.out) return;
    if (f.invuln > 0) f.invuln--;
    if (f.drop > 0) f.drop--;
    if (f.flash > 0) f.flash--;

    // 攻撃中は、地上ではその場でほぼ止まる
    if (f.atk) {
      f.atk.t++;
      const m = MOVES[f.atk.kind];
      if (f.atk.t >= m.startup + m.active + m.recovery) f.atk = null;
      if (f.onGround) f.vx *= 0.6;
    }
    if (f.hitstun > 0) f.hitstun--;

    // 摩擦
    if (f.onGround && f.hitstun <= 0) f.vx *= 0.8;
    else f.vx *= f.onGround ? 0.9 : 0.992;
    if (Math.abs(f.vx) < 0.02) f.vx = 0;

    f.vy = Math.min(f.vy + 0.23, 5.4);
    const prevY = f.y;
    f.x += f.vx;
    f.y += f.vy;

    // 足場に乗る（上から降りてきたときだけ。下からはすり抜ける）
    f.onGround = false;
    if (f.vy >= 0) {
      for (const p of [STAGE, SOFT]) {
        if (p === SOFT && f.drop > 0) continue; // すり抜け中
        const over = f.x + f.w / 2 > p.x0 && f.x - f.w / 2 < p.x1;
        if (over && prevY <= p.y + 0.5 && f.y >= p.y) {
          f.y = p.y;
          f.vy = 0;
          f.onGround = true;
          f.jumps = 2;
          break;
        }
      }
    }
  }

  // ---------- CPU ----------
  function aiInput(c: Fighter, p: Fighter, o: Opponent): Input {
    const brain = c.ai!;
    if (frame < brain.next) {
      // 1 回だけ押すボタンは、決めたフレームだけ true にして、すぐ戻す
      const held = { ...brain.hold };
      brain.hold.jump = false;
      brain.hold.light = false;
      brain.hold.heavy = false;
      return held;
    }
    brain.next = frame + Math.max(3, Math.round(o.react * (0.6 + rand() * 0.8)));
    const h = noInput();
    const dx = p.x - c.x;
    const dist = Math.abs(dx);
    const toward = dx > 0 ? 'right' : 'left';
    const away = dx > 0 ? 'left' : 'right';
    const overStage = c.x > STAGE.x0 - 2 && c.x < STAGE.x1 + 2;

    // 場外：中央へ戻る（ジャンプで復帰）
    if (!overStage || c.y > STAGE.y + 6) {
      const center = (STAGE.x0 + STAGE.x1) / 2;
      h[c.x < center ? 'right' : 'left'] = true;
      if (c.vy > 0.5 && c.jumps > 0 && c.y > STAGE.y - 4) h.jump = true;
      brain.hold = h;
      return h;
    }

    const lm = MOVES.light.reach * c.scale + 6;
    const hm = MOVES.heavy.reach * c.scale + 6;
    const pm = p.atk ? MOVES[p.atk.kind] : null;
    const playerRecovering = p.hitstun > 0 || (pm && p.atk && p.atk.t > pm.startup + pm.active);
    const edgeRight = c.x > STAGE.x1 - 10;
    const edgeLeft = c.x < STAGE.x0 + 10;

    if (playerRecovering && dist < hm) {
      // 隙を見て反撃（近ければ弱、少し遠ければ強）
      if (rand() < 0.4 + o.aggr * 0.55) h[dist < lm ? 'light' : 'heavy'] = true;
      else h[toward] = true;
    } else if (dist < lm && rand() < o.aggr) {
      h.light = true;
    } else if (dist < hm && dist >= lm && rand() < o.aggr * 0.55) {
      h.heavy = true;
    } else if (dist > hm + 12) {
      h[toward] = rand() < 0.5 + o.aggr * 0.5;
    } else {
      // 間合いの駆け引き：近づく・下がる・待つ
      const r = rand();
      if (r < 0.35) h[toward] = true;
      else if (r < 0.65) h[away] = true;
    }
    if (p.y < c.y - 34 && rand() < 0.35 * o.aggr) h.jump = true;
    // 空中の足場に乗っていて、相手が下にいるときは、「下」を押して足場から降りる（ときどき、理由なく降りることもある）
    const onSoft = c.onGround && Math.abs(c.y - SOFT.y) < 1;
    if (onSoft && ((p.y > c.y + 20 && rand() < 0.5 + o.aggr * 0.5) || rand() < 0.05)) h.down = true;
    // 場の端から落ちない
    if ((h.right && edgeRight) || (h.left && edgeLeft)) {
      h.right = false;
      h.left = false;
    }
    brain.hold = h;
    return h;
  }

  // ---------- やられ・復活 ----------
  function checkKO(f: Fighter, isPlayer: boolean) {
    if (f.out || f.respawn > 0) return;
    if (f.x < BLAST.left || f.x > BLAST.right || f.y > BLAST.bottom || f.y < BLAST.top) {
      f.stocks--;
      events.onSound?.('ko');
      shake = 8;
      spark(Math.max(10, Math.min(230, f.x)), Math.max(10, Math.min(230, f.y)), f.color, 14);
      if (!isPlayer) score += 300;
      events.onHud?.(score, player!.stocks);
      f.out = f.stocks <= 0;
      if (!f.out) f.respawn = 70;
      f.atk = null;
    }
  }

  function respawn(f: Fighter) {
    f.percent = 0;
    place(f, 120, f.face);
    f.y = SOFT.y - 60;
    f.onGround = false;
    f.invuln = 110;
  }

  // ---------- 全体の進行 ----------
  function update() {
    const p = player!;
    const c = cpu!;
    frame++;
    phaseT++;

    if (phase === 'intro') {
      if (phaseT >= 100) {
        phase = 'fight';
        phaseT = 0;
      }
      return;
    }
    if (phase === 'clear') {
      if (phaseT >= 120) {
        round++;
        if (round >= OPPONENTS.length) {
          score += p.stocks * 500;
          phase = 'won';
          phaseT = 0;
          events.onHud?.(score, p.stocks);
          events.onSound?.('win');
          state = 'won';
          events.onEnd('won', score);
        } else {
          startRound();
        }
      }
      return;
    }
    if (phase === 'over' || phase === 'won') return;

    // 戦闘
    const o = OPPONENTS[round];
    control(p, input);
    control(c, aiInput(c, p, o));
    physics(p);
    physics(c);
    tryHit(p, c);
    tryHit(c, p);
    checkKO(p, true);
    checkKO(c, false);

    for (const f of [p, c]) {
      if (f.respawn > 0) {
        f.respawn--;
        if (f.respawn === 0) respawn(f);
      }
    }
    // 向き合う（攻撃していないとき）
    for (const [a, b] of [
      [p, c],
      [c, p],
    ] as const) {
      if (a.onGround && !a.atk && a.hitstun <= 0 && Math.abs(a.vx) < 0.3 && a.respawn <= 0) a.face = b.x >= a.x ? 1 : -1;
    }

    if (c.out) {
      score += 500;
      events.onHud?.(score, p.stocks);
      phase = 'clear';
      phaseT = 0;
      events.onSound?.('win');
    } else if (p.out) {
      phase = 'over';
      phaseT = 0;
      events.onSound?.('over');
      state = 'over';
      events.onEnd('over', score);
    }

    for (const q of particles) {
      q.x += q.vx;
      q.y += q.vy;
      q.vy += 0.08;
      q.life--;
    }
    particles = particles.filter((q) => q.life > 0);
  }

  // ---------- 描画 ----------
  function drawFighter(f: Fighter) {
    if (f.out || f.respawn > 0) return;
    if (f.invuln > 0 && Math.floor(frame / 4) % 2 === 0) return;
    const s = f.scale;
    const d = f.face;
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    const body = f.flash > 0 ? '#ffffff' : f.color;
    const dark = f.flash > 0 ? '#cccccc' : f.dark;

    const atk = f.atk;
    const m = atk ? MOVES[atk.kind] : null;
    const windup = !!(atk && m && atk.t <= m.startup);
    const active = !!(atk && m && atk.t > m.startup && atk.t <= m.startup + m.active);

    const hurt = f.hitstun > 0;
    const lean = hurt ? -d * 2 : windup ? -d : 0;

    // 脚
    g.fillStyle = dark;
    const step = f.onGround && Math.abs(f.vx) > 0.4 ? Math.floor(frame / 5) % 2 : 0;
    g.fillRect(x - 5 * s + lean, y - 8 * s, 4 * s, 8 * s - (step ? 2 : 0));
    g.fillRect(x + 1 * s + lean, y - 8 * s, 4 * s, 8 * s - (step ? 0 : 2));
    // 胴
    g.fillStyle = body;
    g.fillRect(x - 6 * s + lean, y - 17 * s, 12 * s, 10 * s);
    // 頭
    g.fillRect(x - 4 * s + lean * 1.4, y - 24 * s, 9 * s, 7 * s);
    g.fillStyle = C.sky;
    g.fillRect(x + (d > 0 ? 1 : -3) * s + lean * 1.4, y - 21 * s, 3 * s, 2 * s);
    // 攻撃（腕と脚）
    if (atk && m) {
      const reach = m.reach * s;
      g.fillStyle = body;
      if (atk.kind === 'light') {
        const len = active ? reach : windup ? 3 * s : reach * 0.5;
        const px = d > 0 ? x + 4 * s : x - 4 * s - len;
        g.fillRect(px, y - 15 * s, len, 4 * s);
        g.fillStyle = dark;
        g.fillRect(d > 0 ? px + len - 3 * s : px, y - 16 * s, 3 * s, 6 * s);
      } else {
        const len = active ? reach : windup ? 4 * s : reach * 0.45;
        const px = d > 0 ? x + 3 * s : x - 3 * s - len;
        g.fillRect(px, y - 11 * s, len, 5 * s);
        g.fillStyle = dark;
        g.fillRect(d > 0 ? px + len - 4 * s : px, y - 12 * s, 4 * s, 7 * s);
      }
      if (active) {
        g.fillStyle = '#ffffff55';
        const ex = d > 0 ? x + 4 * s : x - 4 * s - reach;
        g.fillRect(ex, y - (m.yOff + 6) * s, reach, 2);
      }
    } else {
      g.fillStyle = dark;
      g.fillRect(d > 0 ? x + 4 * s + lean : x - 7 * s + lean, y - 15 * s, 3 * s, 6 * s);
    }
  }

  function drawText(text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') {
    g.font = `bold ${size}px "DM Mono", monospace`;
    g.textAlign = align;
    g.fillStyle = color;
    g.fillText(text, x, y);
  }

  function draw() {
    const p = player;
    const c = cpu;
    const sx = shake > 0 ? Math.round((rand() - 0.5) * shake) : 0;
    const sy = shake > 0 ? Math.round((rand() - 0.5) * shake) : 0;
    g.save();
    g.translate(sx, sy);
    g.fillStyle = C.sky;
    g.fillRect(-10, -10, VIEW + 20, VIEW + 20);

    g.fillStyle = C.star;
    for (let i = 0; i < 26; i++) g.fillRect((i * 83) % 240, (i * 47) % 140, 2, 2);

    // 本ステージ
    g.fillStyle = C.ground;
    g.fillRect(STAGE.x0, STAGE.y, STAGE.x1 - STAGE.x0, 38);
    g.fillStyle = C.groundTop;
    g.fillRect(STAGE.x0, STAGE.y, STAGE.x1 - STAGE.x0, 2);
    // 空中の足場
    g.fillStyle = C.platform;
    g.fillRect(SOFT.x0, SOFT.y, SOFT.x1 - SOFT.x0, 5);
    g.fillStyle = C.groundTop;
    g.fillRect(SOFT.x0, SOFT.y, SOFT.x1 - SOFT.x0, 2);

    if (c && p) {
      drawFighter(c);
      drawFighter(p);
    }
    for (const q of particles) {
      g.fillStyle = q.color;
      g.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
    }
    g.restore();

    if (!c || !p) return;
    // HUD：ダメージ（%）とストック
    const pc = Math.floor(p.percent);
    const cc = Math.floor(c.percent);
    drawText(`${pc}%`, 10, 52, 14, pc > 100 ? C.coral : C.paper, 'left');
    drawText(`${cc}%`, 230, 52, 14, cc > 100 ? C.coral : C.paper, 'right');
    g.fillStyle = C.player;
    for (let i = 0; i < Math.max(0, p.stocks); i++) g.fillRect(10 + i * 8, 58, 5, 5);
    g.fillStyle = c.color;
    for (let i = 0; i < Math.max(0, c.stocks); i++) g.fillRect(225 - i * 8, 58, 5, 5);
    drawText(OPPONENTS[round]?.name ?? '', 120, 40, 9, C.hud);

    // 画面の上に飛び出したときの目印
    for (const f of [p, c]) {
      if (f.out || f.respawn > 0 || f.y >= -4) continue;
      g.fillStyle = f.color;
      g.fillRect(Math.max(4, Math.min(236, f.x)) - 3, 2, 6, 4);
    }

    // 中央のバナー
    if (phase === 'intro') {
      const label = round === OPPONENTS.length - 1 ? 'BOSS' : `ROUND ${round + 1}`;
      drawText(phaseT < 55 ? label : 'FIGHT!', 120, 96, phaseT < 55 ? 18 : 24, C.paper);
    } else if (phase === 'clear') {
      drawText('K.O.!', 120, 96, 24, C.paper);
    } else if (c.respawn > 30 || p.respawn > 30) {
      drawText('K.O.', 120, 88, 14, C.coral);
    }
  }

  function frameLoop(now: number) {
    raf = requestAnimationFrame(frameLoop);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused && state === 'playing') {
      acc += dt;
      while (acc >= 1 / 60) {
        acc -= 1 / 60;
        tick();
      }
    }
    // ゲームオーバー・クリア後は、揺れを止める（揺れの減衰は tick の中で行うので、止まった画面では減らないため）
    if (state !== 'playing' || phase === 'over' || phase === 'won') shake = 0;
    if (player) draw();
  }

  function tick() {
    if (hitstop > 0) {
      hitstop--;
      return;
    }
    if (shake > 0) shake = Math.max(0, shake - 0.5);
    update();
  }

  return {
    start() {
      cancelAnimationFrame(raf);
      reset();
      state = 'playing';
      acc = 0;
      last = performance.now();
      raf = requestAnimationFrame(frameLoop);
    },
    stop() {
      cancelAnimationFrame(raf);
      state = 'ready';
      Object.assign(input, noInput());
    },
    setInput(key, down) {
      input[key] = down;
    },
    setPaused(pz) {
      paused = pz;
      last = performance.now();
    },
    step() {
      tick();
    },
    snapshot() {
      const p = player!;
      const c = cpu!;
      return {
        phase,
        round,
        lives: p.stocks,
        score,
        player: { x: p.x, y: p.y, percent: p.percent, onGround: p.onGround, atk: p.atk ? p.atk.kind : null, hitstun: p.hitstun },
        cpu: { x: c.x, y: c.y, percent: c.percent, stocks: c.stocks },
      };
    },
  };
}
