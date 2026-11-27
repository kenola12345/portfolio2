import { albums } from '../data/albums';
import { ui } from '../data/ui';
import { getLang, localePath } from './i18n';

export interface NavLink {
  href: string;
  label: string;
  /** いま見ているページ（色を変える） */
  current?: boolean;
}

/**
 * ナビに並べるページへのリンク（自己紹介と、各アルバム）。ホームとサブページで同じものを使う。
 * current には、いま見ているページ（'artist' またはアルバムの slug）を渡す。ホームでは省略する
 */
export function pageNavLinks(url: URL, current?: string): NavLink[] {
  const lang = getLang(url);
  return [
    { href: localePath('/artist', lang), label: ui.navArtist[lang], current: current === 'artist' },
    ...albums.map((album) => ({
      href: localePath(`/albums/${album.slug}`, lang),
      label: album.title[lang],
      current: current === album.slug,
    })),
  ];
}
