import { useEffect, useRef, useState } from 'react';
import './NowPlaying.css';

interface Track {
  src: string;
  title: string;
  artist: string;
}

interface Props {
  kicker: string;
  tracks: Track[];
  playLabel: string;
  pauseLabel: string;
  nextLabel: string;
}

/** ターンテーブルが回っているかを、3D 側（Turntable）に伝えるイベントの名前 */
export const PLAYING_EVENT = 'side-b:playing';

/**
 * 「NOW SPINNING」のミュージックプレイヤー。再生・一時停止と次の曲、イコライザー付き。
 * 曲は最後まで流れたら次の曲へ進み、全部終わったら最初に戻る。再生するとターンテーブルの回転が速くなる。
 * ヒーローのカードが画面から外れると、右下に固定されて、スクロールしても止められる。
 * ブラウザは、ユーザーが押すまで音を出せないので、最初は止まった状態から始まる。
 */
export default function NowPlaying({ kicker, tracks, playLabel, pauseLabel, nextLabel }: Props) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [docked, setDocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const track = tracks[index];

  // 再生状態をターンテーブルへ伝える
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PLAYING_EVENT, { detail: playing }));
  }, [playing]);

  // ヒーローのカードの場所が見えなくなったら、右下に固定する
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  // 曲が替わったら、再生中のまま読み込み直す
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    if (playing) void audio.play().catch(() => setPlaying(false));
    // ロック画面などの操作パネルに曲名を出す
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist });
    }
    // playing は意図的に依存に入れない（再生・停止のたびに読み込み直さないため）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (!audio.src) audio.src = track.src;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const next = () => setIndex((i) => (i + 1) % tracks.length);

  return (
    <div className="np-slot" ref={slotRef}>
      <div className={`now-playing${docked ? ' docked' : ''}`}>
        <audio ref={audioRef} preload="none" onEnded={next} />
        <button type="button" className="play-button" onClick={toggle} aria-label={playing ? pauseLabel : playLabel}>
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <div className="now-playing__text">
          <span>{kicker}</span>
          <strong>{track.title}</strong>
          <em>{track.artist}</em>
        </div>
        <button type="button" className="next-button" onClick={next} aria-label={nextLabel}>
          ⏭
        </button>
        <div className={`equalizer${playing ? ' playing' : ''}`} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((bar) => (
            <i key={bar} />
          ))}
        </div>
      </div>
    </div>
  );
}
