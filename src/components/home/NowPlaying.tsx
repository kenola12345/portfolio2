import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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

/**
 * ボタンのアイコン（SVG）。文字（▶ ⏭）だと、iOS ではカラー絵文字で描かれて、色や大きさが変わってしまうため
 */
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4.2" height="14" rx="1" />
    <rect x="13.8" y="5" width="4.2" height="14" rx="1" />
  </svg>
);
const NextIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
    <path d="M5 5.6v12.8a.9.9 0 0 0 1.4.75l9-6.4a.9.9 0 0 0 0-1.5l-9-6.4A.9.9 0 0 0 5 5.6z" />
    <rect x="17" y="5" width="2.6" height="14" rx="1" />
  </svg>
);

/** ターンテーブルが回っているかを、3D 側（Turntable）に伝えるイベントの名前 */
export const PLAYING_EVENT = 'side-b:playing';

/**
 * 「NOW SPINNING」のミュージックプレイヤー。再生・一時停止と次の曲、イコライザー付き。
 * 曲は最後まで流れたら次の曲へ進み、全部終わったら最初に戻る。再生するとターンテーブルの回転が速くなる。
 * ヒーローで一度再生すると、そのカードが画面から外れたとき右下に固定されて、スクロールしても止められる（再生前は出ない）。
 * ブラウザは、ユーザーが押すまで音を出せないので、最初は止まった状態から始まる。
 */
export default function NowPlaying({ kicker, tracks, playLabel, pauseLabel, nextLabel }: Props) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [docked, setDocked] = useState(false);
  // 一度でも再生したか（固定表示は、ヒーローで再生を押したあとだけ出す。一時停止しても、消さずに残す）
  const [started, setStarted] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const track = tracks[index];

  // 再生状態をターンテーブルへ伝える
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PLAYING_EVENT, { detail: playing }));
    if (playing) setStarted(true);
  }, [playing]);

  // ヒーローのカードの場所が見えなくなったら、右下に固定する
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  // どの端末でも、スクロールしているあいだは固定のプレイヤーを隠し、止まったらまた出す
  // （指で操作している最中に、画面の端に居座って邪魔にならないように）
  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      setScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), 220);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
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

  const card = (
    <div className={`now-playing${docked ? ' docked' : ''}${docked && scrolling ? ' hidden-while-scrolling' : ''}`}>
      <button type="button" className="play-button" onClick={toggle} aria-label={playing ? pauseLabel : playLabel}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="now-playing__text">
        <span>{kicker}</span>
        <strong>{track.title}</strong>
        <em>{track.artist}</em>
      </div>
      <button type="button" className="next-button" onClick={next} aria-label={nextLabel}>
        <NextIcon />
      </button>
      <div className={`equalizer${playing ? ' playing' : ''}`} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => (
          <i key={bar} />
        ))}
      </div>
    </div>
  );

  /**
   * 固定表示のカードは <body> 直下に出す。ヒーローの中に置いたままだと、ヒーローの重なりの順番（z-index）に
   * 閉じ込められて、あとのセクションの下に隠れてしまうため。audio はここ（常に同じ場所）に置くので、
   * カードの出し入れで音が途切れない
   */
  const place = (node: ReactNode) => {
    if (!docked) return node;
    // まだ再生していないなら、固定のプレイヤーは出さない
    if (!started || typeof document === 'undefined') return null;
    return createPortal(node, document.body);
  };

  return (
    <div className="np-slot" ref={slotRef}>
      <audio ref={audioRef} preload="none" onEnded={next} />
      {place(card)}
    </div>
  );
}
