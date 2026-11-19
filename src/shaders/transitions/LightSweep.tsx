/**
 * METALLIC LIGHT SWEEP — a narrow, warm spot light that glides across the
 * case on a slow cadence, plus an optional scroll-driven position.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LightSweep({
  period = 6,
  intensity = 60,
  y = 2,
  z = 3,
  drive,
}: {
  period?: number;
  intensity?: number;
  y?: number;
  z?: number;
  drive?: { current: number };
}) {
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(new THREE.Object3D());
  useFrame((s) => {
    if (!light.current) return;
    const t = drive ? drive.current : (s.clock.elapsedTime % period) / period;
    const x = THREE.MathUtils.lerp(-4, 4, t);
    light.current.position.set(x, y, z);
    target.current.position.set(x * 0.2, 0, 0);
    light.current.target = target.current;
    light.current.intensity = intensity * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
  });
  return (
    <>
      <spotLight ref={light} angle={0.18} penumbra={0.8} color="#ffe2b0" distance={12} decay={1.2} />
      <primitive object={target.current} />
    </>
  );
}
