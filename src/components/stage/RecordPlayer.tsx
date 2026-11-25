import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { HOME, RECORD_PLAYER_URL } from './config';

/**
 * レコードプレーヤー（GLB）。天板の手前の縁には、自分の名前がテクスチャに直接印字されている
 * （scripts/optimize-record-player.mjs で焼き込み）
 */
export default function RecordPlayer({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF(RECORD_PLAYER_URL);
  const object = useMemo(() => scene.clone(true), [scene]);

  return (
    <group position={position} scale={HOME.playerScale}>
      <primitive object={object} />
    </group>
  );
}

useGLTF.preload(RECORD_PLAYER_URL);
