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
    controlsKeys: L10n;
    controlsTouch: L10n;
    win: L10n;
    over: L10n;
    again: L10n;
    lives: L10n;
    stick: L10n;
    light: L10n;
    heavy: L10n;
    sound: L10n;
    time: L10n;
    enterName: L10n;
    save: L10n;
    skip: L10n;
    saving: L10n;
    saveError: L10n;
    showBoard: L10n;
    boardTitle: L10n;
    loading: L10n;
    empty: L10n;
    loadError: L10n;
    close: L10n;
    rank: L10n;
    player: L10n;
  };
  contact: { kicker: L10n; cta: L10n; ctaAccent: L10n; top: L10n; stack: L10n };
  nav: { work: L10n; about: L10n; contact: L10n; menu: L10n; sayHello: L10n };
}

/**
 * ホーム（SIDE B デザイン）の文言。プロフィール・アルバムのデータにあるものはそちらを使い、
 * ここには「ホームだけで使う見出しや飾りの文字」を置く。
 * TODO(owner): 見出し（headline）は仮です。好きな言葉に変えてください。
 */
export const home: HomeCopy = {
  eyebrow: { en: 'Frontend Engineer · Tokyo, Japan', ja: 'フロントエンドエンジニア · 東京' },
  headline: {
    line1: { en: 'FRONTEND', ja: 'フロントエンド' },
    line2: { en: 'ENGINEER', ja: 'エンジニア' },
    line3: { en: 'IN', ja: '東京' },
    line3Accent: { en: 'TOKYO', ja: '在住' },
  },
  intro: {
    en: 'Bilingual English–Japanese engineer in Tokyo, building websites with great design and smooth animation, all in service of a better user experience and accessibility.',
    ja: '東京を拠点に活動する、日英バイリンガルのエンジニアです。使いやすさとアクセシビリティを第一に、美しいデザインとなめらかなアニメーションで、心地よい体験のウェブサイトを作っています。',
  },

  explore: { en: 'EXPLORE\nTHE WORK', ja: '制作実績を\n見る' },
  nowSpinning: { en: 'NOW SPINNING', ja: '再生中' },
  scrollCue: { en: 'SCROLL TO FLIP THE RECORD', ja: 'スクロールでレコードを裏返す' },
  play: { en: 'Play music', ja: '音楽を再生' },
  pause: { en: 'Pause music', ja: '音楽を一時停止' },
  next: { en: 'Next track', ja: '次の曲' },
  turntableLabel: { en: 'Interactive 3D turntable', ja: '操作できる 3D ターンテーブル' },

  work: {
    eyebrow: { en: 'Discography / selected projects', ja: 'ディスコグラフィ / 代表作' },
    title: { en: 'FEATURED', ja: '主な' },
    titleAccent: { en: 'RELEASES', ja: '制作実績' },
    lead: {
      en: 'Each project is a new record: a site or app I built, from first commit to launch.',
      ja: '1 つの制作実績が、1 枚のレコード。最初のコードから公開まで、開発を担当したサイトとアプリです。',
    },
    all: { en: 'All projects', ja: '制作実績をすべて見る' },
    view: { en: 'View', ja: '詳しく見る' },
  },
  pages: {
    title: { en: 'More records', ja: 'ほかのレコード' },
  },
  about: {
    eyebrow: { en: 'Behind the decks', ja: 'ステージの裏側' },
    title: { en: 'CODE WITH', ja: 'リズムで' },
    titleAccent: { en: 'RHYTHM', ja: 'コードを書く' },
    skillsTitle: { en: 'Skills', ja: 'スキル' },
    more: { en: 'Full story', ja: '詳しい自己紹介' },
  },
  arcade: {
    score: { en: 'SCORE 001337', ja: 'スコア 001337' },
    title: { en: 'READY\nPLAYER ONE?', ja: '準備は\nいいですか？' },
    start: { en: 'PRESS START TO COLLABORATE', ja: 'スタートを押して一緒に作ろう' },
    play: { en: 'CLICK TO PLAY', ja: 'クリックでプレイ' },
    exit: { en: 'Exit game', ja: 'ゲームを終了' },
    controlsKeys: { en: '← → MOVE  ↑ JUMP  ↓ DROP  J LIGHT  K HEAVY', ja: '← → 移動  ↑ ジャンプ  ↓ 降りる  J 弱  K 強' },
    controlsTouch: { en: 'USE THE STICK AND BUTTONS BELOW', ja: '下のスティックとボタンで操作' },
    win: { en: 'YOU WIN!', ja: 'クリア！' },
    over: { en: 'GAME OVER', ja: 'ゲームオーバー' },
    again: { en: 'PLAY AGAIN', ja: 'もう一度遊ぶ' },
    lives: { en: 'LIVES', ja: 'ライフ' },
    stick: { en: 'Stick: move, jump and drop through platforms', ja: 'スティック：移動・ジャンプ・足場から降りる' },
    light: { en: 'Light attack', ja: '弱攻撃' },
    heavy: { en: 'Heavy attack', ja: '強攻撃' },
    sound: { en: 'Sound on/off', ja: '効果音のオン・オフ' },
    time: { en: 'TIME', ja: 'タイム' },
    enterName: { en: 'ENTER YOUR NAME', ja: '名前を入力' },
    save: { en: 'SAVE SCORE', ja: 'ランキングに登録' },
    skip: { en: 'SKIP', ja: '登録しない' },
    saving: { en: 'SAVING…', ja: '登録中…' },
    saveError: { en: 'Could not save. Try again.', ja: '登録できませんでした。もう一度お試しください。' },
    showBoard: { en: 'LEADERBOARD', ja: 'ランキング' },
    boardTitle: { en: 'TOP 10', ja: 'トップ 10' },
    loading: { en: 'LOADING…', ja: '読み込み中…' },
    empty: { en: 'NO SCORES YET', ja: 'まだ記録がありません' },
    loadError: { en: 'Could not load the leaderboard.', ja: 'ランキングを読み込めませんでした。' },
    close: { en: 'CLOSE', ja: '閉じる' },
    rank: { en: 'Rank', ja: '順位' },
    player: { en: 'Player', ja: '名前' },
  },
  contact: {
    kicker: { en: 'GOT A PROJECT\nIN MIND?', ja: 'お仕事の\nご相談は？' },
    cta: { en: "LET'S MAKE", ja: '一緒に' },
    ctaAccent: { en: 'SOME NOISE', ja: '作ろう' },
    top: { en: 'BACK TO TOP ↑', ja: 'ページの先頭へ ↑' },
    stack: {
      en: 'THIS WEBSITE WAS DESIGNED IN FIGMA, BUILT WITH ASTRO, REACT, TYPESCRIPT, THREE.JS AND GSAP, AND HOSTED ON VERCEL.',
      ja: 'このサイトは、FIGMA でデザインし、ASTRO、REACT、TYPESCRIPT、THREE.JS、GSAP で開発して、VERCEL で公開しています。',
    },
  },
  nav: {
    work: { en: 'Selected work', ja: '制作実績' },
    about: { en: 'About', ja: '紹介' },
    contact: { en: 'Contact', ja: 'お問い合わせ' },
    menu: { en: 'Menu', ja: 'メニュー' },
    sayHello: { en: 'Say hello', ja: 'ご連絡はこちら' },
  },
};
