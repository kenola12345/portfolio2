import type { Album } from './types';

/**
 * 全アルバムのデータ。配列の順番がホームの棚に並ぶ順番（Artist は先頭に別途置く）。
 * 内容は旧サイトにあったものだけ。TODO(owner) は本人から実際の情報をもらうまで推測で埋めない。
 */
export const albums: Album[] = [
  {
    slug: 'projects',
    type: 'ALBUM',
    title: { en: 'Projects', ja: '制作実績' },
    // TODO(owner): 最新プロジェクトの年
    accent: '#e0533d',
    cover: '/covers/projects.webp',
    tracks: [
      {
        slug: 'oshimoto-net',
        title: { en: 'oshimoto.net', ja: 'oshimoto.net' },
        // TODO(owner): 年・説明・使用技術
        images: [
          {
            src: '/projects/oshimotonet.png',
            alt: { en: 'Screenshot of oshimoto.net', ja: 'oshimoto.net のスクリーンショット' },
          },
        ],
        links: [{ label: 'Visit site', href: 'https://www.oshimoto.net/' }],
      },
      {
        slug: 'seta-tei',
        title: { en: 'seta-tei.jp', ja: 'seta-tei.jp' },
        // TODO(owner): 年・説明・使用技術
        images: [
          {
            src: '/projects/seta-tei.png',
            alt: { en: 'Screenshot of seta-tei.jp', ja: 'seta-tei.jp のスクリーンショット' },
          },
        ],
        links: [{ label: 'Visit site', href: 'https://www.seta-tei.jp/' }],
      },
    ],
  },
  {
    slug: 'work',
    type: 'ALBUM',
    title: { en: 'Work Experience', ja: '職歴' },
    accent: '#3d7be0',
    cover: '/covers/work.svg',
    tracks: [
      {
        slug: 'full-stack-developer',
        title: { en: 'Full Stack Developer', ja: 'フルスタックエンジニア' },
        // TODO(owner): 会社名（非公開なら「東京のスタートアップ」）・在籍期間・やったこと
        description: {
          en: 'Full Stack Developer at a Japanese startup company.',
          ja: '日本のスタートアップ企業でフルスタックエンジニアとして働いています。',
        },
      },
    ],
  },
  {
    slug: 'skills',
    type: 'EP',
    title: { en: 'Skills', ja: 'スキル' },
    accent: '#23a7a0',
    cover: '/covers/skills.svg',
    tracks: [
      {
        slug: 'frontend',
        title: { en: 'Frontend', ja: 'フロントエンド' },
        meta: { en: '8 items', ja: '8 件' },
        tags: ['HTML', 'CSS', 'Sass', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro'],
      },
      {
        slug: 'backend',
        title: { en: 'Backend', ja: 'バックエンド' },
        meta: { en: '1 item', ja: '1 件' },
        tags: ['Node.js'],
      },
      {
        slug: 'database',
        title: { en: 'Database', ja: 'データベース' },
        meta: { en: '2 items', ja: '2 件' },
        tags: ['PostgreSQL', 'MongoDB'],
      },
      {
        slug: 'tools',
        title: { en: 'Tools', ja: 'ツール' },
        meta: { en: '2 items', ja: '2 件' },
        tags: ['Docker', 'Claude Code'],
      },
    ],
  },
  {
    slug: 'contact',
    type: 'SINGLE',
    title: { en: 'Contact', ja: 'お問い合わせ' },
    accent: '#d9a72b',
    cover: '/covers/contact.svg',
    tracks: [
      {
        slug: 'get-in-touch',
        title: { en: 'Get in touch', ja: 'ご連絡はこちら' },
        description: {
          en: 'Feel free to reach out by email or on social media.',
          ja: 'メールまたは SNS からお気軽にご連絡ください。',
        },
        links: [
          { label: 'Email', href: 'mailto:ken.oshimoto@gmail.com' },
          { label: 'GitHub', href: 'https://github.com/bap-ssbm' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kentaro-oshimoto/' },
        ],
      },
    ],
  },
];

/** slug からアルバムを引く。存在しない slug は undefined */
export function getAlbum(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}
