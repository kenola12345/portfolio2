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

function heroIntro() {
  gsap.from('[data-hero="line"]', {
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
    delay: 0.5,
    stagger: 0.12,
    clearProps: 'transform,opacity',
  });
  gsap.from('[data-reveal-nav]', { y: -24, opacity: 0, duration: 0.7, ease: 'power2.out', clearProps: 'transform,opacity' });
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

  // 戻る・進むでキャッシュから復元されたとき、閉じたままにならないようにする
  window.addEventListener('pageshow', () => wipe.classList.remove('active'));

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return; // 外部リンク・mailto はそのまま
    // 同じページ内の #アンカー：滑らかにスクロール（html の scroll-behavior）
    if (url.pathname === location.pathname && url.hash) return;

    event.preventDefault();
    wipe.classList.add('active');
    window.setTimeout(() => {
      location.href = url.href;
    }, 380);
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
