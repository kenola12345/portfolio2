import type { ThreeEvent } from '@react-three/fiber';
import { activate, isDragging, layout, setHover } from './stageLayout';

export interface SlugHandlers {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

/** キャンバスのカーソルを変える（空にすると CSS の既定＝つかむ手に戻る） */
const setCursor = (e: ThreeEvent<PointerEvent | MouseEvent>, cursor: string) => {
  const canvas = e.nativeEvent.target;
  if (canvas instanceof HTMLElement) canvas.style.cursor = cursor;
};

/** ジャケットとレコードが共有する、ホバー（盤が顔を出す）とクリック（引き出して遷移）の処理 */
export function slugHandlers(slug: string, href: string): SlugHandlers {
  return {
    onPointerOver: (e) => {
      if (layout.mode !== 'home') return;
      e.stopPropagation();
      // ドラッグ中は盤を出したりカードを出したりせず、終わったときに反映する
      if (isDragging()) {
        layout.pendingHover = slug;
        return;
      }
      setHover(slug);
      setCursor(e, 'pointer');
    },
    onPointerOut: (e) => {
      if (layout.pendingHover === slug) layout.pendingHover = null;
      if (layout.hover === slug && !isDragging()) setHover(null);
      setCursor(e, '');
    },
    onClick: (e) => {
      if (layout.mode !== 'home') return;
      e.stopPropagation();
      setCursor(e, '');
      activate(slug, href);
    },
  };
}
