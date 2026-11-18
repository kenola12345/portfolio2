/** 表示言語の種類 */
export type Lang = 'en' | 'ja';

/** About の文章は「薄い文字」と「強調(MaskText)」を交互に並べ、'br' で改行する */
export type AboutSegment = { text: string; bold?: boolean } | 'br';

/** 全セクションの翻訳テキスト。新しい文言はここに en / ja の両方を追加する */
export const translations = {
  en: {
    hero: {
      title: 'Full Stack Developer',
      firstName: 'KENTARO',
      lastName: 'OSHIMOTO',
    },
    about: {
      title: 'ABOUT ME',
      segments: [
        { text: 'Born and raised in ' },
        { text: 'America,', bold: true },
        { text: ' now living in ' },
        { text: 'Tokyo, Japan.', bold: true },
        'br',
        { text: ' Currently working as a ' },
        { text: 'Full Stack Developer', bold: true },
        { text: ' at a Japanese ' },
        { text: 'startup company.', bold: true },
      ] as AboutSegment[],
    },
    skills: {
      title: 'SKILLS',
      groups: {
        frontend: 'Frontend',
        backend: 'Backend',
        database: 'Database',
        tools: 'Tools',
      },
    },
    projects: {
      title: 'PROJECTS',
    },
    nav: {
      switchLabel: 'Change language',
    },
  },
  ja: {
    hero: {
      title: 'フルスタックエンジニア',
      firstName: '押本',
      lastName: '健太郎',
    },
    about: {
      title: '私について',
      segments: [
        { text: '' },
        { text: 'アメリカ', bold: true },
        { text: '生まれ・育ち。\u200b現在は' },
        { text: '東京', bold: true },
        { text: '在住。' },
        'br',
        { text: '日本の' },
        { text: 'スタートアップ企業', bold: true },
        { text: 'で' },
        { text: 'フルスタックエンジニア', bold: true },
        { text: 'として\u200b働いています。' },
      ] as AboutSegment[],
    },
    skills: {
      title: 'スキル',
      groups: {
        frontend: 'フロントエンド',
        backend: 'バックエンド',
        database: 'データベース',
        tools: 'ツール',
      },
    },
    projects: {
      title: '制作実績',
    },
    nav: {
      switchLabel: '言語を切り替える',
    },
  },
};
