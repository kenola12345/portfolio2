import type { Artist } from './types';

/** 本人のプロフィール。About ページ（アーティストページ）とメタ情報に使う */
export const artist: Artist = {
  name: { en: 'Kentaro Oshimoto', ja: '押本 健太郎' },
  tagline: {
    en: 'Full Stack Developer · Tokyo, Japan',
    ja: 'フルスタックエンジニア · 東京',
  },
  // TODO(owner): もっと長い自己紹介にするならここ
  bio: {
    en: 'Born and raised in America, now living in Tokyo, Japan. Currently working as a Full Stack Developer at a Japanese startup company.',
    ja: 'アメリカ生まれ・育ち。現在は東京在住。日本のスタートアップ企業でフルスタックエンジニアとして働いています。',
  },
  banner: '/images/artist-banner.webp',
  portrait: '/covers/artist.webp',
  accent: '#8b5cf6',
  socials: [
    { kind: 'github', label: 'GitHub', href: 'https://github.com/bap-ssbm' },
    { kind: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/kentaro-oshimoto/' },
    { kind: 'email', label: 'Email', href: 'mailto:ken.oshimoto@gmail.com' },
  ],
  popular: [
    { album: 'projects', track: 'oshimoto-net' },
    { album: 'projects', track: 'seta-tei' },
    { album: 'work', track: 'full-stack-developer' },
  ],
};
