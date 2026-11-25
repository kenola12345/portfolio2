/** 表示言語 */
export type Lang = 'en' | 'ja';

/** 英日両方の文言。画面に出る文字列はすべてこの形で持つ */
export type L10n = Record<Lang, string>;

/** アルバムの種別ラベル（音楽アプリの ALBUM / EP / SINGLE に合わせる） */
export type AlbumType = 'ALBUM' | 'EP' | 'SINGLE';

export type AlbumSlug = 'projects' | 'work' | 'skills' | 'contact';

/** トラック = アルバム内の 1 項目（プロジェクト 1 件、職歴 1 件など） */
export interface Track {
  /** #アンカーと Now Playing の識別に使う */
  slug: string;
  title: L10n;
  /** トラックリストの「再生時間」列に出す文字（年・在籍期間・件数など）。未確定なら省略 */
  meta?: L10n;
  /** 技術名など。翻訳しない */
  tags?: string[];
  description?: L10n;
  bullets?: L10n[];
  /** width / height は実寸。開閉アニメーションが画像の高さを先に知るために必須 */
  images?: { src: string; alt: L10n; width: number; height: number }[];
  links?: { label: string; href: string }[];
  /** true のとき、展開部分に問い合わせフォームを出す */
  form?: boolean;
}

/** アルバム = ポートフォリオの 1 セクション。ホームでは 3D レコードとして並ぶ */
export interface Album {
  slug: AlbumSlug;
  type: AlbumType;
  title: L10n;
  /** メタ行に出す年。実際の年が分かるまでは省略する（推測で入れない） */
  year?: number;
  /** ヘッダーのグラデーションとホームの光の色 */
  accent: string;
  /** レコード中央ラベルに貼る画像 */
  cover: string;
  linerNotes?: L10n;
  tracks: Track[];
}

export type SocialKind = 'github' | 'linkedin' | 'email';

/** アーティスト = 本人。About ページ（アーティストプロフィール）の内容 */
export interface Artist {
  name: L10n;
  tagline: L10n;
  bio: L10n;
  /** 紹介カードの下に並べる短い項目（拠点・言語・学歴など） */
  facts: { label: L10n; value: L10n }[];
  banner: string;
  /** ホームの「Artist」レコードのラベル画像 */
  portrait: string;
  accent: string;
  socials: { kind: SocialKind; label: string; href: string }[];
  /** 「人気の曲」に出すトラック */
  popular: { album: AlbumSlug; track: string }[];
}
