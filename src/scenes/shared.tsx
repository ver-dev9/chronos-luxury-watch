/** Building blocks shared by chapter scenes. */
import { useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../store/scrollState';
import type { ChapterId } from '../data/chapters';
import { useExperience } from '../store/useExperience';
import { damp, dampV3 } from '../utils/math';

/** Damped copy of a chapter's scroll progress (mutable ref, no renders). */
export function useProgress(id: ChapterId, lambda = 9) {
  const p = useRef(scrollState.progress[id]);
  useFrame((_, dt) => {
    p.current = damp(p.current, scrollState.progress[id], lambda, Math.min(dt, 0.1));
  });
  return p;
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

/**
 * Scroll-driven camera: the callback returns a target position + look-at for
 * the current progress; the rig eases the real camera toward it.
 */
export function useCameraRig(
  solve: (p: number, t: number, out: { pos: THREE.Vector3; look: THREE.Vector3; fov?: number }) => void,
  progress: { current: number },
  lambda = 6,
) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const first = useRef(true);
  const out = useRef({ pos: _pos, look: _look, fov: undefined as number | undefined });
  useFrame((state, dt) => {
    out.current.fov = undefined;
    solve(progress.current, state.clock.elapsedTime, out.current);
    // gentle pointer parallax
    _pos.x += scrollState.pointer.x * 0.12;
    _pos.y += scrollState.pointer.y * 0.08;
    if (first.current) {
      camera.position.copy(_pos);
      look.current.copy(_look);
      first.current = false;
    } else {
      dampV3(camera.position, _pos, lambda, Math.min(dt, 0.1));
      dampV3(look.current, _look, lambda, Math.min(dt, 0.1));
    }
    camera.lookAt(look.current);
    const pc = camera as THREE.PerspectiveCamera;
    const fov = out.current.fov ?? 32;
    if (Math.abs(pc.fov - fov) > 0.01) {
      pc.fov = damp(pc.fov, fov, 3, dt);
      pc.updateProjectionMatrix();
    }
  });
}

/** Applies drag rotation (and an optional hover tilt) to its children. */
export function DragRotate({
  children,
  hover = 0.25,
  autoSpin = 0,
  enabled = true,
}: {
  children: ReactNode;
  hover?: number;
  autoSpin?: number;
  enabled?: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const reduced = useExperience((s) => s.reducedMotion);
  useFrame((_, dt) => {
    if (!g.current) return;
    if (!reduced) spin.current += autoSpin * dt;
    const ty = (enabled ? scrollState.drag.y : 0) + spin.current + scrollState.pointer.x * hover;
    const tx = (enabled ? scrollState.drag.x : 0) - scrollState.pointer.y * hover * 0.6;
    g.current.rotation.y = damp(g.current.rotation.y, ty, 5, dt);
    g.current.rotation.x = damp(g.current.rotation.x, tx, 5, dt);
  });
  return <group ref={g}>{children}</group>;
}

/** Cinematic three-point lighting with quality-scaled shadows. */
export function StudioLights({
  keyLight = 1,
  rim = 1,
  fill = 0.25,
  shadowY = -1.6,
}: {
  keyLight?: number;
  rim?: number;
  fill?: number;
  shadowY?: number;
}) {
  const quality = useExperience((s) => s.quality);
  return (
    <>
      <ambientLight intensity={0.06 + fill * 0.2} color="#c7a76b" />
      <spotLight
        position={[3.5, 6, 5]}
        angle={0.42}
        penumbra={0.9}
        intensity={140 * keyLight}
        color="#fff1d6"
        decay={2}
      />
      <spotLight
        position={[-5, 2.5, -4]}
        angle={0.5}
        penumbra={1}
        intensity={90 * rim}
        color="#e4c88d"
        decay={2}
      />
      <directionalLight position={[-3, -2, 4]} intensity={fill} color="#a8b4ff" />
      {quality !== 'low' && shadowY !== 0 && (
        <mesh rotation-x={-Math.PI / 2} position={[0, shadowY, 0]}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.45} />
        </mesh>
      )}
    </>
  );
}

export function useParticleCount(base: number) {
  const q = useExperience((s) => s.quality);
  const reduced = useExperience((s) => s.reducedMotion);
  const mult = q === 'high' ? 0.6 : q === 'medium' ? 0.3 : 0.12;
  return Math.max(200, Math.floor(base * mult * (reduced ? 0.4 : 1)));
}
