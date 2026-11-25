import type { L10n } from './types';

/** データに属さない UI の固定文言 */
export const ui = {
  backToShelf: { en: 'Shelf', ja: '棚へ戻る' },
  artistLabel: { en: 'ARTIST', ja: 'アーティスト' },
  verifiedArtist: { en: 'Verified Artist', ja: '認証済みアーティスト' },
  popular: { en: 'Popular', ja: '人気の曲' },
  discography: { en: 'Discography', ja: 'ディスコグラフィ' },
  about: { en: 'About', ja: '紹介' },
  linerNotes: { en: 'Liner notes', ja: 'ライナーノーツ' },
  tracks: { en: 'tracks', ja: '曲' },
  track: { en: 'track', ja: '曲' },
  title: { en: 'Title', ja: 'タイトル' },
  nowPlaying: { en: 'Now Playing', ja: '再生中' },
  hintKeys: { en: 'Hover to peek · Click to pull out the record', ja: 'ホバーで顔を出す · クリックでレコードを引き出す' },
  hintTouch: { en: 'Tap a sleeve to pull out the record', ja: 'ジャケットをタップしてレコードを引き出す' },
  notFoundTitle: { en: 'Track not found', ja: '曲が見つかりません' },
  albumsNav: { en: 'Albums', ja: 'アルバム' },
} satisfies Record<string, L10n>;
