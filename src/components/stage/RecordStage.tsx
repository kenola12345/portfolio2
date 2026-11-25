import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useProgress } from '@react-three/drei';
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three';
import Record from './Record';
import RecordPlayer from './RecordPlayer';
import Sleeve from './Sleeve';
import { slugHandlers } from './useSlugHandlers';
import { HOME, ORBIT, RECORD_MODEL_RADIUS, STAGE, layoutKeyFor } from './config';
import { bindStageEvents, flushPendingHover, isTouchDevice, layout, markDragged, setHover, subscribeHover } from './stageLayout';
import { home, view } from './stageView';

export interface RecordDef {
  slug: string;
  cover: string;
  href: string;
  /** ホバーカードに出す文字（ビルド時に言語を解決して渡す） */
  title: string;
  /** ジャケットの下に常に出す短い名前（ホバーしなくても何のレコードか分かるように） */
  label: string;
  meta: string;
  blurb: string;
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

/** ホームで、盤がジャケットからどれだけ出ているか・持ち上がっているか（滑らかに変化させる値） */
interface Motion {
  peek: number;
  lift: number;
}

const _local = new Vector3();
const _groupQuat = new Quaternion();
const _yawQuat = new Quaternion();
const _yawAxis = new Vector3(0, 1, 0);

/**
 * レコード slug の目標状態（ワールド座標）を求める。毎フレーム呼ぶ。
 * ホームでは台の上のジャケットから（motion = 出ている量・持ち上げ量）、
 * アルバムページでは DOM のスロットの矩形から決める。
 */
function computeTarget(slug: string, out: Target, canvas: { width: number; height: number }, motion: Motion): boolean {
  out.hidden = true;
  out.scale = 0;
  out.spin = 0;

  if (layout.mode === 'page' && layout.slot) {
    if (layout.slot.slug !== slug) return true;
    const r = layout.slot.el.getBoundingClientRect();
    const wpp = view.worldPerPx;
    // アルバムページではスクロールに追従させない：ページの先頭にいるときの位置に置いたままにし、
    // スクロールして DOM のスロットが見えなくなったら小さくして消す
    const top = r.top + window.scrollY;
    out.pos.set((r.left + r.width / 2 - canvas.width / 2) * wpp, (canvas.height / 2 - (top + r.height / 2)) * wpp, 0);
    out.quat.copy(PAGE_QUAT);
    out.scale = window.scrollY > r.height * 0.5 ? 0 : (r.width * wpp) / 2 / RECORD_MODEL_RADIUS;
    out.spin = STAGE.spinSlot;
    out.hidden = false;
    return true;
  }

  if (layout.mode === 'home') {
    const layoutCfg = HOME.layouts[view.layoutKey];
    const cfg = layoutCfg.sleeves[slug];
    const g = home.group;
    if (!cfg || !g) return false;
    // ジャケットは yaw だけ回転して置いてあるので、盤が出てくる向きも同じだけ回す
    const cos = Math.cos(cfg.yaw);
    const sin = Math.sin(cfg.yaw);
    const dx = cfg.dir[0] * cos + cfg.dir[1] * sin;
    const dz = -cfg.dir[0] * sin + cfg.dir[1] * cos;
    _local
      .set(cfg.x + dx * motion.peek, HOME.sleeve.thickness / 2 + motion.lift, cfg.z + dz * motion.peek)
      .add(_offset.set(...layoutCfg.offset));
    g.updateWorldMatrix(true, false);
    out.pos.copy(_local).applyMatrix4(g.matrixWorld);
    g.getWorldQuaternion(_groupQuat);
    _yawQuat.setFromAxisAngle(_yawAxis, cfg.yaw);
    out.quat.copy(_groupQuat).multiply(_yawQuat).multiply(FLAT);
    out.scale = g.scale.x * RECORD_SCALE;
    out.spin = layout.pulled === slug ? STAGE.spinPulled : layout.hover === slug ? STAGE.spinHover : 0;
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
  const cur = useRef({
    ready: false,
    /** ホームでジャケットに追従している状態。このときは位置を補間せず、毎フレーム目標へ直接合わせる */
    docked: false,
    /** アルバムページから棚へ戻っている最中（①ジャケットの横の上空へ → ②降りる → ③滑り込む の順に見せる） */
    returning: false,
    pos: new Vector3(),
    quat: new Quaternion(),
    scale: 0,
    peek: 0,
    lift: 0,
  });
  const target = useRef(newTarget());
  const spin = useRef(0);

  useFrame((_, rawDelta) => {
    const g = root.current;
    const spinG = spinRef.current;
    if (!g || !spinG) return;
    const dt = Math.min(rawDelta, 0.05);
    const s = cur.current;
    const t = target.current;
    // 「視差効果を減らす」の設定に関係なく、アニメーションは常に動かす
    const lambda = STAGE.damp * (layout.fast ? STAGE.fastFactor : 1);

    const pulled = layout.pulled === slug;

    // 棚へ戻ってくる：アルバムページのスロットから戻るときは、まず「ジャケットの真横・上空」（引き抜いたときの
    // 終わりの姿勢）へ飛んでくる。ジャケットの真上や中を通らないので、突き抜けて見えない
    const touchDevice = isTouchDevice();
    if (!touchDevice && layout.mode === 'home' && !s.docked && !s.returning && !pulled && s.scale > 1e-3) {
      s.returning = true;
      s.peek = HOME.peek.pulled;
      s.lift = HOME.lift;
    }
    if (pulled) s.returning = false;

    // 出ている量と持ち上げ量だけを滑らかに動かす（位置そのものは補間しない：スクロールで遅れて見えるため）
    let wantPeek: number;
    if (s.returning) wantPeek = HOME.peek.pulled; // 降りるあいだも、ジャケットの横に出したまま
    else wantPeek = pulled ? HOME.peek.pulled : layout.hover === slug ? HOME.peek.hover : HOME.peek.rest;
    s.peek = MathUtils.damp(s.peek, wantPeek, lambda, dt);

    // 引き抜き：①ジャケットから真横に完全に抜ける → ②持ち上がる → ③（ページ遷移後）行き先へ飛ぶ。
    // 戻り　　：①ジャケットの横の上空へ飛ぶ → ②まっすぐ降りる → ③ジャケットへ滑り込む。
    // 抜けきる前や、ジャケットの上で動かすと、ジャケットを突き抜けて見える
    let wantLift: number;
    if (s.returning) wantLift = s.docked ? 0 : HOME.lift;
    else wantLift = pulled && s.peek >= HOME.peek.pulled * HOME.liftAfterPeek ? HOME.lift : 0;
    s.lift = MathUtils.damp(s.lift, wantLift, lambda, dt);
    // 降りきったら、通常の状態（rest の長さまで滑り込む）へ
    if (s.returning && s.docked && s.lift < 0.006) s.returning = false;

    if (!computeTarget(slug, t, canvas, s)) return; // DOM が入れ替わっている最中は前の状態を保つ

    // タッチ端末：ページ間の飛行はしない。ホームではジャケットへ、アルバムページではスロットへ、その場で置く
    if (touchDevice && !t.hidden) {
      s.pos.copy(t.pos);
      s.quat.copy(t.quat);
      if (layout.mode === 'home') s.docked = true;
    }
    if (layout.mode !== 'home') {
      s.docked = false;
      s.returning = false;
      // アルバム → アルバムの移動：隠れていた盤は、スロットの位置でその場から大きくなって現れる
      // （前のページの盤は縮んで消える）。棚から飛んでくる場合は、すでに大きさがあるので対象外
      if (layout.mode === 'page' && !t.hidden && s.scale < 1e-3) {
        s.pos.copy(t.pos);
        s.quat.copy(t.quat);
      }
    } else if (!t.hidden && s.scale < 1e-3) {
      // 初回、または隠れていたレコードが棚に戻るとき：ジャケットの中に収まった状態から出てくる
      s.peek = 0;
      s.lift = 0;
      computeTarget(slug, t, canvas, s);
      s.pos.copy(t.pos);
      s.quat.copy(t.quat);
      s.docked = true;
    }
    if (!s.ready) {
      s.pos.copy(t.pos);
      s.quat.copy(t.quat);
      s.ready = true;
    }

    if (!t.hidden) {
      if (s.docked) {
        // ジャケットに追従中：スクロールしても遅れないよう、目標へそのまま合わせる
        s.pos.copy(t.pos);
        s.quat.copy(t.quat);
        s.scale = t.scale;
      } else {
        s.pos.set(
          MathUtils.damp(s.pos.x, t.pos.x, lambda, dt),
          MathUtils.damp(s.pos.y, t.pos.y, lambda, dt),
          MathUtils.damp(s.pos.z, t.pos.z, lambda, dt),
        );
        s.quat.slerp(t.quat, 1 - Math.exp(-lambda * dt));
        s.scale = MathUtils.damp(s.scale, t.scale, lambda, dt);
        // アルバムページから棚へ戻ってきて、ジャケットに追いついたら追従に切り替える
        if (layout.mode === 'home' && s.pos.distanceTo(t.pos) < 0.004 && Math.abs(s.scale - t.scale) < 0.002) {
          s.docked = true;
        }
      }
    } else {
      s.scale = MathUtils.damp(s.scale, 0, lambda * 1.8, dt);
    }
    // 回転は「視差効果を減らす」の設定に関係なく、常に回す
    spin.current = MathUtils.damp(spin.current, t.spin, 5, dt);

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
  const gl = useThree((s) => s.gl);
  // 縦長・横長で配置を切り替える（切り替わるときだけ再描画される）
  const key = useThree((s) => layoutKeyFor(s.size.width / s.size.height));
  const L = HOME.layouts[key];

  /**
   * ドラッグで台を回す。yaw = 台の上方向まわり、pitch = 手前に起こす角度（カメラの仰角にあたる）。
   * 目標値（〜T）を動かし、実際の値はそこへ滑らかに追従する。
   */
  const orbit = useRef({
    yaw: 0,
    pitch: L.tilt as number,
    yawT: 0,
    pitchT: L.tilt as number,
    drag: null as { id: number; x: number; y: number; sx: number; sy: number; axis: 'x' | 'y' | null } | null,
    wasHome: true,
  });

  // 配置（PC / スマホ）が切り替わったら、その配置の初期の角度に戻す
  useEffect(() => {
    orbit.current.pitchT = L.tilt;
  }, [L.tilt]);

  useEffect(() => {
    const el = gl.domElement;
    const o = orbit.current;
    const down = (e: PointerEvent) => {
      if (layout.mode !== 'home' || e.button !== 0) return;
      o.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, axis: e.pointerType === 'mouse' ? 'x' : null };
      el.setPointerCapture(e.pointerId);
      document.documentElement.dataset.dragging = '';
      setHover(null);
    };
    const move = (e: PointerEvent) => {
      const d = o.drag;
      if (!d || d.id !== e.pointerId) return;
      // タッチ：最初の動きで向きを決める。縦ならページのスクロール（回転しない）、横ならレコードを回す
      if (!d.axis) {
        const tx = Math.abs(e.clientX - d.sx);
        const ty = Math.abs(e.clientY - d.sy);
        if (tx + ty < 8) return;
        if (ty > tx) {
          o.drag = null;
          delete document.documentElement.dataset.dragging;
          if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
          flushPendingHover();
          return;
        }
        d.axis = 'x';
        d.x = d.sx;
      }
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 0) markDragged();
      o.yawT += dx * ORBIT.yawPerPx;
      // タッチの縦ドラッグはページのスクロールに使うので、縦方向の回転はマウスのときだけ
      if (e.pointerType === 'mouse') {
        o.pitchT = MathUtils.clamp(o.pitchT + dy * ORBIT.pitchPerPx, ORBIT.pitchMin, ORBIT.pitchMax);
      }
    };
    const up = (e: PointerEvent) => {
      if (o.drag?.id !== e.pointerId) return;
      o.drag = null;
      delete document.documentElement.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      flushPendingHover();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [gl]);

  useFrame((_, rawDelta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 0.05);
    const o = orbit.current;
    const isHome = layout.mode === 'home';

    // ホームを離れたら初期の角度へ戻す（戻ってきたときに毎回同じ見た目で始まるように）。
    // 何周も回していた場合に逆回転しないよう、-π〜π に畳んでから戻す
    if (!isHome && o.wasHome) {
      o.yaw = Math.atan2(Math.sin(o.yaw), Math.cos(o.yaw));
      o.yawT = 0;
      o.pitchT = L.tilt;
      o.drag = null;
      delete document.documentElement.dataset.dragging;
    }
    o.wasHome = isHome;

    o.yaw = MathUtils.damp(o.yaw, o.yawT, ORBIT.damp, dt);
    o.pitch = MathUtils.damp(o.pitch, o.pitchT, ORBIT.damp, dt);
    // 回転の順序は XYZ：先に台の上方向まわりの yaw、そのあと手前に起こす pitch
    g.rotation.set(o.pitch, o.yaw, 0);

    // ローディングが終わるまでは出さない（終わってから、ふわっと現れる）
    const want = isHome && layout.ready ? 1 : 0;
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
    >
      <group position={L.offset}>
        <RecordPlayer position={L.playerPosition} />
        {records.map((r) => {
          const cfg = L.sleeves[r.slug];
          return cfg ? (
            <Sleeve key={r.slug} slug={r.slug} label={r.label} cover={r.cover} x={cfg.x} z={cfg.z} yaw={cfg.yaw} handlers={slugHandlers(r.slug, r.href)} />
          ) : null;
        })}
      </group>
    </group>
  );
}

/**
 * ホームでレコード（ジャケット）にホバーしたとき、カーソルのそばに「何についてのレコードか」を出すカード。
 * 位置は React の再描画ではなく、ポインターが動くたびに transform を直接書き換える
 */
function HoverCard({ records }: { records: RecordDef[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  // 消えるときにも中身が残るよう、最後に出していたレコードを覚えておく
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState<RecordDef | null>(null);

  useEffect(
    () =>
      subscribeHover((slug) => {
        setActive(slug);
        const found = slug ? records.find((r) => r.slug === slug) : undefined;
        if (found) setShown(found);
      }),
    [records],
  );

  /** カーソルの右下に置く。画面の端にかかるときは反対側へ */
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const gap = 18;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let x = pointer.current.x + gap;
    let y = pointer.current.y + gap;
    if (x + w > window.innerWidth - 8) x = pointer.current.x - w - gap;
    if (y + h > window.innerHeight - 8) y = pointer.current.y - h - gap;
    el.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
  };

  useEffect(() => {
    // キーボードでフォーカスしたとき（ポインターが無い）は、画面の下寄りの中央に出す
    pointer.current = { x: window.innerWidth / 2 - 130, y: window.innerHeight * 0.72 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current = { x: e.clientX, y: e.clientY };
      place();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useLayoutEffect(place, [shown, active]);

  return (
    <div ref={ref} className="hover-card crystal" data-show={active ? '' : undefined} aria-hidden="true">
      <p className="menu-text hover-card__title">{shown?.title}</p>
      <p className="hover-card__meta">{shown?.meta}</p>
      <p className="hover-card__blurb">{shown?.blurb}</p>
    </div>
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
function Stage3D({ records }: { records: RecordDef[] }) {
  useEffect(() => bindStageEvents(), []);

  return (
    <>
      <LoadingBridge />
      <HoverCard records={records} />
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
            // WebGL の描画面が失われても復元できるようにする。ブラウザの「戻る」でキャッシュから
            // ページが復元されたとき、描画面だけ空になっていたら、ページごと読み込み直す
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
            window.addEventListener('pageshow', (e) => {
              if (e.persisted && gl.getContext().isContextLost()) window.location.reload();
            });
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

type WindowWith3D = Window & { __no3d?: boolean };

/** 2D 表示に切り替える（html の data-3d="off"）。ホームはジャケット一覧、アルバムページは丸いカバー画像になる */
function enable2d() {
  (window as WindowWith3D).__no3d = true;
  document.documentElement.setAttribute('data-3d', 'off');
  document.getElementById('loading-screen')?.setAttribute('data-done', '');
  layout.ready = true;
}

/** 3D の描画で例外（WebGL の失敗、モデルの読み込み失敗など）が起きたら、真っ白にせず 2D 表示へ切り替える */
class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    enable2d();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** 3D を使わない環境（WebGL なし、?view=2d）。何も描かず、2D 表示への切り替えだけ行う */
function NoStage() {
  useEffect(() => enable2d(), []);
  return null;
}

/**
 * 3D ステージの入口。3D が使えるなら Stage3D、使えない（または失敗した）なら 2D 表示にする。
 * 使えるかどうかは、AppLayout の先頭のスクリプトが html の data-3d / window.__no3d に記録している。
 */
export default function RecordStage({ records }: { records: RecordDef[] }) {
  const [no3d] = useState(() => (window as WindowWith3D).__no3d === true);
  if (no3d) return <NoStage />;
  return (
    <StageBoundary>
      <Stage3D records={records} />
    </StageBoundary>
  );
}
