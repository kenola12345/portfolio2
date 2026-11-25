import type { L10n, Lang } from '../data/types';

/** 既定の言語。JA ルーティングは Phase 7 で追加する */
export const defaultLang: Lang = 'en';

/** L10n から指定言語の文字列を取り出す */
export function t(text: L10n, lang: Lang = defaultLang): string {
  return text[lang];
}
