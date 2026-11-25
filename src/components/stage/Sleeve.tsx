import { useTexture } from '@react-three/drei';
import { HOME } from './config';
import type { SlugHandlers } from './useSlugHandlers';

interface SleeveProps {
  cover: string;
  x: number;
  z: number;
  yaw: number;
  handlers: SlugHandlers;
}

/**
 * ジャケット 1 枚。台の上に平らに置いた薄い箱（白い縁）に、アルバム画像を貼った板を重ねる。
 * 盤はこの箱の厚みの中を通って出入りするので、箱の外にはみ出した部分だけが見える
 */
export default function Sleeve({ cover, x, z, yaw, handlers }: SleeveProps) {
  const texture = useTexture(cover);
  const { size, thickness, inset } = HOME.sleeve;
  const art = size - inset * 2;

  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]} {...handlers}>
      <mesh position={[0, thickness / 2, 0]}>
        <boxGeometry args={[size, thickness, size]} />
        <meshStandardMaterial color="#ece9e1" roughness={0.85} />
      </mesh>
      <mesh position={[0, thickness + 0.0004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[art, art]} />
        <meshStandardMaterial map={texture} roughness={0.6} />
      </mesh>
    </group>
  );
}
