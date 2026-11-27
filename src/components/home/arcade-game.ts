/**
 * アーケード筐体の画面で遊べる、小さな横スクロールのプラットフォームゲーム。
 * 外部ライブラリなし（canvas 2D だけ）。ドット絵風に、論理解像度 240×240 を CSS で拡大して表示する。
 *
 * 遊び方：左右で移動、ジャンプで跳ぶ。コインを集め、敵は上から踏んで倒す。ゴールの旗まで行けばクリア。
 * 穴に落ちるか敵に当たるとライフが減り、0 になるとゲームオーバー。
 */

export const VIEW = 240;
const LEVEL_W = 1700;
const GROUND_Y = 200;

/** 画面の色（サイトの配色に合わせる） */
const C = {
  player: '#b8ff35',
  playerDark: '#618f14',
  enemy: '#ff5c45',
  coin: '#eeeade',
  ground: '#2c2c27',
  groundTop: '#b8ff35',
  platform: '#3b3b35',
  flag: '#b8ff35',
  hud: '#b8ff35',
  sky: '#0f1512',
  star: '#b8ff3522',
} as const;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Enemy extends Rect {
  /** 巡回する範囲 */
  min: number;
  max: number;
  dir: 1 | -1;
  alive: boolean;
}

interface Coin {
  x: number;
  y: number;
  taken: boolean;
}

/** 地面（穴のあいたところは含まない）と、空中の足場 */
const SOLIDS: Rect[] = [
  { x: 0, y: GROUND_Y, w: 400, h: 60 },
  { x: 450, y: GROUND_Y, w: 330, h: 60 },
  { x: 830, y: GROUND_Y, w: 310, h: 60 },
  { x: 1190, y: GROUND_Y, w: 510, h: 60 },
  // 空中の足場
  { x: 150, y: 150, w: 56, h: 8 },
  { x: 290, y: 118, w: 56, h: 8 },
  { x: 410, y: 150, w: 44, h: 8 },
  { x: 600, y: 140, w: 60, h: 8 },
  { x: 700, y: 106, w: 56, h: 8 },
  { x: 830, y: 150, w: 40, h: 8 },
  { x: 960, y: 140, w: 60, h: 8 },
  { x: 1060, y: 108, w: 56, h: 8 },
  { x: 1170, y: 150, w: 56, h: 8 },
  { x: 1340, y: 146, w: 60, h: 8 },
];

const ENEMY_SPEC = [
  { x: 520, min: 490, max: 780 },
  { x: 920, min: 890, max: 1140 },
  { x: 1300, min: 1260, max: 1460 },
  { x: 1500, min: 1470, max: 1640 },
];

const COIN_POS: [number, number][] = [
  [178, 134], [318, 102], [432, 134], [200, 184], [360, 184],
  [630, 124], [728, 90], [650, 184], [760, 184],
  [850, 134], [988, 124], [1088, 92], [1198, 134], [920, 184], [1100, 184],
  [1370, 130], [1300, 184], [1420, 184], [1560, 184],
];

const FLAG_X = 1640;

export type GameState = 'ready' | 'playing' | 'won' | 'over';

export interface GameEvents {
  /** クリアまたはゲームオーバーになったとき */
  onEnd: (result: 'won' | 'over', score: number) => void;
  /** スコア・ライフの表示を更新するとき */
  onHud?: (score: number, lives: number) => void;
}

export interface Game {
  start: () => void;
  stop: () => void;
  /** ボタン（タッチ）から操作を送る */
  setInput: (key: 'left' | 'right' | 'jump', down: boolean) => void;
  /** 画面が見えていないときなどに止める／再開する */
  setPaused: (paused: boolean) => void;
  /** テスト用：いまの主人公の位置と、生きている敵の位置 */
  snapshot: () => { state: GameState; x: number; y: number; vy: number; onGround: boolean; enemies: number[]; lives: number; score: number };
}

export function createGame(canvas: HTMLCanvasElement, events: GameEvents): Game {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  canvas.width = VIEW;
  canvas.height = VIEW;
  const g = ctx;

  const input = { left: false, right: false, jump: false };
  let jumpHeld = false;

  const player = { x: 30, y: GROUND_Y - 14, w: 12, h: 14, vx: 0, vy: 0, onGround: false, face: 1 as 1 | -1 };
  let coyote = 0;
  let jumpBuffer = 0;
  let enemies: Enemy[] = [];
  let coins: Coin[] = [];
  let score = 0;
  let lives = 3;
  let camX = 0;
  let time = 0;
  let state: GameState = 'ready';
  let raf = 0;
  let last = 0;
  let paused = false;
  let invincible = 0;

  function reset(full: boolean) {
    player.x = 30;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    camX = 0;
    invincible = 1;
    if (full) {
      score = 0;
      lives = 3;
      coins = COIN_POS.map(([x, y]) => ({ x, y, taken: false }));
      enemies = ENEMY_SPEC.map((e) => ({ x: e.x, y: GROUND_Y - 12, w: 12, h: 12, min: e.min, max: e.max, dir: 1, alive: true }));
    }
    events.onHud?.(score, lives);
  }

  const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function loseLife() {
    lives -= 1;
    events.onHud?.(score, lives);
    if (lives <= 0) {
      state = 'over';
      events.onEnd('over', score);
    } else {
      reset(false);
    }
  }

  function update(dt: number) {
    time += dt;
    invincible = Math.max(0, invincible - dt);

    // 横の移動：加速・減速をつけて、ドットのゲームらしく少し滑る
    const target = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const accel = player.onGround ? 900 : 600;
    const maxSpeed = 96;
    if (target) {
      player.vx += target * accel * dt;
      player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
      player.face = target > 0 ? 1 : -1;
    } else {
      const drag = (player.onGround ? 800 : 200) * dt;
      player.vx = Math.abs(player.vx) <= drag ? 0 : player.vx - Math.sign(player.vx) * drag;
    }

    // ジャンプ：少し早めに押しても、足場を離れた直後に押しても跳べる
    coyote = player.onGround ? 0.09 : Math.max(0, coyote - dt);
    jumpBuffer = input.jump && !jumpHeld ? 0.1 : Math.max(0, jumpBuffer - dt);
    jumpHeld = input.jump;
    if (jumpBuffer > 0 && coyote > 0) {
      player.vy = -300;
      coyote = 0;
      jumpBuffer = 0;
      player.onGround = false;
    }
    // ボタンを早く離すと低いジャンプ
    if (!input.jump && player.vy < -110) player.vy = -110;
    player.vy = Math.min(player.vy + 760 * dt, 360);

    // 横方向 → 縦方向の順に動かして、足場とぶつかったら止める
    player.x += player.vx * dt;
    for (const s of SOLIDS) {
      if (overlap(player, s)) {
        if (player.vx > 0) player.x = s.x - player.w;
        else if (player.vx < 0) player.x = s.x + s.w;
        player.vx = 0;
      }
    }
    player.x = Math.max(0, Math.min(LEVEL_W - player.w, player.x));

    player.y += player.vy * dt;
    player.onGround = false;
    for (const s of SOLIDS) {
      if (overlap(player, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
        }
        player.vy = 0;
      }
    }

    // 穴に落ちた
    if (player.y > VIEW + 30) {
      loseLife();
      return;
    }

    // 敵：巡回。上から踏めば倒せる、横から当たるとミス
    for (const e of enemies) {
      if (!e.alive) continue;
      e.x += e.dir * 30 * dt;
      if (e.x < e.min) {
        e.x = e.min;
        e.dir = 1;
      } else if (e.x + e.w > e.max) {
        e.x = e.max - e.w;
        e.dir = -1;
      }
      if (overlap(player, e)) {
        const stomp = player.vy > 40 && player.y + player.h - e.y < 9;
        if (stomp) {
          e.alive = false;
          player.vy = -200;
          score += 200;
          events.onHud?.(score, lives);
        } else if (invincible <= 0) {
          loseLife();
          return;
        }
      }
    }

    for (const c of coins) {
      if (!c.taken && Math.abs(player.x + player.w / 2 - c.x) < 9 && Math.abs(player.y + player.h / 2 - c.y) < 10) {
        c.taken = true;
        score += 100;
        events.onHud?.(score, lives);
      }
    }

    if (player.x + player.w >= FLAG_X) {
      score += lives * 500; // 残りライフのボーナス
      state = 'won';
      events.onHud?.(score, lives);
      events.onEnd('won', score);
      return;
    }

    // カメラは主人公の少し先を見せる
    const wantCam = player.x - VIEW * 0.35;
    camX += (Math.max(0, Math.min(LEVEL_W - VIEW, wantCam)) - camX) * Math.min(1, dt * 8);
  }

  function draw() {
    const cx = Math.round(camX);
    g.fillStyle = C.sky;
    g.fillRect(0, 0, VIEW, VIEW);

    // 遠くの星（ゆっくり動く）
    g.fillStyle = C.star;
    for (let i = 0; i < 28; i++) {
      const x = (((i * 83) % 300) - cx * 0.2 + 300) % 300;
      g.fillRect(x - 20, (i * 47) % 180, 2, 2);
    }

    // 足場と地面
    for (const s of SOLIDS) {
      if (s.x + s.w < cx || s.x > cx + VIEW) continue;
      const x = s.x - cx;
      if (s.h > 12) {
        g.fillStyle = C.ground;
        g.fillRect(x, s.y, s.w, s.h);
        g.fillStyle = C.groundTop;
        g.fillRect(x, s.y, s.w, 2);
      } else {
        g.fillStyle = C.platform;
        g.fillRect(x, s.y, s.w, s.h);
        g.fillStyle = C.groundTop;
        g.fillRect(x, s.y, s.w, 2);
      }
    }

    // ゴールの旗
    const fx = FLAG_X - cx;
    g.fillStyle = C.coin;
    g.fillRect(fx + 6, GROUND_Y - 60, 2, 60);
    g.fillStyle = C.flag;
    g.fillRect(fx + 8, GROUND_Y - 60, 16, 10);

    // コイン
    for (const c of coins) {
      if (c.taken) continue;
      const bob = Math.sin(time * 5 + c.x) * 1.5;
      g.fillStyle = C.coin;
      g.fillRect(Math.round(c.x - cx - 3), Math.round(c.y + bob - 3), 6, 6);
    }

    // 敵（インベーダー風）
    for (const e of enemies) {
      if (!e.alive) continue;
      const x = Math.round(e.x - cx);
      const y = Math.round(e.y);
      g.fillStyle = C.enemy;
      g.fillRect(x + 2, y, 8, 3);
      g.fillRect(x, y + 3, 12, 5);
      const step = Math.floor(time * 6) % 2;
      g.fillRect(x + (step ? 1 : 3), y + 8, 3, 4);
      g.fillRect(x + (step ? 8 : 6), y + 8, 3, 4);
      g.fillStyle = C.sky;
      g.fillRect(x + 3, y + 4, 2, 2);
      g.fillRect(x + 7, y + 4, 2, 2);
    }

    // 主人公（ミスの直後は点滅）
    if (!(invincible > 0 && Math.floor(time * 14) % 2 === 0)) {
      const px = Math.round(player.x - cx);
      const py = Math.round(player.y);
      g.fillStyle = C.player;
      g.fillRect(px, py, player.w, player.h);
      g.fillStyle = C.playerDark;
      g.fillRect(px, py + player.h - 3, player.w, 3);
      g.fillStyle = C.sky;
      g.fillRect(px + (player.face > 0 ? 7 : 2), py + 3, 3, 3);
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    if (paused || state !== 'playing') {
      draw();
      return;
    }
    update(dt);
    draw();
  }

  return {
    start() {
      cancelAnimationFrame(raf);
      reset(true);
      state = 'playing';
      jumpHeld = true; // 開始のクリックでそのまま跳ばないように
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      state = 'ready';
      input.left = input.right = input.jump = false;
    },
    setInput(key, down) {
      input[key] = down;
    },
    setPaused(p) {
      paused = p;
      last = performance.now();
    },
    snapshot() {
      return { state, x: player.x, y: player.y, vy: player.vy, onGround: player.onGround, enemies: enemies.filter((e) => e.alive).map((e) => e.x), lives, score };
    },
  };
}
