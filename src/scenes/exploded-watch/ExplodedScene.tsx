/**
 * 03 — THE EXPLODED WATCH
 * Scroll drives separation: crystal → bezel → hands → dial → movement →
 * case back, with labelled, clickable components. Users can override the
 * scroll with the Disassemble / Reassemble controls or the slider.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WatchModel } from '../../models/WatchModel';
import { EXPLODED_SPEC } from '../../data/watches';
import { useExperience } from '../../store/useExperience';
import { DragRotate, StudioLights, useCameraRig, useProgress } from '../shared';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { damp, range } from '../../utils/math';

export default function ExplodedScene() {
  const p = useProgress('exploded', 4);
  const explode = useRef(0);
  const group = useRef<THREE.Group>(null);

  useCameraRig(
    (prog, t, out) => {
      // 0–0.15 camera approaches; then swings to an oblique 3/4 view of the stack
      const a = range(prog, 0, 0.18);
      const swing = range(prog, 0.12, 0.6);
      const ang = THREE.MathUtils.lerp(0, 1.05, swing) + Math.sin(t * 0.15) * 0.04;
      const dist = THREE.MathUtils.lerp(9, 6.2, a) + swing * 4.2;
      out.pos.set(Math.sin(ang) * dist, 0.6 + swing * 1.4, Math.cos(ang) * dist);
      out.look.set(0, 0, swing * 0.1);
      out.fov = 30 + swing * 4;
    },
    p,
    3,
  );

  useFrame((_, dt) => {
    const s = useExperience.getState();
    const scrollTarget = range(p.current, 0.12, 0.85);
    const target = s.explodeOverride ?? scrollTarget;
    explode.current = damp(explode.current, target, 3.2, Math.min(dt, 0.1));
    if (group.current) group.current.rotation.z = explode.current * 0.0;
  });

  return (
    <>
      <StudioLights keyLight={1} rim={1.4} shadowY={0} />
      <pointLight position={[0, 0, 0]} intensity={6} color="#f0c27a" distance={5} />
      <GoldDust count={1200} radius={8} height={8} size={16} />
      <DragRotate hover={0.12}>
        <group ref={group}>
          <WatchModel spec={EXPLODED_SPEC} explode={explode} interactive labels showMovement />
        </group>
      </DragRotate>
    </>
  );
}
