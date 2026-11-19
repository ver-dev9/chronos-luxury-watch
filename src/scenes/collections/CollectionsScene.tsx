/**
 * 02 — THE COLLECTION
 * Four distinct procedural watches on a horizontal 3D rail. Scroll pans the
 * camera along the rail in lock-step with the DOM gallery; the active piece
 * follows the pointer (hover rotate) and the drag surface (drag rotate).
 * "Explore Collection" pushes the camera into a close showcase framing.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLLECTIONS } from '../../data/watches';
import { WatchModel } from '../../models/WatchModel';
import { useExperience } from '../../store/useExperience';
import { scrollState } from '../../store/scrollState';
import { useCameraRig, useProgress, StudioLights } from '../shared';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { damp } from '../../utils/math';

export const RAIL_GAP = 7;

function Piece({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useRef(new THREE.Object3D());
  useFrame((state, dt) => {
    const s = useExperience.getState();
    const active = s.activeCollection === index;
    if (!g.current) return;
    const idle = state.clock.elapsedTime * 0.25 + index;
    const ty = active ? scrollState.drag.y + scrollState.pointer.x * 0.6 - 0.45 : Math.sin(idle) * 0.3 - 0.4;
    const tx = active ? scrollState.drag.x - scrollState.pointer.y * 0.25 - 0.1 : -0.15;
    g.current.rotation.y = damp(g.current.rotation.y, ty, 4, dt);
    g.current.rotation.x = damp(g.current.rotation.x, tx, 4, dt);
    const sc = active ? 1.08 : 0.86;
    g.current.scale.setScalar(damp(g.current.scale.x, sc, 4, dt));
    if (spot.current) {
      spot.current.target = target.current;
      spot.current.intensity = damp(spot.current.intensity, active ? 650 : 110, 4, dt);
    }
  });
  const c = COLLECTIONS[index];
  return (
    <group position={[index * RAIL_GAP, 0, 0]}>
      <primitive object={target.current} />
      <spotLight ref={spot} position={[1.5, 5, 3.5]} angle={0.38} penumbra={0.9} color="#fff1d6" decay={2} intensity={40} />
      <group ref={g}>
        <WatchModel spec={c.spec} />
      </group>
    </group>
  );
}

export default function CollectionsScene() {
  const p = useProgress('collections', 5);
  const setActive = useExperience((s) => s.setActiveCollection);
  useCameraRig((prog, t, out) => {
    const showcase = useExperience.getState().showcaseOpen;
    const x = prog * (COLLECTIONS.length - 1) * RAIL_GAP;
    if (showcase) {
      const i = useExperience.getState().activeCollection;
      const cx = i * RAIL_GAP;
      out.pos.set(cx - 1.2 + Math.sin(t * 0.2) * 0.4, 0.4, 4.6);
      out.look.set(cx - 1.25, 0, 0);
      out.fov = 30;
    } else {
      out.pos.set(x, 0.35, 8.2);
      out.look.set(x, 0, 0);
      out.fov = 32;
    }
  }, p, 3);

  useFrame(() => {
    const i = Math.round(scrollState.progress.collections * (COLLECTIONS.length - 1));
    setActive(Math.max(0, Math.min(COLLECTIONS.length - 1, i)));
  });

  return (
    <>
      <StudioLights keyLight={0.9} rim={1.2} shadowY={-1.9} />
      <group position={[((COLLECTIONS.length - 1) * RAIL_GAP) / 2, 0, -2]}>
        <GoldDust count={1500} radius={14} height={6} size={18} />
      </group>
      {COLLECTIONS.map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </>
  );
}
