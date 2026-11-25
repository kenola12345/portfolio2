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
  formName: { en: 'Your name', ja: 'お名前' },
  formEmail: { en: 'Your email', ja: 'メールアドレス' },
  formMessage: { en: 'Message', ja: 'メッセージ' },
  formSend: { en: 'Send message', ja: '送信する' },
  formSending: { en: 'Sending…', ja: '送信中…' },
  formSent: { en: 'Thanks! Your message has been sent.', ja: 'ありがとうございます。メッセージを送信しました。' },
  formError: {
    en: 'Sorry, something went wrong. Please try again, or email me directly.',
    ja: '送信に失敗しました。もう一度お試しいただくか、メールで直接ご連絡ください。',
  },
  formCaptcha: {
    en: 'Please confirm you are not a robot.',
    ja: '「ロボットではありません」にチェックを入れてください。',
  },
  formFallback: {
    en: 'Opening your mail app with your message…',
    ja: 'メッセージを入力した状態でメールアプリを開きます…',
  },
} satisfies Record<string, L10n>;
