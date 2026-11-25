import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import type { Group } from 'three';
import Record from './Record';
import { SHOWCASE } from './config';

interface ShowcaseProps {
  covers: string[];
}

/** 1 枚分の配置。盤面を少し寝かせ、自分の軸でゆっくり回す */
function SpinningRecord({ cover, x }: { cover: string; x: number }) {
  const spinRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.z -= delta * SHOWCASE.spinSpeed;
  });
  return (
    <group position={[x, 0, 0]} rotation={[SHOWCASE.tiltX, 0, 0]}>
      <group ref={spinRef}>
        <Record cover={cover} />
      </group>
    </group>
  );
}

/** 全レコードを横一列に並べ、画面幅に収まるよう全体を縮める */
function Row({ covers }: ShowcaseProps) {
  const { viewport } = useThree();
  const totalWidth = covers.length * SHOWCASE.spacing;
  const scale = Math.min(1, (viewport.width * 0.92) / totalWidth);
  const start = -((covers.length - 1) * SHOWCASE.spacing) / 2;
  return (
    <group scale={scale}>
      {covers.map((cover, i) => (
        <SpinningRecord key={cover} cover={cover} x={start + i * SHOWCASE.spacing} />
      ))}
    </group>
  );
}

/**
 * 仮のレコード一覧（Phase 3 で本番の棚 Shelf に置き換える）。
 * GLB に各アルバム画像が正しく貼られているかを確認するためのもの。
 */
export default function RecordShowcase({ covers }: ShowcaseProps) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 35 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <Suspense fallback={null}>
        <Row covers={covers} />
        {/* 外部の HDR を読み込まず、光の板だけで映り込みを作る */}
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 4, 3]} scale={[10, 2, 1]} />
          <Lightformer intensity={1} position={[-5, 0, 2]} scale={[2, 6, 1]} />
          <Lightformer intensity={1} position={[5, 0, 2]} scale={[2, 6, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
