import type { L10n } from './types';

interface HomeCopy {
  eyebrow: L10n;
  headline: { line1: L10n; line2: L10n; line3: L10n; line3Accent: L10n };
  intro: L10n;
  explore: L10n;
  nowSpinning: L10n;
  scrollCue: L10n;
  play: L10n;
  pause: L10n;
  next: L10n;
  turntableLabel: L10n;
  work: { eyebrow: L10n; title: L10n; titleAccent: L10n; lead: L10n; all: L10n; view: L10n };
  pages: { title: L10n };
  about: { eyebrow: L10n; title: L10n; titleAccent: L10n; skillsTitle: L10n; more: L10n };
  arcade: {
    score: L10n;
    title: L10n;
    start: L10n;
    play: L10n;
    exit: L10n;
    controls: L10n;
    win: L10n;
    over: L10n;
    again: L10n;
    lives: L10n;
    left: L10n;
    right: L10n;
    jump: L10n;
    sound: L10n;
  };
  contact: { kicker: L10n; cta: L10n; ctaAccent: L10n; top: L10n };
  nav: { work: L10n; about: L10n; contact: L10n; menu: L10n; sayHello: L10n };
}

/**
 * ホーム（SIDE B デザイン）の文言。プロフィール・アルバムのデータにあるものはそちらを使い、
 * ここには「ホームだけで使う見出しや飾りの文字」を置く。
 * TODO(owner): 見出し（headline）は仮です。好きな言葉に変えてください。
 */
export const home: HomeCopy = {
  eyebrow: { en: 'Full Stack Engineer · Tokyo, Japan', ja: 'フルスタックエンジニア · 東京' },
  headline: {
    line1: { en: 'FULL STACK', ja: 'フルスタック' },
    line2: { en: 'ENGINEER', ja: 'エンジニア' },
    line3: { en: 'IN', ja: '東京で' },
    line3Accent: { en: 'TOKYO.', ja: '開発。' },
  },
  intro: {
    en: 'Bilingual English–Japanese engineer building production web apps for real estate, hospitality, healthcare and consumer brands.',
    ja: '日英バイリンガルのエンジニア。不動産・ホスピタリティ・ヘルスケア・コンシューマーブランドの Web アプリを、企画から公開まで開発しています。',
  },
  explore: { en: 'EXPLORE\nTHE WORK', ja: '制作実績\nを見る' },
  nowSpinning: { en: 'NOW SPINNING', ja: '再生中' },
  scrollCue: { en: 'SCROLL TO FLIP THE RECORD', ja: 'スクロールでレコードを回す' },
  play: { en: 'Play music', ja: '音楽を再生' },
  pause: { en: 'Pause music', ja: '音楽を一時停止' },
  next: { en: 'Next track', ja: '次の曲' },
  turntableLabel: { en: 'Interactive 3D turntable', ja: '操作できる 3D ターンテーブル' },

  work: {
    eyebrow: { en: 'Discography / selected projects', ja: 'ディスコグラフィ / 代表的な制作実績' },
    title: { en: 'FEATURED', ja: '代表的な' },
    titleAccent: { en: 'RELEASES', ja: '制作実績' },
    lead: {
      en: "Each project is a new record: a site or app I designed and built, from first sketch to launch.",
      ja: '1 つ 1 つの制作実績が 1 枚のレコード。構想から公開まで、デザインと開発を担当したサイトやアプリです。',
    },
    all: { en: 'All projects', ja: '制作実績をすべて見る' },
    view: { en: 'View', ja: '詳しく見る' },
  },
  pages: {
    title: { en: 'More records', ja: 'そのほかのレコード' },
  },
  about: {
    eyebrow: { en: 'Behind the decks', ja: 'ステージの裏側' },
    title: { en: 'CODE WITH', ja: 'リズムで' },
    titleAccent: { en: 'RHYTHM.', ja: 'コードを。' },
    skillsTitle: { en: 'Skills', ja: 'スキル' },
    more: { en: 'Full story', ja: '詳しい自己紹介' },
  },
  arcade: {
    score: { en: 'SCORE 001337', ja: 'スコア 001337' },
    title: { en: 'READY\nPLAYER ONE?', ja: '準備は\nいいですか？' },
    start: { en: 'PRESS START TO COLLABORATE', ja: 'スタートで一緒に作ろう' },
    play: { en: 'CLICK TO PLAY', ja: 'クリックでプレイ' },
    exit: { en: 'Exit game', ja: 'ゲームを終了' },
    controls: { en: '← → MOVE   SPACE JUMP', ja: '← → 移動   SPACE ジャンプ' },
    win: { en: 'YOU WIN!', ja: 'クリア！' },
    over: { en: 'GAME OVER', ja: 'ゲームオーバー' },
    again: { en: 'PLAY AGAIN', ja: 'もう一度' },
    lives: { en: 'LIVES', ja: 'ライフ' },
    left: { en: 'Move left', ja: '左へ移動' },
    right: { en: 'Move right', ja: '右へ移動' },
    jump: { en: 'Jump', ja: 'ジャンプ' },
    sound: { en: 'Sound on/off', ja: '効果音のオン・オフ' },
  },
  contact: {
    kicker: { en: 'GOT A PROJECT\nIN MIND?', ja: 'お仕事の\nご相談は？' },
    cta: { en: "LET'S MAKE", ja: '一緒に作ろう' },
    ctaAccent: { en: 'SOME NOISE.', ja: 'ご連絡を。' },
    top: { en: 'BACK TO TOP ↑', ja: 'ページの先頭へ ↑' },
  },
  nav: {
    work: { en: 'Selected work', ja: '制作実績' },
    about: { en: 'About', ja: '紹介' },
    contact: { en: 'Contact', ja: 'お問い合わせ' },
    menu: { en: 'Menu', ja: 'メニュー' },
    sayHello: { en: 'Say hello', ja: 'ご連絡はこちら' },
  },
};
