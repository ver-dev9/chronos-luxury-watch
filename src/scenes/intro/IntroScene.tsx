/**
 * 01 — THE AWAKENING
 * Darkness → a golden point of light → dust → silhouette → reflections.
 * After the opening timeline, scroll orbits the camera and dives toward the
 * dial to hand over to the collection.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WatchModel } from '../../models/WatchModel';
import { HERO_SPEC } from '../../data/watches';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { LightSweep } from '../../shaders/transitions/LightSweep';
import { DragRotate, useCameraRig, useParticleCount, useProgress } from '../shared';
import { introState } from '../../animations/intro/introState';
import { easeInOut } from '../../utils/math';

export default function IntroScene() {
  const p = useProgress('intro');
  const { scene } = useThree();
  const orb = useRef<THREE.Mesh>(null);
  const point = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const rim2 = useRef<THREE.SpotLight>(null);
  const watch = useRef<THREE.Group>(null);
  const dust = useRef({ current: 0 }).current;
  const count = useParticleCount(5000);

  useEffect(() => () => void ((scene as any).environmentIntensity = 1), [scene]);

  useCameraRig((prog, _t, out) => {
    const ap = easeInOut(introState.approach);
    const dist = THREE.MathUtils.lerp(16, 7, ap) - prog * 3.2;
    const ang = prog * 1.15;
    out.pos.set(Math.sin(ang) * dist, 0.3 + prog * 0.9, Math.cos(ang) * dist);
    out.look.set(0, prog * 0.15, 0);
    out.fov = 32 - prog * 6;
  }, p, 2.6);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    dust.current = introState.dust;
    if (orb.current) {
      const s = introState.light * (1 - introState.reveal * 0.95);
      orb.current.scale.setScalar(Math.max(0.0001, s * 0.06 * (1 + Math.sin(t * 3) * 0.08)));
      orb.current.position.z = 0.6;
    }
    if (point.current) point.current.intensity = introState.light * 6 * (1 - introState.reveal * 0.6);
    if (rim.current) rim.current.intensity = introState.silhouette * 160;
    if (rim2.current) rim2.current.intensity = introState.silhouette * 110;
    if (key.current) key.current.intensity = introState.reveal * 150;
    (scene as any).environmentIntensity = 0.05 + introState.reveal * 0.95;
    if (watch.current) {
      const w = Math.max(introState.silhouette, 0.0001);
      watch.current.scale.setScalar(0.94 + w * 0.06);
      watch.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <>
      <mesh ref={orb}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={[4, 3, 1.6]} toneMapped={false} />
      </mesh>
      <pointLight ref={point} position={[0, 0, 1.2]} color="#f2c879" distance={8} decay={2} />
      <spotLight ref={rim} position={[-4, 3, -5]} angle={0.5} penumbra={1} color="#e4c88d" decay={2} />
      <spotLight ref={rim2} position={[4.5, -1, -4]} angle={0.5} penumbra={1} color="#fff0d0" decay={2} />
      <spotLight ref={key} position={[3, 5, 6]} angle={0.4} penumbra={0.9} color="#fff1d6" decay={2} castShadow />
      <ambientLight intensity={0.04} />
      <LightSweep period={7} intensity={50} />
      <GoldDust count={count} radius={7} height={7} reveal={dust} />
      <DragRotate hover={0.3} autoSpin={0.12}>
        <group ref={watch} rotation={[-0.25, -0.5, 0]}>
          <WatchModel spec={HERO_SPEC} />
        </group>
      </DragRotate>
    </>
  );
}
