import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLAYING_EVENT } from './NowPlaying';
import './Turntable.css';

interface Props {
  label: string;
}

/**
 * ヒーローのターンテーブル（three.js。モデルのファイルは使わず、すべてコードで組み立てている）。
 * - レコードは常にゆっくり回る。再生ボタン（NowPlaying）で止めたり再開したりできる
 * - ポインターに合わせて台がわずかに傾く
 * - スクロールすると、スクロールした分だけレコードが速く回る（"SCROLL TO FLIP THE RECORD"）
 */
export default function Turntable({ label }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL が使えない端末では、3D なしで表示する
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 6.5, 9);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    group.rotation.z = -0.04;
    scene.add(group);

    // 台
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x191916, roughness: 0.4, metalness: 0.55 }),
    );
    base.position.y = -0.45;
    group.add(base);

    // ターンテーブルの皿
    group.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(2.65, 2.65, 0.22, 96),
        new THREE.MeshStandardMaterial({ color: 0x3b3b35, roughness: 0.35, metalness: 0.8 }),
      ),
    );

    // レコード：盤・溝・ラベル・スピンドル
    const record = new THREE.Group();
    record.position.y = 0.2;
    record.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 0.07, 96),
        new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.25, metalness: 0.25 }),
      ),
    );
    for (let i = 0; i < 8; i++) {
      const groove = new THREE.Mesh(
        new THREE.TorusGeometry(0.7 + i * 0.21, 0.008, 8, 96),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x363632 : 0x20201d }),
      );
      groove.rotation.x = Math.PI / 2;
      groove.position.y = 0.045;
      record.add(groove);
    }
    const recordLabel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.085, 64),
      new THREE.MeshStandardMaterial({ color: 0xb8ff35, roughness: 0.7 }),
    );
    recordLabel.position.y = 0.03;
    record.add(recordLabel);
    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8e4d8, metalness: 1, roughness: 0.15 }),
    );
    spindle.position.y = 0.17;
    record.add(spindle);
    group.add(record);

    // トーンアーム
    const arm = new THREE.Group();
    arm.position.set(2.65, 0.25, -1.75);
    arm.rotation.y = -0.55;
    arm.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.42, 0.55, 32),
        new THREE.MeshStandardMaterial({ color: 0x77776e, metalness: 0.8, roughness: 0.25 }),
      ),
    );
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 3.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xd8d3c5, metalness: 0.75, roughness: 0.2 }),
    );
    rod.rotation.z = Math.PI / 2;
    rod.position.set(-1.45, 0.28, 0);
    arm.add(rod);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.25, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xff5c45, roughness: 0.5 }),
    );
    head.position.set(-3.1, 0.25, 0);
    arm.add(head);
    group.add(arm);

    // スタートボタン
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0xff5c45, emissive: 0x531008 }),
    );
    button.position.set(-3.05, -0.05, 2.15);
    group.add(button);

    const grid = new THREE.GridHelper(18, 18, 0xb8ff35, 0x292d20);
    grid.position.y = -0.72;
    scene.add(grid);

    scene.add(new THREE.HemisphereLight(0xf7f3e8, 0x181916, 1.5));
    const key = new THREE.DirectionalLight(0xb8ff35, 2.8);
    key.position.set(-4, 8, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0xff5c45, 40, 14);
    rim.position.set(4, 3, -3);
    scene.add(rim);

    // 入力：ポインター、スクロール量、再生／一時停止
    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let lastScroll = window.scrollY;
    let scrollSpin = 0; // スクロールで足される回転の勢い（だんだん減る）
    const onScroll = () => {
      scrollSpin += (window.scrollY - lastScroll) * 0.004;
      lastScroll = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let playing = true;
    const onPlaying = (event: Event) => {
      playing = (event as CustomEvent<boolean>).detail;
    };
    window.addEventListener(PLAYING_EVENT, onPlaying);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let last = performance.now();
    let time = 0;
    let frame = 0;
    let spin = 0;
    let speed = 0; // 滑らかに加減速させる
    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      speed += ((playing ? 0.7 : 0) - speed) * Math.min(1, dt * 4);
      scrollSpin *= Math.exp(-dt * 3);
      spin += speed * dt + scrollSpin;
      record.rotation.y = spin;
      group.rotation.x += (pointerY * 0.06 - group.rotation.x) * 0.035;
      group.rotation.y += (pointerX * 0.09 - group.rotation.y) * 0.035;
      group.position.y = Math.sin(time * 0.8) * 0.05;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener(PLAYING_EVENT, onPlaying);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="three-stage" ref={mountRef} role="img" aria-label={label} />;
}
