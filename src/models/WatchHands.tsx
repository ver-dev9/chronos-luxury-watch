import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import type { HandStyle, WatchSpec } from '../data/watches';
import { handGeometry } from '../utils/geometry';
import { mat } from '../utils/materials';

/** Hour, minute and seconds hands showing the visitor's real local time. */
export function WatchHands({ spec, frozen = false }: { spec: WatchSpec; frozen?: boolean }) {
  const h = useRef<THREE.Group>(null);
  const m = useRef<THREE.Group>(null);
  const s = useRef<THREE.Group>(null);
  const sub = useRef<THREE.Group>(null);
  const style: HandStyle = spec.hands;
  const matKey =
    spec.caseMaterial === 'roseGold'
      ? 'roseGold'
      : ['gold'].includes(spec.caseMaterial)
        ? 'gold'
        : spec.dialColor === 'ivory' || spec.dialColor === 'champagne'
          ? 'blued'
          : 'rhodium';

  useFrame(() => {
    const d = frozen ? new Date(2026, 0, 1, 10, 9, 36) : new Date();
    const sec = d.getSeconds() + d.getMilliseconds() / 1000;
    const min = d.getMinutes() + sec / 60;
    const hr = (d.getHours() % 12) + min / 60;
    if (h.current) h.current.rotation.z = -(hr / 12) * Math.PI * 2;
    if (m.current) m.current.rotation.z = -(min / 60) * Math.PI * 2;
    if (s.current) s.current.rotation.z = -(sec / 60) * Math.PI * 2;
    if (sub.current) sub.current.rotation.z = -(sec / 60) * Math.PI * 2;
  });

  return (
    <group>
      <group ref={h} position={[0, 0, 0.0]}>
        <mesh geometry={handGeometry(style, 0.46, 0.07)} material={mat(matKey)} castShadow />
      </group>
      <group ref={m} position={[0, 0, 0.018]}>
        <mesh geometry={handGeometry(style, 0.7, 0.055)} material={mat(matKey)} castShadow />
      </group>
      {!spec.subdials && (
        <group ref={s} position={[0, 0, 0.036]}>
          <mesh
            geometry={handGeometry('needle', 0.76, 0.03)}
            material={mat(spec.dialColor === 'ivory' ? 'blued' : 'gold')}
            castShadow
          />
        </group>
      )}
      {spec.subdials && (
        <group ref={sub} position={[-0.38, 0, -0.004]}>
          <mesh geometry={handGeometry('needle', 0.14, 0.022)} material={mat('gold')} />
        </group>
      )}
      <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={mat(matKey)}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 24]} />
      </mesh>
    </group>
  );
}
