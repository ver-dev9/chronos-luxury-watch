import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mat } from '../utils/materials';
import { spiralGeometry } from '../utils/geometry';
import { balanceAngle } from './mechanism';

interface Props {
  radius?: number;
  position?: [number, number, number];
  /** include the hairspring (omit when the spring is exploded separately) */
  spring?: boolean;
}

/** Glucydur-style balance: rim, three arms, timing screws, impulse roller. */
export function BalanceWheel({ radius = 0.2, position = [0, 0, 0], spring = true }: Props) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = balanceAngle(s.clock.elapsedTime);
  });
  const screws = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return (
    <group position={position}>
      <group ref={ref}>
        <mesh material={mat('gold')} castShadow>
          <torusGeometry args={[radius, radius * 0.07, 12, 96]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0]} material={mat('gold')}>
            <boxGeometry args={[radius * 0.06, radius * 2, radius * 0.06]} />
          </mesh>
        ))}
        {screws.map((a, i) => (
          <mesh
            key={i}
            position={[Math.cos(a) * radius * 1.09, Math.sin(a) * radius * 1.09, 0]}
            rotation={[0, 0, a + Math.PI / 2]}
            material={mat('gold')}
          >
            <cylinderGeometry args={[radius * 0.045, radius * 0.045, radius * 0.08, 10]} />
          </mesh>
        ))}
        <mesh material={mat('ruby')} position={[radius * 0.18, 0, radius * 0.06]}>
          <cylinderGeometry args={[radius * 0.03, radius * 0.03, radius * 0.08, 8]} />
        </mesh>
        <mesh material={mat('rhodium')} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.06, radius * 0.06, radius * 0.5, 16]} />
        </mesh>
      </group>
      {spring && <Hairspring radius={radius} />}
    </group>
  );
}

/** Breathing hairspring: scales slightly with the balance swing. */
export function Hairspring({ radius = 0.2, position = [0, 0, 0] as [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const a = balanceAngle(s.clock.elapsedTime);
    ref.current.rotation.z = a * 0.35;
    const k = 1 + (a / 2.4) * 0.045;
    ref.current.scale.set(k, k, 1);
  });
  return (
    <mesh
      ref={ref}
      position={[position[0], position[1], position[2] + radius * 0.12]}
      geometry={spiralGeometry(radius * 0.08, radius * 0.72, 11, 0.0028)}
      material={mat('blued')}
    />
  );
}
