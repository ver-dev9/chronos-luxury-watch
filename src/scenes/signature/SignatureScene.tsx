/**
 * 08 — SIGNATURE COLLECTION
 * Five pieces exhibited like sculpture: each on a plinth under its own shaft
 * of light. The camera walks the gallery; the piece in focus can be dragged
 * to inspect, with depth of field isolating it on high quality.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SIGNATURE } from '../../data/watches';
import { WatchModel } from '../../models/WatchModel';
import { useExperience } from '../../store/useExperience';
import { scrollState } from '../../store/scrollState';
import { useCameraRig, useProgress } from '../shared';
import { VolumetricBeam } from '../../shaders/transitions/VolumetricBeam';
import { dofFocus } from '../../app/dof';
import { damp } from '../../utils/math';
import { mat } from '../../utils/materials';

const GAP = 6.5;

function Exhibit({ index }: { index: number }) {
  const g = useRef<THREE.Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useRef(new THREE.Object3D());
  const side = index % 2 === 0 ? 1 : -1;
  useFrame((state, dt) => {
    const active = useExperience.getState().activeSignature === index;
    if (!g.current) return;
    const ty = active
      ? scrollState.drag.y + scrollState.pointer.x * 0.4 - 0.3 * side
      : state.clock.elapsedTime * 0.15 + index;
    g.current.rotation.y = damp(g.current.rotation.y, ty, 3, dt);
    g.current.rotation.x = damp(g.current.rotation.x, active ? scrollState.drag.x * 0.6 - 0.2 : -0.2, 3, dt);
    g.current.position.y = 0.55 + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.06;
    if (spot.current) {
      spot.current.target = target.current;
      spot.current.intensity = damp(spot.current.intensity, active ? 320 : 70, 3, dt);
    }
  });
  return (
    <group position={[index * GAP, 0, side * 0.6]}>
      <primitive object={target.current} />
      <spotLight
        ref={spot}
        position={[0, 7, 1.5]}
        angle={0.3}
        penumbra={0.6}
        color="#fff0d2"
        decay={2}
        castShadow={useExperience.getState().quality === 'high'}
        shadow-mapSize={[512, 512]}
      />
      <VolumetricBeam position={[0, 4.2, 0.2]} length={7} radius={1.4} intensity={0.6} />
      <group ref={g} scale={0.72}>
        <WatchModel spec={SIGNATURE[index].spec} />
      </group>
      <mesh position={[0, -3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <meshStandardMaterial color="#14120f" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, -1.995, 0]} rotation-x={-Math.PI / 2} material={mat('gold')}>
        <ringGeometry args={[1.12, 1.16, 4, 1, Math.PI / 4]} />
      </mesh>
    </group>
  );
}

export default function SignatureScene() {
  const p = useProgress('signature', 3.5);
  const setActive = useExperience((s) => s.setActiveSignature);
  useCameraRig(
    (prog, t, out) => {
      const x = prog * (SIGNATURE.length - 1) * GAP;
      out.pos.set(x + 1.4, 1.1 + Math.sin(t * 0.2) * 0.08, 11.5);
      out.look.set(x + 0.2, -0.4, 0);
      out.fov = 30;
    },
    p,
    2.6,
  );
  useFrame(() => {
    const i = Math.max(
      0,
      Math.min(SIGNATURE.length - 1, Math.round(scrollState.progress.signature * (SIGNATURE.length - 1))),
    );
    setActive(i);
    dofFocus.set(i * GAP, 0, i % 2 === 0 ? 0.6 : -0.6);
  });
  return (
    <>
      <fog attach="fog" args={['#080807', 7, 26]} />
      <ambientLight intensity={0.05} />
      <mesh rotation-x={-Math.PI / 2} position={[12, -4.4, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#0c0b09" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[12, 4, -6]}>
        <planeGeometry args={[80, 20]} />
        <meshStandardMaterial color="#0f0e0b" roughness={0.9} />
      </mesh>
      {SIGNATURE.map((_, i) => (
        <Exhibit key={i} index={i} />
      ))}
    </>
  );
}
