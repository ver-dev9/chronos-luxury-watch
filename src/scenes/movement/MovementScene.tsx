/**
 * 04 — INSIDE THE MOVEMENT
 * A macro camera journey: through the case aperture, across the barrel,
 * skimming the gear train, down to the escapement and the beating balance.
 * Viewed from the bridge side (as through a display case back).
 */
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Movement } from '../../models/Movement';
import { mat } from '../../utils/materials';
import { useCameraRig, useParticleCount, useProgress } from '../shared';
import { dofFocus } from '../../app/dof';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { ringGeometry } from '../../utils/geometry';
import { useExperience } from '../../store/useExperience';

const S = 5;

export default function MovementScene() {
  const p = useProgress('movement', 3);
  const quality = useExperience((s) => s.quality);
  const count = useParticleCount(1800);
  const { posCurve, lookCurve } = useMemo(() => {
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    return {
      posCurve: new THREE.CatmullRomCurve3([P(0, 0.4, 15), P(0, 0.2, 5), P(2.4, 3.0, 2.5), P(-0.4, 1.9, 2.0), P(-0.5, -2.1, 2.1), P(1.9, -3.3, 2.2), P(3.2, -4.4, 3.4)], false, 'centripetal'),
      lookCurve: new THREE.CatmullRomCurve3([P(0, 0, 0), P(0, 0, 0), P(1.25, 1.5, 0.2), P(-1.41, 0.5, 0.15), P(-1.32, -1.38, 0.2), P(0.7, -2.5, 0.2), P(0.7, -2.5, 0)], false, 'centripetal'),
    };
  }, []);

  useCameraRig((prog, _t, out) => {
    const k = Math.min(0.999, Math.max(0, prog));
    out.pos.copy(posCurve.getPoint(k));
    out.look.copy(lookCurve.getPoint(k));
    out.fov = 34 + Math.sin(k * Math.PI) * 6;
  }, p, 2.6);

  useFrame(() => {
    dofFocus.copy(lookCurve.getPoint(Math.min(0.999, Math.max(0, p.current))));
  });

  return (
    <>
      <ambientLight intensity={0.08} color="#c7a76b" />
      <spotLight position={[4, 6, 9]} angle={0.5} penumbra={1} intensity={190} color="#fff1d6" decay={2} castShadow={quality !== 'low'} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, -2, 3]} intensity={40} color="#e4c88d" decay={2} />
      <pointLight position={[2, 3, 2]} intensity={25} color="#ffffff" decay={2} />
      {/* case aperture the camera travels through */}
      <mesh position={[0, 0, 1.4]} geometry={ringGeometry(5.6, 4.6, 0.6, { bevel: 0.2 })} material={mat('gold')} />
      <mesh position={[0, 0, -0.9]} rotation={[0, 0, 0]}>
        <circleGeometry args={[4.6, 96]} />
        <meshStandardMaterial color="#0a0908" roughness={0.9} />
      </mesh>
      <group rotation={[0, Math.PI, 0]} scale={S}>
        <Movement detail={quality === 'low' ? 'low' : 'high'} motionWorks={false} />
      </group>
      <GoldDust count={count} radius={6} height={8} size={10} />
    </>
  );
}
