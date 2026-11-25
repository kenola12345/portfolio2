import { navigate } from 'astro:transitions/client';
import { STAGE } from './config';

/** 今のページで DOM 上にあるレコードの置き場所（ジャケット or ヘッダーのスロット） */
interface StageLayout {
  slot: { slug: string; el: HTMLElement } | null;
  cards: Map<string, HTMLElement>;
  hover: string | null;
  /** クリックされて引き出し中のレコード */
  pulled: string | null;
}

export const layout: StageLayout = {
  slot: null,
  cards: new Map(),
  hover: null,
  pulled: null,
};

/** 1 枚のレコードが今向かうべき状態（座標は CSS px、ビューポート基準） */
export interface RecordTarget {
  cx: number;
  cy: number;
  size: number;
  spin: number;
  tilt: number;
  hidden: boolean;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** ページの DOM を読み直す。ページ遷移のたびに呼ぶ */
export function refreshLayout() {
  const slotEl = document.querySelector<HTMLElement>('[data-record-slot]');
  layout.slot = slotEl ? { slug: slotEl.dataset.recordSlot ?? '', el: slotEl } : null;
  layout.cards = new Map();
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
    if (el.dataset.card) layout.cards.set(el.dataset.card, el);
  });
}

/**
 * レコード slug の目標状態を DOM から計算する。毎フレーム呼ぶので
 * スクロール中もレコードがジャケット／スロットに追従する。
 * tucked = true のときはジャケットの裏に完全に隠した位置を返す（初回表示用）
 */
export function computeTarget(slug: string, tucked = false): RecordTarget | null {
  if (layout.slot) {
    if (layout.slot.slug !== slug) return { cx: 0, cy: 0, size: 0, spin: 0, tilt: 0, hidden: true };
    const r = layout.slot.el.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      size: r.width,
      spin: STAGE.spinSlot,
      tilt: STAGE.slotTilt,
      hidden: false,
    };
  }

  const card = layout.cards.get(slug);
  if (!card) return null;
  const r = card.getBoundingClientRect();
  const size = r.width * STAGE.recordFill;
  const isPulled = layout.pulled === slug;
  const isHover = layout.hover === slug;
  const peek = tucked
    ? 0
    : (isPulled ? STAGE.peekPulled : isHover ? STAGE.peekHover : STAGE.peekRest) * size;
  return {
    cx: r.left + r.width / 2,
    // レコードの上端が「ジャケットの上辺 - peek」になる位置
    cy: r.top - peek + size / 2,
    size,
    spin: isPulled ? STAGE.spinPulled : isHover ? STAGE.spinHover : 0,
    tilt: 0,
    hidden: false,
  };
}

/**
 * ステージが使うイベントをまとめて登録する（ホバー・クリック・ページ遷移）。
 * 戻り値は解除関数
 */
export function bindStageEvents(): () => void {
  refreshLayout();

  const onSwap = () => {
    layout.pulled = null;
    layout.hover = null;
    refreshLayout();
  };

  const onOver = (e: Event) => {
    const card = (e.target as Element | null)?.closest<HTMLElement>('[data-card]');
    layout.hover = card?.dataset.card ?? null;
  };

  /** ジャケットをクリック → レコードを引き出してから遷移する */
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-card]');
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Astro のルーターより先に処理して、すぐ遷移されないようにする
    e.preventDefault();
    e.stopPropagation();
    if (layout.pulled) return;
    layout.pulled = a.dataset.card ?? null;
    const go = () => {
      void navigate(a.href);
    };
    if (prefersReducedMotion()) go();
    else window.setTimeout(go, STAGE.pullMs);
  };

  document.addEventListener('astro:after-swap', onSwap);
  document.addEventListener('astro:page-load', refreshLayout);
  document.addEventListener('pointerover', onOver);
  document.addEventListener('focusin', onOver);
  document.addEventListener('click', onClick, true);
  return () => {
    document.removeEventListener('astro:after-swap', onSwap);
    document.removeEventListener('astro:page-load', refreshLayout);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('focusin', onOver);
    document.removeEventListener('click', onClick, true);
  };
}
