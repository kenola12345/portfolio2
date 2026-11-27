/**
 * ホームの「NOW SPINNING」で流れる音楽。音源は public/audio にあり、ブラウザで再生を押したときだけ読み込む。
 * 出典・ライセンスは CREDITS.md に書いてある（Pixabay のコンテンツライセンス）。
 */
export interface MusicTrack {
  src: string;
  title: string;
  artist: string;
}

export const music: MusicTrack[] = [
  { src: '/audio/stylish-hip-hop.mp3', title: 'Stylish Hip Hop', artist: 'blesksound' },
  { src: '/audio/chill-hip-hop.mp3', title: 'Chill Hip Hop', artist: 'velariomusic' },
  { src: '/audio/oldschool-hip-hop.mp3', title: 'Oldschool Hip Hop', artist: 'sub_clair' },
];
