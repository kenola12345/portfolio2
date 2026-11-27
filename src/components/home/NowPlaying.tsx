import { useState } from 'react';
import './NowPlaying.css';

interface Props {
  kicker: string;
  title: string;
  playLabel: string;
  pauseLabel: string;
}

/** ターンテーブルが回っているかを、3D 側（Turntable）に伝えるイベントの名前 */
export const PLAYING_EVENT = 'side-b:playing';

/**
 * 「NOW SPINNING」のカード。再生ボタンでレコードの回転を止めたり再開したりする
 * （イベントで Turntable に伝える）。右のイコライザーも連動して動く
 */
export default function NowPlaying({ kicker, title, playLabel, pauseLabel }: Props) {
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    const next = !playing;
    setPlaying(next);
    window.dispatchEvent(new CustomEvent(PLAYING_EVENT, { detail: next }));
  };

  return (
    <div className="now-playing">
      <button type="button" className="play-button" onClick={toggle} aria-label={playing ? pauseLabel : playLabel}>
        {playing ? 'Ⅱ' : '▶'}
      </button>
      <div className="now-playing__text">
        <span>{kicker}</span>
        <strong>{title}</strong>
      </div>
      <div className={`equalizer${playing ? ' playing' : ''}`} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => (
          <i key={bar} />
        ))}
      </div>
    </div>
  );
}
