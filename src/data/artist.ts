import type { Artist } from './types';

/** 本人のプロフィール。About ページ（アーティストページ）とメタ情報に使う */
export const artist: Artist = {
  name: { en: 'Kentaro Oshimoto', ja: '押本 健太郎' },
  tagline: {
    en: 'Frontend Engineer · Tokyo, Japan',
    ja: 'フロントエンドエンジニア · 東京',
  },
  // 履歴書の Professional Summary をもとにした紹介文（電話番号などの連絡先は載せない）
  bio: {
    en: "Bilingual English–Japanese frontend engineer born in the United States and based in Tokyo. After 3+ years building production web applications with React, Next.js and TypeScript at a Japanese web agency, I'm now expanding into full-stack development as a Full Stack Engineer (Node.js, REST APIs, relational databases, Docker) with AI-driven workflows. I have led end-to-end development on 10+ client projects across real estate, hospitality, healthcare and consumer brands, with a focus on user experience, performance and accessibility, and mentored junior developers along the way.",
    ja: 'アメリカ生まれ、東京在住の日英バイリンガルのフロントエンドエンジニアです。日本のウェブ制作会社で 3 年以上、React・Next.js・TypeScript を使った本番環境のウェブアプリケーションを開発してきました。現在はフルスタックエンジニアとして、AI を活用した開発ワークフローのもと、バックエンド（Node.js、REST API、リレーショナルデータベース、Docker）へと領域を広げています。不動産、ホスピタリティ、ヘルスケア、コンシューマーブランドなど 10 件以上の案件を、ユーザー体験・パフォーマンス・アクセシビリティを重視しながら企画から公開まで一貫して担当し、後輩の育成にも携わってきました。',
  },

  shelfBlurb: {
    en: 'About me: who I am, where I\'m from and what I do.',
    ja: '自己紹介：どんな人で、どこの出身で、何をしているか。',
  },
  facts: [
    {
      label: { en: 'Based in', ja: '拠点' },
      value: { en: 'Tokyo, Japan', ja: '日本・東京' },
    },
    {
      label: { en: 'Languages', ja: '言語' },
      value: { en: 'English (native) · Japanese (native)', ja: '英語（ネイティブ）· 日本語（ネイティブ）' },
    },
    {
      label: { en: 'Hobbies', ja: '趣味' },
      value: { en: 'Breakdancing · Bouldering · Video games · Reading', ja: 'ブレイクダンス · ボルダリング · ゲーム · 読書' },
    },
    {
      label: { en: 'Education', ja: '学歴' },
      value: {
        en: 'B.A. in Economics, Temple University, Japan Campus (2017–2020) · Economics, El Camino College (2015–2017)',
        ja: '経済学士、テンプル大学ジャパンキャンパス（2017〜2020 年）· 経済学、エルカミーノ・カレッジ（2015〜2017 年）',
      },
    },
  ],
  banner: '/images/artist-about.webp',
  portrait: '/covers/artist.webp',
  accent: '#8b5cf6',
  socials: [
    { kind: 'github', label: { en: 'GitHub', ja: 'GitHub' }, href: 'https://github.com/kenola12345' },
    { kind: 'linkedin', label: { en: 'LinkedIn', ja: 'LinkedIn' }, href: 'https://www.linkedin.com/in/kentaro-oshimoto/' },
    { kind: 'email', label: { en: 'Email', ja: 'メール' }, href: 'mailto:ken.oshimoto@gmail.com' },
  ],
  popular: [
    { album: 'projects', track: 'oshimoto-net' },
    { album: 'projects', track: 'seta-tei' },
    { album: 'work', track: 'holon' },
  ],
};
