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
    blurb: {
      en: "Websites and apps I've designed and built, with screenshots and links.",
      ja: '自分で設計・開発したウェブサイトやアプリの紹介（スクリーンショットとリンク付き）。',
    },
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
            width: 1512,
            height: 800,
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
            width: 1512,
            height: 911,
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
    blurb: {
      en: "Where I've worked and what I did there: AXR and Holon Inc.",
      ja: 'これまでの職歴と担当した仕事（AXR、Holon Inc.）。',
    },
    // 最新の在籍年
    year: 2026,
    accent: '#3d7be0',
    cover: '/covers/work.svg',
    // 日本語は履歴書（英語版）をもとにした訳。社名・サービス名以外は表現を調整してよい
    tracks: [
      {
        slug: 'axr',
        title: { en: 'Full Stack Engineer · AXR', ja: 'フルスタックエンジニア · AXR' },
        meta: { en: 'Nov 2026 — Present', ja: '2026年11月 — 現在' },
        tags: ['Node.js', 'REST API', 'SQL', 'Docker', 'Claude Code'],
        description: {
          en: 'Tokyo, Japan. Joining a team that builds with AI-driven workflows, and growing from frontend into backend engineering.',
          ja: '東京。AI 駆動の開発ワークフローで開発するチームに加わり、フロントエンドからバックエンド開発へ領域を広げています。',
        },
        bullets: [
          {
            en: 'Onboarding into AI-driven development with Claude Code and other AI-assisted tools to speed up development and code analysis.',
            ja: 'Claude Code などの AI 開発支援ツールを使い、開発やコード解析を速める AI 駆動開発のオンボーディングに参加。',
          },
          {
            en: 'Hands-on backend work with Node.js, REST API architecture, database design and Docker-based development environments.',
            ja: 'Node.js、REST API の設計、データベース設計、Docker による開発環境で、バックエンド開発を実践。',
          },
          {
            en: 'Tracing API request lifecycles across routes, controllers, services and database layers to understand architecture, business logic and data flow of existing codebases.',
            ja: 'ルート、コントローラー、サービス、データベース層をまたいで API リクエストの流れを追い、既存コードのアーキテクチャ・業務ロジック・データフローを把握。',
          },
          {
            en: 'Relational database fundamentals: schema design, table relationships, foreign keys, SQL, indexing and transactions (ACID).',
            ja: 'リレーショナルデータベースの基礎（スキーマ設計、テーブル関係、外部キー、SQL、インデックス、トランザクション/ACID）。',
          },
          {
            en: 'Backend system design: asynchronous operations, error handling, input validation, authentication and database connection management.',
            ja: 'バックエンドのシステム設計（非同期処理、エラーハンドリング、入力検証、認証、DB 接続管理）。',
          },
        ],
      },
      {
        slug: 'holon',
        title: { en: 'Frontend Developer · Holon Inc.', ja: 'フロントエンドデベロッパー · Holon Inc.' },
        meta: { en: 'Jun 2023 — Oct 2026', ja: '2023年6月 — 2026年10月' },
        tags: ['Next.js', 'Astro', 'TypeScript', 'React Three Fiber', 'GSAP', 'Tailwind CSS', 'Playwright'],
        description: {
          en: 'Tokyo, Japan. A web development agency building client-facing web applications for real estate, hospitality and e-commerce. Led end-to-end development on 10+ client projects.',
          ja: '東京。不動産・ホスピタリティ・EC 向けにクライアントのウェブアプリを制作する Web 制作会社。10 件以上の案件を企画から公開まで一貫して担当。',
        },
        bullets: [
          {
            en: 'Housing brand site for a major real estate developer: Next.js (SSG) and TypeScript with property search, renovation and case-study pages; external APIs for listings, rankings and open houses; 3D and motion with React Three Fiber, GSAP and Framer Motion; Jest tests.',
            ja: '大手不動産デベロッパーの住宅ブランドサイト。Next.js（SSG）と TypeScript で物件検索・リノベーション・事例ページを構築し、物件情報やランキング等の外部 API を連携。React Three Fiber・GSAP・Framer Motion で 3D とモーションを実装し、Jest でテスト。',
          },
          {
            en: 'Resort hotel official site in 7 languages (Japanese, English, Simplified and Traditional Chinese, Korean, Spanish, French): Astro, TypeScript and Tailwind CSS, reCAPTCHA and form validation, GTM migrated off Universal Analytics, staging and production deploys automated with GitHub Actions.',
            ja: 'リゾートホテル公式サイト（日・英・中国語簡体/繁体・韓・西・仏の 7 言語）。Astro・TypeScript・Tailwind CSS で構築し、reCAPTCHA とフォーム検証、GTM のユニバーサルアナリティクスからの移行、GitHub Actions によるステージング/本番デプロイの自動化を担当。',
          },
          {
            en: 'Condominium and rental property sites: scroll-linked animation with GSAP and Lenis, Barba.js page transitions, Google Maps property maps, 20+ property pages, an Astro event slider and Vitest tests.',
            ja: '分譲マンション・賃貸物件サイト。GSAP と Lenis によるスクロール連動アニメーション、Barba.js のページ遷移、Google Maps の物件マップ、20 ページ以上の物件ページ、Astro のイベントスライダー、Vitest のテスト。',
          },
          {
            en: 'Landing pages for a clinic, a cosmetics brand and a shopping-center app: Astro, EJS, GSAP, Playwright and Netlify; per-clinic pricing generated statically from URL parameters.',
            ja: 'クリニック・化粧品・ショッピングセンターアプリのランディングページ。Astro・EJS・GSAP・Playwright・Netlify で構築し、URL パラメータからクリニックごとの料金を静的に生成。',
          },
          {
            en: 'Mentored and onboarded 2–3 junior developers through code reviews and best-practice workshops.',
            ja: '2〜3 名の若手開発者に、コードレビューとベストプラクティスの勉強会でオンボーディングと育成を実施。',
          },
          {
            en: 'Improved page load speed by up to 30%, set up SEO (meta, canonical, OGP) across client sites, and turned Figma, Photoshop and Adobe XD mockups into mobile-first pages.',
            ja: 'ページ読み込み速度を最大 30% 改善し、クライアントサイト全体の SEO 設定（meta・canonical・OGP）を担当。Figma・Photoshop・Adobe XD のデザインをモバイルファーストのページに実装。',
          },
        ],
      },
    ],
  },
  {
    slug: 'skills',
    type: 'EP',
    title: { en: 'Skills', ja: 'スキル' },
    blurb: {
      en: 'The languages, frameworks and tools I work with.',
      ja: '使っている言語・フレームワーク・ツール。',
    },
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
    // トラックが 4 つになったので SINGLE ではなく EP
    type: 'EP',
    title: { en: 'Contact', ja: 'お問い合わせ' },
    blurb: {
      en: 'Email, GitHub, LinkedIn, or send me a message directly.',
      ja: 'メール、GitHub、LinkedIn、またはこのサイトから直接メッセージを送れます。',
    },
    accent: '#d9a72b',
    cover: '/covers/contact.svg',
    tracks: [
      {
        slug: 'email',
        title: { en: 'Email', ja: 'メール' },
        meta: { en: 'ken.oshimoto@gmail.com', ja: 'ken.oshimoto@gmail.com' },
        description: {
          en: 'Write to me from your own mail app.',
          ja: 'お使いのメールアプリから直接ご連絡ください。',
        },
        links: [{ label: 'Email', href: 'mailto:ken.oshimoto@gmail.com' }],
      },
      {
        slug: 'github',
        title: { en: 'GitHub', ja: 'GitHub' },
        meta: { en: 'kenola12345', ja: 'kenola12345' },
        description: {
          en: 'My code and side projects.',
          ja: 'コードや個人開発のプロジェクトはこちら。',
        },
        links: [{ label: 'GitHub', href: 'https://github.com/kenola12345' }],
      },
      {
        slug: 'linkedin',
        title: { en: 'LinkedIn', ja: 'LinkedIn' },
        meta: { en: 'kentaro-oshimoto', ja: 'kentaro-oshimoto' },
        description: {
          en: 'My professional profile and work history.',
          ja: '職務経歴などのプロフィールはこちら。',
        },
        links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/kentaro-oshimoto/' }],
      },
      {
        slug: 'direct-mail',
        title: { en: 'Direct Mail', ja: 'ダイレクトメール' },
        meta: { en: 'Send a message', ja: 'メッセージを送る' },
        description: {
          en: 'Send me a message right from this page.',
          ja: 'このページから直接メッセージを送れます。',
        },
        // 説明の下に問い合わせフォームを出す
        form: true,
      },
    ],
  },
];

/** slug からアルバムを引く。存在しない slug は undefined */
export function getAlbum(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}
