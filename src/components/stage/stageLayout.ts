import { navigate } from 'astro:transitions/client';
import { STAGE } from './config';

export type StageMode = 'home' | 'page' | 'none';

/** いまのページがステージに求めていること（ホームの 3D 棚か、ヘッダーのスロットか） */
interface StageLayout {
  mode: StageMode;
  slot: { slug: string; el: HTMLElement } | null;
  hover: string | null;
  /** ドラッグ中にポインターの下に来たレコード。ドラッグが終わるまでホバー扱いにせず、終わった時点で反映する */
  pendingHover: string | null;
  /** クリックされて引き出し中のレコード */
  pulled: string | null;
  /** ローディングが終わって、画面を見せてよいか */
  ready: boolean;
}

export const layout: StageLayout = {
  mode: 'none',
  slot: null,
  hover: null,
  pendingHover: null,
  pulled: null,
  ready: false,
};

const hoverListeners = new Set<(slug: string | null) => void>();

/** ホバー中のレコードを変える。DOM 側のホバーカードが購読して表示を切り替える */
export function setHover(slug: string | null) {
  if (layout.hover === slug) return;
  layout.hover = slug;
  hoverListeners.forEach((fn) => fn(slug));
}

/** 台をドラッグ中か（html の data-dragging は RecordStage のドラッグ処理が付け外しする） */
export const isDragging = () => document.documentElement.dataset.dragging !== undefined;

/** ドラッグが終わったとき、保留していたホバーを反映する */
export function flushPendingHover() {
  setHover(layout.pendingHover);
}

export function subscribeHover(fn: (slug: string | null) => void): () => void {
  hoverListeners.add(fn);
  return () => {
    hoverListeners.delete(fn);
  };
}

/** 「ドラッグで回せる」ヒントを、一度回したら消す。ページ遷移で html の属性が入れ替わるので、sessionStorage から付け直す */
export function markDragged() {
  document.documentElement.dataset.dragged = '';
  try {
    sessionStorage.setItem('stage-dragged', '1');
  } catch {
    /* 保存できない環境では、そのページの間だけ消える */
  }
}
function restoreDragged() {
  try {
    if (sessionStorage.getItem('stage-dragged')) document.documentElement.dataset.dragged = '';
  } catch {
    /* 無視 */
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** ページの DOM を読み直す。ページ遷移のたびに呼ぶ */
export function refreshLayout() {
  const slotEl = document.querySelector<HTMLElement>('[data-record-slot]');
  layout.slot = slotEl ? { slug: slotEl.dataset.recordSlot ?? '', el: slotEl } : null;
  layout.mode = slotEl ? 'page' : document.querySelector('[data-stage-home]') ? 'home' : 'none';
  // CSS 側で、ホームのときだけキャンバスがクリックを受けるようにする
  document.documentElement.dataset.stage = layout.mode;
  restoreDragged();
}

/** ジャケット／レコードがクリックされた：盤を引き出してからページ遷移する */
export function activate(slug: string, href: string) {
  if (layout.pulled) return;
  layout.pulled = slug;
  // 引き抜いている間は、ホバーカードを出さない
  setHover(null);
  const go = () => {
    void navigate(href);
  };
  if (prefersReducedMotion()) go();
  else window.setTimeout(go, STAGE.pullMs);
}

/**
 * ステージが使う DOM イベントをまとめて登録する。
 * 3D のクリックは R3F が受けるので、ここではキーボード用の（画面外の）リンクだけを扱う。
 * 戻り値は解除関数
 */
export function bindStageEvents(): () => void {
  refreshLayout();

  const onSwap = () => {
    layout.pulled = null;
    setHover(null);
    refreshLayout();
  };

  const cardOf = (e: Event) => (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-card]') ?? null;
  const onFocusIn = (e: Event) => {
    setHover(cardOf(e)?.dataset.card ?? null);
  };
  const onFocusOut = (e: Event) => {
    if (cardOf(e)) setHover(null);
  };

  /** キーボードで Enter されたとき。Astro のルーターより先に処理して、すぐ遷移されないようにする */
  const onClick = (e: MouseEvent) => {
    const a = cardOf(e);
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    activate(a.dataset.card ?? '', a.href);
  };

  // ブラウザの「戻る／進む」でホームに戻ったときは、ページの一番上から始める。
  // 既定では前に見ていたスクロール位置（フッターなど）に戻り、3D の台がまるごと画面の上に出てしまうため
  let navigationType = '';
  const onBeforePreparation = (e: Event) => {
    navigationType = (e as Event & { navigationType?: string }).navigationType ?? '';
  };
  const onPageLoad = () => {
    refreshLayout();
    if (layout.mode === 'home' && navigationType === 'traverse' && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    navigationType = '';
  };

  document.addEventListener('astro:after-swap', onSwap);
  document.addEventListener('astro:before-preparation', onBeforePreparation);
  document.addEventListener('astro:page-load', onPageLoad);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('click', onClick, true);
  return () => {
    document.removeEventListener('astro:after-swap', onSwap);
    document.removeEventListener('astro:before-preparation', onBeforePreparation);
    document.removeEventListener('astro:page-load', onPageLoad);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('click', onClick, true);
  };
}
