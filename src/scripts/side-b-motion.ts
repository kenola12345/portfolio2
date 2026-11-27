/**
 * SIDE B のページの動き。
 * - 読み込み時：ヒーローの文字が下からせり上がり、丸いリンクとスタンプが弾むように出る
 * - スクロール時：[data-reveal] の要素がふわっと出て、スキルの棒が左から伸びる
 * - ページ移動：リンクを押すと赤いワイプが上がってから移動する（#アンカーは滑らかにスクロール）
 * - ナビ：狭い画面のメニューの開閉
 * 動かすのは transform と opacity だけ。JS が動かない環境では、最初から全部見える。
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** ワイプで移動してきたか（このあとワイプが上へ抜けるので、文字の登場を少し待つ） */
const arrivedByWipe = document.documentElement.hasAttribute('data-wipe-arrive');
const introDelay = arrivedByWipe ? 0.45 : 0;

function heroIntro() {
  gsap.from('[data-hero="line"]', {
    delay: introDelay,
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    clearProps: 'transform,opacity',
  });
  gsap.from('[data-hero="pop"]', {
    scale: 0.6,
    opacity: 0,
    duration: 0.8,
    ease: 'back.out(1.8)',
    delay: 0.5 + introDelay,
    stagger: 0.12,
    clearProps: 'transform,opacity',
  });
  gsap.from('[data-reveal-nav]', { delay: introDelay, y: -24, opacity: 0, duration: 0.7, ease: 'power2.out', clearProps: 'transform,opacity' });
}

function scrollReveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  gsap.utils.toArray<HTMLElement>('.skill-line i').forEach((bar) => {
    gsap.from(bar, {
      scaleX: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
    });
  });
}

function pageWipe() {
  const wipe = document.querySelector<HTMLElement>('.page-wipe');
  if (!wipe) return;
  const root = document.documentElement;

  /** 移動してきた直後：覆った状態から、上へ抜けていく */
  function reveal() {
    if (!root.hasAttribute('data-wipe-arrive')) return;
    wipe!.classList.add('leaving');
    root.removeAttribute('data-wipe-arrive');
    const done = (e: TransitionEvent) => {
      // 子（文字）の transitionend は無視して、ワイプ本体のものだけ受ける
      if (e.target !== wipe || e.propertyName !== 'transform') return;
      wipe!.removeEventListener('transitionend', done);
      // 画面の外（上）から下へ戻すときに、画面を横切って見えないよう、動きなしで戻す
      wipe!.style.transition = 'none';
      wipe!.classList.remove('leaving');
      void wipe!.offsetHeight;
      wipe!.style.transition = '';
    };
    wipe!.addEventListener('transitionend', done);
  }
  if (root.hasAttribute('data-wipe-arrive')) {
    // フォントの読み込みを少し待ってから開く（ただし待ちすぎない）
    const ready = Promise.race([document.fonts.ready, new Promise((r) => window.setTimeout(r, 900))]);
    void ready.then(() => requestAnimationFrame(reveal));
  }

  // 戻る・進むでキャッシュから復元されたとき、閉じたままにならないようにする
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    // 戻ってきたときは、ワイプを完全に元の（隠れた）状態へ戻す
    wipe.classList.remove('active', 'leaving');
    wipe.style.transition = '';
    root.removeAttribute('data-wipe-arrive');
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return; // 外部リンク・mailto はそのまま
    // 同じページ内の #アンカー：滑らかにスクロール（html の scroll-behavior）
    if (url.pathname === location.pathname && url.hash) return;

    event.preventDefault();
    try {
      sessionStorage.setItem('side-b-wipe', '1');
    } catch {
      /* 保存できなくても、移動はできる（開くときのワイプが出ないだけ） */
    }
    wipe.classList.add('active');
    window.setTimeout(() => {
      location.href = url.href;
    }, 470);
  });
}

function navMenu() {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  const toggle = nav?.querySelector<HTMLButtonElement>('.menu-toggle');
  if (!nav || !toggle) return;
  const set = (open: boolean) => toggle.setAttribute('aria-expanded', String(open));
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
}

heroIntro();
scrollReveals();
pageWipe();
navMenu();
