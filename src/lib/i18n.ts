import type { AlbumType, L10n, Lang } from '../data/types';

/** 既定の言語（URL に接頭辞なし）。日本語は /ja/ 以下 */
export const defaultLang: Lang = 'en';

/** URL から言語を決める。/ja または /ja/… なら日本語 */
export function getLang(url: URL): Lang {
  const p = url.pathname;
  return p === '/ja' || p.startsWith('/ja/') ? 'ja' : 'en';
}

/** 言語に合わせたパスにする（'/' → '/ja/'、'/artist' → '/ja/artist'）。ハッシュ付きでもよい */
export function localePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang !== 'ja') return clean;
  return clean === '/' ? '/ja/' : `/ja${clean}`;
}

/** パスから言語の接頭辞（/ja）を外す */
export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/ja(?=\/|$)/, '');
  const noTrailing = stripped.length > 1 ? stripped.replace(/\/$/, '') : stripped;
  return noTrailing || '/';
}

/** 今のページの「もう一方の言語」での URL */
export function alternatePath(url: URL): { lang: Lang; href: string } {
  const current = getLang(url);
  const other: Lang = current === 'ja' ? 'en' : 'ja';
  return { lang: other, href: localePath(stripLocale(url.pathname), other) };
}

/** L10n から指定言語の文字列を取り出す */
export function t(text: L10n, lang: Lang = defaultLang): string {
  return text[lang];
}

/** ページの URL の言語で文字列を取り出す関数を返す（各 .astro 内で `const t = useT(Astro.url)`） */
export function useT(url: URL): (text: L10n) => string {
  const lang = getLang(url);
  return (text) => text[lang];
}

/** アルバムの種別ラベル */
export const albumTypeLabels: Record<AlbumType, L10n> = {
  ALBUM: { en: 'ALBUM', ja: 'アルバム' },
  EP: { en: 'EP', ja: 'EP' },
  SINGLE: { en: 'SINGLE', ja: 'シングル' },
};

/** 曲数の表記（英語は単複、日本語は「2曲」） */
export function trackCount(n: number, lang: Lang): string {
  return lang === 'ja' ? `${n}曲` : `${n} ${n === 1 ? 'track' : 'tracks'}`;
}
