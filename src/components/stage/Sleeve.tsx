import { useRef } from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { HOME } from './config';
import { layout } from './stageLayout';
import { home } from './stageView';
import type { SlugHandlers } from './useSlugHandlers';

interface SleeveProps {
  slug: string;
  /** ジャケットの下に常に出す名前 */
  label: string;
  cover: string;
  x: number;
  z: number;
  yaw: number;
  handlers: SlugHandlers;
}

/**
 * ジャケットの下に出す名前。3D の位置に合わせて動く HTML で、台を回してもスクロールしても付いてくる。
 * ホバーしなくても何のレコードか分かるように、常に出しておく（ホバー中は明るくする）。
 * 表示・非表示（ホームを離れたら消す）は、再描画ではなく毎フレーム DOM を直接書き換える
 */
function SleeveLabel({ slug, label }: { slug: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const g = home.group;
    const visible = layout.mode === 'home' && layout.ready && g ? Math.min(1, g.scale.x) : 0;
    // 別のレコードを引き抜いている間は、ほかの名前を薄くする
    const dim = layout.pulled && layout.pulled !== slug ? 0.3 : 1;
    el.style.opacity = String(visible * dim);
    if (layout.hover === slug) el.dataset.active = '';
    else delete el.dataset.active;
  });

  // ジャケットの手前（画面の下側）に置く。ジャケット自体の回転（yaw）には付けず、いつも真横に読める位置に
  return (
    <Html position={[0, 0, HOME.sleeve.size / 2 + 0.06]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className="sleeve-label menu-text" style={{ opacity: 0 }}>
        {label}
      </div>
    </Html>
  );
}

/**
 * ジャケット 1 枚。台の上に平らに置いた薄い箱（白い縁）に、アルバム画像を貼った板を重ねる。
 * 盤はこの箱の厚みの中を通って出入りするので、箱の外にはみ出した部分だけが見える
 */
export default function Sleeve({ slug, label, cover, x, z, yaw, handlers }: SleeveProps) {
  const texture = useTexture(cover);
  const { size, thickness, inset } = HOME.sleeve;
  const art = size - inset * 2;

  return (
    <group position={[x, 0, z]} {...handlers}>
      <group rotation={[0, yaw, 0]}>
        <mesh position={[0, thickness / 2, 0]}>
          <boxGeometry args={[size, thickness, size]} />
          <meshStandardMaterial color="#ece9e1" roughness={0.85} />
        </mesh>
        <mesh position={[0, thickness + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[art, art]} />
          <meshStandardMaterial map={texture} roughness={0.6} />
        </mesh>
      </group>
      <SleeveLabel slug={slug} label={label} />
    </group>
  );
}
