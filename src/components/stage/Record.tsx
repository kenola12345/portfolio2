import { useEffect, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { RECORD_FACING_ROTATION, RECORD_MODEL_URL } from './config';
import { createLabelTexture } from './labelTexture';

interface RecordProps {
  /** 中央ラベルに貼る画像 */
  cover: string;
}

/**
 * GLB のレコード 1 枚。中央ラベルだけアルバム画像に差し替える。
 * ジオメトリと法線・粗さマップは全レコードで共有し、ベースカラーだけ個別に持つ。
 */
export default function Record({ cover }: RecordProps) {
  const { scene } = useGLTF(RECORD_MODEL_URL);
  const coverTexture = useTexture(cover);

  const { object, material } = useMemo(() => {
    const clone: Object3D = scene.clone(true);
    let mat: MeshStandardMaterial | null = null;
    clone.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        // マテリアルはレコードごとに複製する（共有のままだと全部同じラベルになる）
        mat = child.material.clone();
        child.material = mat;
      }
    });
    if (!mat) throw new Error('Record GLB has no MeshStandardMaterial');
    return { object: clone, material: mat as MeshStandardMaterial };
  }, [scene]);

  useEffect(() => {
    const base = material.map;
    if (!base) return;
    const labelled = createLabelTexture(base, coverTexture);
    material.map = labelled;
    material.needsUpdate = true;
    return () => {
      material.map = base;
      labelled.dispose();
    };
  }, [material, coverTexture]);

  // 外側の group の Z 軸 = 盤面の法線になるので、親は rotation.z で自転させられる
  return (
    <group rotation={RECORD_FACING_ROTATION}>
      <primitive object={object} />
    </group>
  );
}

useGLTF.preload(RECORD_MODEL_URL);
