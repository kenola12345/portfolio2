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
        // TODO(owner): 公開年。説明と使用技術は履歴書と制作したサイトの構成をもとにしたもの
        tags: ['Astro', 'React', 'Tailwind CSS', 'GSAP'],
        description: {
          en: 'Portfolio website for Ryuichi Oshimoto, a professional photographer. I designed and built a responsive, easy-to-browse site with themed photo galleries, an about page and a contact form, using smooth scrolling and GSAP animations to let the photographs take centre stage.',
          ja: 'プロカメラマン・押本隆一さんのポートフォリオサイト。デザインから開発までを担当し、テーマ別のフォトギャラリー、プロフィールページ、お問い合わせフォームを備えたレスポンシブなサイトに仕上げました。スムーズなスクロールと GSAP のアニメーションで、写真が主役になるように見せています。',
        },
        images: [
          {
            src: '/projects/oshimotonet.png',
            width: 1512,
            height: 800,
            alt: { en: 'Screenshot of oshimoto.net', ja: 'oshimoto.net のスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://www.oshimoto.net/' }],
      },
      {
        slug: 'seta-tei',
        title: { en: 'seta-tei.jp', ja: 'seta-tei.jp' },
        // TODO(owner): 公開年。説明と使用技術は履歴書をもとにしたもの
        tags: ['React', 'Tailwind CSS', 'Firebase'],
        description: {
          en: 'Official website for HAYAMA Setatei, a French restaurant in Hayama, Japan. I designed and built the site in Japanese and English, and added a Firebase backend and an email system for reservation inquiries, which increased the number of reservations.',
          ja: '葉山のフレンチレストラン「HAYAMA せた亭」の公式サイト。日本語・英語の 2 言語でデザインから開発までを担当し、Firebase のバックエンドと、予約のお問い合わせをメールで受け付ける仕組みを導入して、予約数の増加につなげました。',
        },
        images: [
          {
            src: '/projects/seta-tei.png',
            width: 1512,
            height: 911,
            alt: { en: 'Screenshot of seta-tei.jp', ja: 'seta-tei.jp のスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://www.seta-tei.jp/' }],
      },
      {
        slug: 'initia',
        title: { en: 'INITIA', ja: 'INITIA（イニシア）' },
        // TODO(owner): 公開年。説明と使用技術は履歴書と公開サイトをもとにしたもの。違っていたら直す
        tags: ['Next.js','TypeScript','React Three Fiber','GSAP','Framer Motion','Jest'],
        description: {
          en: 'Official brand site for INITIA, the housing brand of a major real estate developer: new condominiums, new detached houses and renovation, with property search, renovation and case-study pages, listings from external APIs, and motion and 3D effects.',
          ja: '大手不動産デベロッパーの住まいブランド「INITIA」の公式ブランドサイト。新築マンション・新築一戸建・リノベーションを紹介し、物件検索やリノベーション・事例ページ、外部 API の物件情報連携、モーションや 3D 表現を実装しました。',
        },
        images: [
          {
            src: '/projects/initia.jpg',
            width: 800,
            height: 499,
            alt: { en: 'Screenshot of the INITIA website', ja: 'INITIA サイトのスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://www.cigr.co.jp/pj/contents/' }],
      },
      {
        slug: 'infinito-hotel',
        title: { en: 'INFINITO HOTEL & SPA', ja: 'INFINITO HOTEL & SPA 南紀白浜' },
        // TODO(owner): 公開年。説明と使用技術は履歴書と公開サイトをもとにしたもの。違っていたら直す
        tags: ['Astro','TypeScript','Tailwind CSS','GitHub Actions','reCAPTCHA'],
        description: {
          en: 'Official website for INFINITO HOTEL & SPA in Nanki-Shirahama: hot spring, rooms, cuisine and sightseeing. Available in seven languages, with reCAPTCHA-protected forms and automated staging and production deploys.',
          ja: '南紀白浜の「INFINITO HOTEL & SPA」の公式サイト。温泉・客室・食事・観光を紹介します。7 言語に対応し、reCAPTCHA 付きのフォームと、ステージング／本番への自動デプロイを備えています。',
        },
        images: [
          {
            src: '/projects/infinito.jpg',
            width: 800,
            height: 499,
            alt: { en: 'Screenshot of the INFINITO HOTEL & SPA website', ja: 'INFINITO HOTEL & SPA サイトのスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://hotel-infinito.co.jp/' }],
      },
      {
        slug: 'initia-lounge-mita',
        title: { en: 'INITIA LOUNGE Mita', ja: 'イニシアラウンジ三田' },
        // TODO(owner): 公開年。説明と使用技術は履歴書と公開サイトをもとにしたもの。違っていたら直す
        tags: ['Astro','Swiper','Panzoom','Vitest'],
        description: {
          en: 'Site for INITIA LOUNGE Mita, a housing gallery by Mita Station in Tokyo: the concept room, the visit flow, events and the property lineup, with an event slider and modals and zoomable floor plans.',
          ja: '三田駅すぐの住まいのギャラリー「イニシアラウンジ三田」のサイト。コンセプトルーム、ご案内の流れ、イベント、ラインアップを紹介し、イベントスライダーとモーダル、拡大できる間取り図を実装しました。',
        },
        images: [
          {
            src: '/projects/initia-lounge-mita.jpg',
            width: 800,
            height: 499,
            alt: { en: 'Screenshot of the INITIA LOUNGE Mita website', ja: 'イニシアラウンジ三田 サイトのスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://www.cigr.co.jp/pj/contents/product/stance/gallery-mita/' }],
      },
      {
        slug: 'one-roof',
        title: { en: 'ONE ROOF', ja: 'ONE ROOF（ワンルーフ）' },
        // TODO(owner): 公開年。説明と使用技術は履歴書と公開サイトをもとにしたもの。違っていたら直す
        tags: ['EJS','SCSS','Barba.js','Google Maps'],
        description: {
          en: 'Brand site for ONE ROOF, a line of luxury rental residences in Tokyo and Osaka: more than 20 property pages, a Google Maps property map, page transitions, and Japanese and English versions.',
          ja: '東京・大阪の高級賃貸レジデンス「ONE ROOF」のブランドサイト。20 ページ以上の物件ページ、Google Maps の物件マップ、ページ遷移の演出、日本語・英語の 2 言語に対応しています。',
        },
        images: [
          {
            src: '/projects/one-roof.jpg',
            width: 800,
            height: 499,
            alt: { en: 'Screenshot of the ONE ROOF website', ja: 'ONE ROOF サイトのスクリーンショット' },
          },
        ],
        links: [{ label: { en: 'Visit site', ja: 'サイトを見る' }, href: 'https://one-roof.co.jp/' }],
      },
    ],
  },
  {
    slug: 'work',
    type: 'ALBUM',
    title: { en: 'Work Experience', ja: '職歴' },
    blurb: {
      en: "Where I've worked and what I did there: AXR, Holon Inc., DIGITAL Hearts and Willworks, plus my education.",
      ja: 'これまでの職歴と担当した仕事（AXR、Holon Inc.、DIGITAL Hearts、Willworks）と学歴。',
    },
    // 最新の在籍年
    year: 2026,
    // 2 枚組：Disc 1 = 職歴、Disc 2 = 学歴
    discs: [
      { title: { en: 'Work', ja: '職歴' } },
      { title: { en: 'Education', ja: '学歴' } },
    ],
    accent: '#3d7be0',
    cover: '/covers/work.webp',
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
      {
        slug: 'digital-hearts',
        title: { en: 'Linguistic Game Tester · DIGITAL Hearts Holdings', ja: 'ゲーム言語テスター · DIGITAL Hearts Holdings' },
        meta: { en: 'Jan 2021 — Apr 2023', ja: '2021年1月 — 2023年4月' },
        description: {
          en: 'Tokyo, Japan. Part-time.',
          ja: '東京。パートタイム。',
        },
        bullets: [
          {
            en: 'Tested the linguistics of multiple video game and trading card game titles at various offices in Tokyo.',
            ja: '東京のさまざまなオフィスで、複数のビデオゲーム／トレーディングカードゲームのタイトルについて、言語面のテストを担当。',
          },
          {
            en: 'Found and logged mistakes in grammar, consistency, nuance and more in the UI and dialogue, and reported them to clients in Excel, in Japanese or English depending on the client.',
            ja: 'UI やセリフに含まれる文法・表記の一貫性・ニュアンスなどの誤りを洗い出し、クライアントの希望に応じて日本語または英語で、Excel にまとめて報告。',
          },
          {
            en: 'Translated untranslated or mistranslated text, mainly from Japanese to English.',
            ja: '未翻訳・誤訳のテキストを、主に日本語から英語へ翻訳。',
          },
        ],
      },
      {
        slug: 'willworks',
        title: { en: 'Human Resources Assistant · Willworks', ja: '人事アシスタント · Willworks' },
        meta: { en: 'Jan 2020 — Apr 2020', ja: '2020年1月 — 2020年4月' },
        description: {
          en: 'Greater Tokyo Area. Internship.',
          ja: '東京近郊。インターンシップ。',
        },
        bullets: [
          {
            en: 'Managed job descriptions and candidates for job openings at various Japanese and foreign companies.',
            ja: '日本企業・外資系企業のさまざまな求人について、求人票（ジョブディスクリプション）と候補者を管理。',
          },
          {
            en: "Created the company's pages on LinkedIn and Gaijin-Pot, which required translating company information from Japanese to English.",
            ja: '会社の LinkedIn と Gaijin-Pot のページを作成。会社情報を日本語から英語へ翻訳しました。',
          },
          {
            en: 'Analyzed data from Porters HR (Business Cloud) using Excel and R to design a better approach to HR and recruiting, and presented the findings in Japanese to other employees, including the president.',
            ja: 'Porters HR（Business Cloud）のデータを Excel と R で分析し、採用・人事の進め方を最適化する案をまとめ、社長を含む社員に日本語でプレゼンテーション。',
          },
          {
            en: 'Translated job descriptions and company details from English to Japanese and from Japanese to English.',
            ja: '求人票や会社情報を、英語から日本語、日本語から英語へ翻訳。',
          },
        ],
      },
      {
        slug: 'temple',
        title: { en: 'Temple University, Japan Campus', ja: 'テンプル大学ジャパンキャンパス' },
        disc: 2,
        meta: { en: '2017 — 2020', ja: '2017年 — 2020年' },
        description: {
          en: 'Bachelor of Arts in Economics, studying behavioral economics and econometrics. GPA 4.0.',
          ja: '経済学士。行動経済学・計量経済学を専攻。GPA 4.0。',
        },
      },
      {
        slug: 'el-camino',
        title: { en: 'El Camino College', ja: 'エルカミーノ・カレッジ' },
        disc: 2,
        meta: { en: '2015 — 2017', ja: '2015年 — 2017年' },
        // TODO(owner): LinkedIn では「Bachelor's degree, Economics」だが、2 年制の大学のため学位の表記は省いてある。正しい表記を確認する
        description: {
          en: 'Economics. GPA 3.5.',
          ja: '経済学を専攻。GPA 3.5。',
        },
      },
    ],
  },
  {
    slug: 'skills',
    type: 'ALBUM',
    title: { en: 'Skills', ja: 'スキル' },
    blurb: {
      en: 'The languages, frameworks and tools I work with.',
      ja: '使っている言語・フレームワーク・ツール。',
    },
    accent: '#23a7a0',
    cover: '/covers/skills.webp',
    // 履歴書の Technical Skills をもとにした一覧。「そのほかのスキル」だけ、技術名ではなく説明なので箇条書きにしてある
    tracks: [
      {
        slug: 'languages',
        title: { en: 'Languages', ja: '言語' },
        meta: { en: '7 items', ja: '7 件' },
        tags: ['JavaScript (ES2015+)', 'TypeScript', 'HTML5', 'CSS3', 'SCSS', 'JSX / TSX', 'EJS'],
      },
      {
        slug: 'frameworks',
        title: { en: 'Frameworks & libraries', ja: 'フレームワーク・ライブラリ' },
        meta: { en: '12 items', ja: '12 件' },
        tags: ['React', 'Next.js', 'Astro', 'Zustand', 'nanostores', 'GSAP', 'Lenis', 'Three.js (React Three Fiber)', 'Framer Motion', 'Barba.js', 'Swiper', 'Splide'],
      },
      {
        slug: 'styling',
        title: { en: 'Styling', ja: 'スタイリング' },
        meta: { en: '3 items', ja: '3 件' },
        tags: ['Tailwind CSS', 'SCSS (Sass)', 'BEM'],
      },
      {
        slug: 'tools',
        title: { en: 'Tools', ja: 'ツール' },
        meta: { en: '11 items', ja: '11 件' },
        tags: ['Git', 'GitHub', 'GitHub Actions', 'Netlify', 'Vite', 'webpack', 'Gulp', 'Babel', 'Biome', 'ESLint', 'Claude Code'],
      },
      {
        slug: 'design',
        title: { en: 'Design', ja: 'デザイン' },
        meta: { en: '3 items', ja: '3 件' },
        tags: ['Figma', 'Photoshop', 'Adobe XD'],
      },
      {
        slug: 'testing',
        title: { en: 'Testing', ja: 'テスト' },
        meta: { en: '4 items', ja: '4 件' },
        tags: ['Jest', 'Vitest', 'Testing Library', 'Playwright'],
      },
      {
        slug: 'other',
        title: { en: 'Other skills', ja: 'そのほかのスキル' },
        meta: { en: '9 items', ja: '9 件' },
        bullets: [
          { en: 'REST API integration', ja: 'REST API の連携' },
          { en: 'Google Maps API', ja: 'Google Maps API' },
          { en: 'GTM (Google Tag Manager)', ja: 'GTM（Google タグマネージャー）' },
          { en: 'reCAPTCHA', ja: 'reCAPTCHA' },
          { en: 'Multilingual sites (7 languages)', ja: '多言語サイト（7 言語）' },
          { en: 'Responsive design', ja: 'レスポンシブデザイン' },
          { en: 'Performance optimization', ja: 'パフォーマンス最適化' },
          { en: 'SEO', ja: 'SEO' },
          { en: 'CI/CD', ja: 'CI/CD' },
        ],
      },
      {
        slug: 'backend',
        title: { en: 'Backend (learning)', ja: 'バックエンド（学習中）' },
        meta: { en: '4 items', ja: '4 件' },
        tags: ['Node.js', 'REST API design', 'SQL / relational database design', 'Docker'],
      },
      {
        slug: 'familiar',
        title: { en: 'Familiar with', ja: '触れたことのある技術' },
        meta: { en: '2 items', ja: '2 件' },
        tags: ['Vue.js', 'jQuery'],
      },
    ],
  },
  {
    slug: 'contact',
    // 3 トラック（メール・GitHub・LinkedIn）なので EP
    type: 'EP',
    title: { en: 'Contact', ja: 'お問い合わせ' },
    blurb: {
      en: 'Email, GitHub and LinkedIn: the ways to get in touch.',
      ja: 'メール、GitHub、LinkedIn。ご連絡はこちらから。',
    },
    accent: '#d9a72b',
    cover: '/covers/contact.webp',
    tracks: [
      {
        slug: 'email',
        title: { en: 'Email', ja: 'メール' },
        meta: { en: 'ken.oshimoto@gmail.com', ja: 'ken.oshimoto@gmail.com' },
        description: {
          en: 'Write to me from your own mail app.',
          ja: 'お使いのメールアプリから直接ご連絡ください。',
        },
        links: [{ label: { en: 'Email', ja: 'メール' }, href: 'mailto:ken.oshimoto@gmail.com' }],
      },
      {
        slug: 'github',
        title: { en: 'GitHub', ja: 'GitHub' },
        meta: { en: 'kenola12345', ja: 'kenola12345' },
        description: {
          en: 'My code and side projects.',
          ja: 'コードや個人開発のプロジェクトはこちら。',
        },
        links: [{ label: { en: 'GitHub', ja: 'GitHub' }, href: 'https://github.com/kenola12345' }],
      },
      {
        slug: 'linkedin',
        title: { en: 'LinkedIn', ja: 'LinkedIn' },
        meta: { en: 'kentaro-oshimoto', ja: 'kentaro-oshimoto' },
        description: {
          en: 'My professional profile and work history.',
          ja: '職務経歴などのプロフィールはこちら。',
        },
        links: [{ label: { en: 'LinkedIn', ja: 'LinkedIn' }, href: 'https://www.linkedin.com/in/kentaro-oshimoto/' }],
      },
    ],
  },
];

/** slug からアルバムを引く。存在しない slug は undefined */
export function getAlbum(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}
