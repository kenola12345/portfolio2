import type { ThreeEvent } from '@react-three/fiber';
import { activate, layout } from './stageLayout';

export interface SlugHandlers {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

/** ジャケットとレコードが共有する、ホバー（盤が顔を出す）とクリック（引き出して遷移）の処理 */
export function slugHandlers(slug: string, href: string): SlugHandlers {
  return {
    onPointerOver: (e) => {
      if (layout.mode !== 'home') return;
      e.stopPropagation();
      layout.hover = slug;
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      if (layout.hover === slug) layout.hover = null;
      document.body.style.cursor = '';
    },
    onClick: (e) => {
      if (layout.mode !== 'home') return;
      e.stopPropagation();
      document.body.style.cursor = '';
      activate(slug, href);
    },
  };
}
