/**
 * 10 — FINALE
 * The camera pulls back; components hang in a vortex of gold dust, then
 * assemble into the complete watch as you scroll, followed by a final orbit.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WatchModel } from '../../models/WatchModel';
import { EXPLODED_SPEC } from '../../data/watches';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { StudioLights, useCameraRig, useParticleCount, useProgress } from '../shared';
import { gearGeometry } from '../../utils/geometry';
import { mat } from '../../utils/materials';
import { LightSweep } from '../../shaders/transitions/LightSweep';
import { damp, range } from '../../utils/math';

function GearHalo() {
  const ref = useRef<THREE.Group>(null);
  const gears = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 4.2 + (i % 3) * 0.7;
        return { pos: [Math.cos(a) * r, Math.sin(a * 2) * 0.8, Math.sin(a) * r] as [number, number, number], s: 0.25 + (i % 4) * 0.12, t: 12 + (i % 5) * 6, dir: i % 2 ? 1 : -1 };
      }),
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((s, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
    refs.current.forEach((m, i) => m && (m.rotation.z = s.clock.elapsedTime * gears[i].dir * (0.6 / gears[i].s)));
  });
  return (
    <group ref={ref}>
      {gears.map((g, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={g.pos} rotation={[0, -Math.atan2(g.pos[2], g.pos[0]), 0]} geometry={gearGeometry({ teeth: g.t, radius: g.s, thickness: 0.05, spokes: 4, hole: 0.03 })} material={mat(i % 3 ? 'brass' : 'gold')} />
      ))}
    </group>
  );
}

export default function FinaleScene() {
  const p = useProgress('finale', 3);
  const explode = useRef(1);
  const count = useParticleCount(6000);
  useCameraRig((prog, t, out) => {
    const pull = range(prog, 0, 0.3);
    const orbit = range(prog, 0.45, 1);
    const ang = 0.9 - pull * 0.4 + orbit * Math.PI * 0.9 + t * 0.03;
    const r = 6 + pull * 7 - orbit * 3.5;
    out.pos.set(Math.sin(ang) * r, 1.4 - orbit * 0.9, Math.cos(ang) * r);
    out.look.set(0, 0, 0);
    out.fov = 32;
  }, p, 2.2);
  useFrame((_, dt) => {
    const target = 1 - range(p.current, 0.15, 0.7);
    explode.current = damp(explode.current, target, 2.5, Math.min(dt, 0.1));
  });
  return (
    <>
      <StudioLights keyLight={1.1} rim={1.6} shadowY={0} />
      <LightSweep period={6} intensity={70} />
      <GoldDust count={count} radius={9} height={7} size={22} flow={1} />
      <GearHalo />
      <group rotation={[-0.2, 0.3, 0]}>
        <WatchModel spec={EXPLODED_SPEC} explode={explode} showMovement />
      </group>
    </>
  );
}
