import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import Record from './Record';
import { RECORD_MODEL_RADIUS, STAGE } from './config';
import { bindStageEvents, computeTarget, layout } from './stageLayout';

export interface RecordDef {
  slug: string;
  cover: string;
}

/**
 * 1 枚のレコード。毎フレーム DOM（ジャケット or スロット）の位置を読み、
 * 指数減衰でそこへ動く。React の state は使わず ref だけを書き換える。
 */
function StageRecord({ slug, cover }: RecordDef) {
  const root = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const viewport = useThree((s) => s.size);
  const cur = useRef({ ready: false, x: 0, y: 0, size: 0, tilt: 0, spin: 0 });

  useFrame((_, rawDelta) => {
    const g = root.current;
    const spinG = spinRef.current;
    const tiltG = tiltRef.current;
    if (!g || !spinG || !tiltG) return;
    const dt = Math.min(rawDelta, 0.05);
    const s = cur.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = computeTarget(slug);
    if (!target) return; // DOM が入れ替わっている最中は前の状態を保つ

    const toWorld = (cx: number, cy: number) => ({
      x: cx - viewport.width / 2,
      y: viewport.height / 2 - cy,
    });

    if (!s.ready) {
      // 初回は動かさず置く。スロットなら直接、ジャケットなら裏に隠れた位置から始める
      const start = target.hidden ? target : (computeTarget(slug, true) ?? target);
      const p = toWorld(start.cx, start.cy);
      s.x = p.x;
      s.y = p.y;
      s.size = start.hidden ? 0 : start.size;
      s.ready = true;
    }

    // 隠れていたレコードが棚に戻るときは、ジャケットの裏に隠れた状態から出てくる
    // （縮んだ状態から膨らむと、ジャケットが出る前に盤だけ見えてしまうため）
    if (!layout.slot && !target.hidden && s.size < 1) {
      const tucked = computeTarget(slug, true);
      if (tucked && !tucked.hidden) {
        const p = toWorld(tucked.cx, tucked.cy);
        s.x = p.x;
        s.y = p.y;
        s.size = tucked.size;
      }
    }

    // 隠すときは速く縮め、出てくるときは通常の速さ
    const lambda = reduce ? 60 : target.hidden ? STAGE.damp * 1.8 : STAGE.damp;
    const tp = toWorld(target.cx, target.cy);
    // 隠すときは下へ落としながら縮める
    const ty = target.hidden ? s.y - 40 : tp.y;
    s.x = target.hidden ? s.x : MathUtils.damp(s.x, tp.x, lambda, dt);
    s.y = MathUtils.damp(s.y, ty, lambda, dt);
    s.size = MathUtils.damp(s.size, target.hidden ? 0 : target.size, lambda, dt);
    s.tilt = MathUtils.damp(s.tilt, target.tilt, lambda, dt);
    s.spin = MathUtils.damp(s.spin, reduce ? 0 : target.spin, 5, dt);

    g.visible = s.size > 1;
    g.position.set(s.x, s.y, 0);
    g.scale.setScalar(s.size / 2 / RECORD_MODEL_RADIUS || 0.0001);
    tiltG.rotation.x = -s.tilt;
    spinG.rotation.z -= s.spin * dt;
  });

  return (
    <group ref={root} visible={false}>
      <group ref={tiltRef}>
        <group ref={spinRef}>
          <Record cover={cover} />
        </group>
      </group>
    </group>
  );
}

/**
 * サイト全体で 1 つだけの 3D キャンバス。DOM の背後に固定され、ページ遷移しても残る（transition:persist）。
 * 正射影カメラで 1 ユニット = 1 CSS px なので、DOM の矩形がそのまま 3D の座標になる。
 */
export default function RecordStage({ records }: { records: RecordDef[] }) {
  useEffect(() => bindStageEvents(), []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        viewTransitionName: 'stage',
      }}
    >
      <Canvas orthographic camera={{ position: [0, 0, 1000], near: 0.1, far: 3000, zoom: 1 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[300, 500, 800]} intensity={1.1} />
        <Suspense fallback={null}>
          {records.map((r) => (
            <StageRecord key={r.slug} {...r} />
          ))}
          {/* 外部の HDR を読み込まず、光の板だけで映り込みを作る */}
          <Environment resolution={256}>
            <Lightformer intensity={1.2} position={[0, 4, 3]} scale={[10, 2, 1]} />
            <Lightformer intensity={0.8} position={[-5, 0, 2]} scale={[2, 6, 1]} />
            <Lightformer intensity={0.8} position={[5, 0, 2]} scale={[2, 6, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
