import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useProgress } from '@react-three/drei';
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three';
import Record from './Record';
import RecordPlayer from './RecordPlayer';
import Sleeve from './Sleeve';
import { slugHandlers } from './useSlugHandlers';
import { HOME, RECORD_MODEL_RADIUS, STAGE, layoutKeyFor } from './config';
import { bindStageEvents, layout } from './stageLayout';
import { home, view } from './stageView';

export interface RecordDef {
  slug: string;
  cover: string;
  href: string;
}

const RECORD_SCALE = HOME.recordRadius / RECORD_MODEL_RADIUS;
/** 盤面の法線（+Z）を真上（+Y）に向ける = 台の上に平らに置いた向き */
const FLAT = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0));
/** アルバムページのスロットでの向き。正面に向け、少しだけ傾ける */
const PAGE_QUAT = new Quaternion().setFromEuler(new Euler(-STAGE.slotTilt, 0, 0));
const _offset = new Vector3();

interface Target {
  pos: Vector3;
  quat: Quaternion;
  scale: number;
  spin: number;
  hidden: boolean;
}
const newTarget = (): Target => ({ pos: new Vector3(), quat: new Quaternion(), scale: 0, spin: 0, hidden: true });

const _local = new Vector3();
const _groupQuat = new Quaternion();

/**
 * レコード slug の目標状態（ワールド座標）を求める。毎フレーム呼ぶ。
 * ホームでは台の上のジャケットから、アルバムページでは DOM のスロットの矩形から決める。
 * tucked = true はジャケットの中に完全に収まった状態（初回表示・棚に戻るとき用）
 */
function computeTarget(slug: string, out: Target, canvas: { width: number; height: number }, tucked = false): boolean {
  out.hidden = true;
  out.scale = 0;
  out.spin = 0;

  if (layout.mode === 'page' && layout.slot) {
    if (layout.slot.slug !== slug) return true;
    const r = layout.slot.el.getBoundingClientRect();
    const wpp = view.worldPerPx;
    out.pos.set((r.left + r.width / 2 - canvas.width / 2) * wpp, (canvas.height / 2 - (r.top + r.height / 2)) * wpp, 0);
    out.quat.copy(PAGE_QUAT);
    out.scale = (r.width * wpp) / 2 / RECORD_MODEL_RADIUS;
    out.spin = STAGE.spinSlot;
    out.hidden = false;
    return true;
  }

  if (layout.mode === 'home') {
    const layoutCfg = HOME.layouts[view.layoutKey];
    const cfg = layoutCfg.sleeves[slug];
    const g = home.group;
    if (!cfg || !g) return false;
    const pulled = layout.pulled === slug && !tucked;
    const hover = layout.hover === slug && !tucked;
    const peek = tucked ? 0 : pulled ? HOME.peek.pulled : hover ? HOME.peek.hover : HOME.peek.rest;
    _local
      .set(cfg.x + cfg.dir[0] * peek, HOME.sleeve.thickness / 2 + (pulled ? HOME.lift : 0), cfg.z + cfg.dir[1] * peek)
      .add(_offset.set(...layoutCfg.offset));
    g.updateWorldMatrix(true, false);
    out.pos.copy(_local).applyMatrix4(g.matrixWorld);
    g.getWorldQuaternion(_groupQuat);
    out.quat.copy(_groupQuat).multiply(FLAT);
    out.scale = g.scale.x * RECORD_SCALE;
    out.spin = pulled ? STAGE.spinPulled : hover ? STAGE.spinHover : 0;
    out.hidden = false;
  }
  return true;
}

/**
 * 1 枚のレコード。世界座標で動かし、ホームではジャケット、アルバムページではスロットへ向かう。
 * React の state は使わず、毎フレーム ref だけを書き換える
 */
function StageRecord({ slug, cover, href }: RecordDef) {
  const root = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const canvas = useThree((s) => s.size);
  const handlers = useMemo(() => slugHandlers(slug, href), [slug, href]);
  const cur = useRef({ ready: false, pos: new Vector3(), quat: new Quaternion(), scale: 0 });
  const target = useRef(newTarget());
  const tucked = useRef(newTarget());
  const spin = useRef(0);

  useFrame((_, rawDelta) => {
    const g = root.current;
    const spinG = spinRef.current;
    if (!g || !spinG) return;
    const dt = Math.min(rawDelta, 0.05);
    const s = cur.current;
    const t = target.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!computeTarget(slug, t, canvas)) return; // DOM が入れ替わっている最中は前の状態を保つ

    // 初回、または隠れていた（大きさ 0 だった）レコードが棚に戻るときは、ジャケットの中から出てくる
    if (layout.mode === 'home' && !t.hidden && s.scale < 1e-3) {
      if (computeTarget(slug, tucked.current, canvas, true)) {
        s.pos.copy(tucked.current.pos);
        s.quat.copy(tucked.current.quat);
      }
      s.ready = true;
    } else if (!s.ready) {
      s.pos.copy(t.pos);
      s.quat.copy(t.quat);
      s.ready = true;
    }

    const lambda = reduce ? 60 : t.hidden ? STAGE.damp * 1.8 : STAGE.damp;
    if (!t.hidden) {
      s.pos.set(
        MathUtils.damp(s.pos.x, t.pos.x, lambda, dt),
        MathUtils.damp(s.pos.y, t.pos.y, lambda, dt),
        MathUtils.damp(s.pos.z, t.pos.z, lambda, dt),
      );
      s.quat.slerp(t.quat, 1 - Math.exp(-lambda * dt));
    }
    s.scale = MathUtils.damp(s.scale, t.scale, lambda, dt);
    spin.current = MathUtils.damp(spin.current, reduce ? 0 : t.spin, 5, dt);

    g.visible = s.scale > 1e-3;
    g.position.copy(s.pos);
    g.quaternion.copy(s.quat);
    g.scale.setScalar(Math.max(s.scale, 1e-4));
    spinG.rotation.z -= spin.current * dt;
  });

  return (
    <group ref={root} visible={false} {...handlers}>
      <group ref={spinRef}>
        <Record cover={cover} />
      </group>
    </group>
  );
}

/**
 * ホームの台。プレーヤーとジャケットを載せ、X 軸まわりに傾けて斜め上から見下ろす。
 * ページを下へスクロールすると一緒に上へ流れ、アルバムページでは縮んで消える
 */
function HomeScene({ records }: { records: RecordDef[] }) {
  const ref = useRef<Group>(null);
  const scale = useRef(0);
  // 縦長・横長で配置を切り替える（切り替わるときだけ再描画される）
  const key = useThree((s) => layoutKeyFor(s.size.width / s.size.height));
  const L = HOME.layouts[key];

  useFrame((_, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 0.05);
    // ローディングが終わるまでは出さない（終わってから、ふわっと現れる）
    const want = layout.mode === 'home' && layout.ready ? 1 : 0;
    scale.current = MathUtils.damp(scale.current, want, 6, dt);
    g.visible = scale.current > 0.01;
    g.scale.setScalar(Math.max(scale.current, 1e-4));
    g.position.y = window.scrollY * view.worldPerPx;
  });

  return (
    <group
      ref={(g) => {
        ref.current = g;
        home.group = g;
      }}
      rotation={[HOME.tilt, 0, 0]}
    >
      <group position={L.offset}>
        <RecordPlayer position={L.playerPosition} />
        {records.map((r) => {
          const cfg = L.sleeves[r.slug];
          return cfg ? (
            <Sleeve key={r.slug} cover={r.cover} x={cfg.x} z={cfg.z} handlers={slugHandlers(r.slug, r.href)} />
          ) : null;
        })}
      </group>
    </group>
  );
}

/** 画面の大きさに合わせてカメラの距離を決め、DOM の px とワールドの対応（view）を更新する */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const key = layoutKeyFor(aspect);
    const L = HOME.layouts[key];
    view.layoutKey = key;
    let height = Math.max(L.viewHeight, L.viewWidth / aspect);
    // 開発中だけ：?zoom=3&cy=0.3 でカメラを寄せ、モデルの細部を確認できる
    let cy = 0;
    if (import.meta.env.DEV) {
      const q = new URLSearchParams(location.search);
      height /= Number(q.get('zoom')) || 1;
      cy = Number(q.get('cy')) || 0;
    }
    const distance = height / (2 * Math.tan(MathUtils.degToRad(HOME.fov) / 2));
    camera.position.set(0, cy, distance);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
    view.visibleHeight = height;
    view.visibleWidth = height * aspect;
    view.worldPerPx = height / size.height;
  }, [camera, size]);

  return null;
}

/**
 * ローディング画面（AppLayout の #loading-screen）のバー。
 * GLB やテクスチャの読み込みの進み具合（three の LoadingManager）をそのまま反映し、
 * 追加の読み込みが始まらずに少し経ったら画面を開く。
 */
function LoadingBridge() {
  const { progress, active } = useProgress();
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    document.getElementById('loading-screen')?.setAttribute('data-done', '');
    layout.ready = true;
  };

  useEffect(() => {
    if (finished.current) return;
    const el = document.getElementById('loading-screen');
    if (el) {
      el.style.setProperty('--progress', String(Math.min(progress, 100) / 100));
      const pct = el.querySelector('[data-pct]');
      if (pct) pct.textContent = String(Math.round(progress));
    }
    if (progress >= 100 && !active) {
      const timer = window.setTimeout(finish, STAGE.loadSettleMs);
      return () => window.clearTimeout(timer);
    }
  }, [progress, active]);

  // 何かで読み込みが終わらなくても、ずっと画面が隠れたままにならないようにする
  useEffect(() => {
    const timer = window.setTimeout(finish, STAGE.loadTimeoutMs);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

/**
 * サイト全体で 1 つだけの 3D キャンバス。DOM の背後に固定され、ページ遷移しても残る（transition:persist）。
 * ホームではプレーヤーとジャケットの 3D 棚、アルバムページでは左上のスロットで回るレコードを描く。
 */
export default function RecordStage({ records }: { records: RecordDef[] }) {
  useEffect(() => bindStageEvents(), []);

  return (
    <>
      <LoadingBridge />
      <div
        className="stage-root"
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 0, viewTransitionName: 'stage' }}
      >
        <Canvas
          camera={{ fov: HOME.fov, near: 0.05, far: 80, position: [0, 0, 8] }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            // 縦スクロールは通す（キャンバスの上でもページをスワイプできるように）
            gl.domElement.style.touchAction = 'pan-y';
          }}
        >
          <CameraRig />
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 4, 3]} intensity={1.5} />
          <Suspense fallback={null}>
            <HomeScene records={records} />
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
    </>
  );
}
