import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { AdditiveBlending, CylinderGeometry, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { RECORD, RECORD_MODEL_RADIUS, RECORD_RIM } from './config';
import { createRecordTexture, getGrooveTexture } from './labelTexture';

interface RecordProps {
  /** 中央ラベルに貼る画像 */
  cover: string;
}

/** 盤の形（円柱）と縁のマテリアルは、全レコードで 1 つを共有する */
let sharedGeometry: CylinderGeometry | null = null;
let sharedEdge: MeshStandardMaterial | null = null;
const getGeometry = () =>
  (sharedGeometry ??= new CylinderGeometry(RECORD_MODEL_RADIUS, RECORD_MODEL_RADIUS, RECORD.thickness, RECORD.segments, 1, false));
const getEdge = () => (sharedEdge ??= new MeshStandardMaterial({ color: '#08080a', roughness: 0.5 }));

/**
 * レコード 1 枚（自作。コードで組み立てていて、3D モデルのファイルは使わない）。
 * 黒い円盤に、細い溝（バンプマップ）と、アルバム画像のラベルを貼る。
 * 盤面の法線は +Z（円柱の軸を Z に倒してある）。親は rotation.z で自転させられる
 */
export default function Record({ cover }: RecordProps) {
  const coverTexture = useTexture(cover);

  const { map, material } = useMemo(() => {
    const map = createRecordTexture(coverTexture);
    const material = new MeshPhysicalMaterial({
      map,
      bumpMap: getGrooveTexture(),
      bumpScale: RECORD.bumpScale,
      roughness: 0.38,
      metalness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMapIntensity: RECORD_RIM.envIntensity,
    });
    return { map, material };
  }, [coverTexture]);

  useEffect(
    () => () => {
      map.dispose();
      material.dispose();
    },
    [map, material],
  );

  return (
    <>
      {/* 円柱：側面（縁）、表のフタ、裏のフタ。軸を Z に倒す */}
      <mesh geometry={getGeometry()} material={[getEdge(), material, material]} rotation={[Math.PI / 2, 0, 0]} />
      {/* 黒い盤が暗い背景に溶けないよう、縁にクリスタルのような光の輪を足す */}
      <mesh position={[0, 0, RECORD.thickness]}>
        <ringGeometry args={[RECORD_RIM.inner, RECORD_RIM.outer, 128]} />
        <meshBasicMaterial
          color={RECORD_RIM.color}
          transparent
          opacity={RECORD_RIM.opacity}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
