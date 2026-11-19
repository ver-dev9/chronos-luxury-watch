/**
 * 06 — THE ART OF TIME
 * A cathedral-scale clockwork: giant meshing gears, a Roman chapter ring,
 * enormous hands, a swinging pendulum, colonnade shadows and a shaft of
 * light. The camera threads between the wheels as you scroll.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gearGeometry, handGeometry } from '../../utils/geometry';
import { mat } from '../../utils/materials';
import { useCameraRig, useParticleCount, useProgress } from '../shared';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { VolumetricBeam } from '../../shaders/transitions/VolumetricBeam';
import { scrollState } from '../../store/scrollState';

function romanRing() {
  const S = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2;
  ctx.strokeStyle = '#c7a76b';
  ctx.lineWidth = 6;
  [0.99, 0.8, 0.78].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cx, cx * r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = '#e4c88d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${S * 0.085}px "Cormorant Garamond", Georgia, serif`;
  const N = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  N.forEach((n, i) => {
    const a = (i / 12) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.sin(a) * cx * 0.89, cx - Math.cos(a) * cx * 0.89);
    ctx.rotate(a);
    ctx.fillText(n, 0, 0);
    ctx.restore();
  });
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    ctx.lineWidth = i % 5 ? 3 : 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * cx * 0.78, cx - Math.cos(a) * cx * 0.78);
    ctx.lineTo(cx + Math.sin(a) * cx * (i % 5 ? 0.75 : 0.72), cx - Math.cos(a) * cx * (i % 5 ? 0.75 : 0.72));
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const GEARS: {
  pos: [number, number, number];
  r: number;
  teeth: number;
  dir: 1 | -1;
  m: 'brass' | 'darkSteel' | 'gold';
}[] = [
  { pos: [-5.2, 2.2, -2], r: 3.0, teeth: 60, dir: 1, m: 'brass' },
  { pos: [-1.2, 3.6, -2.4], r: 1.3, teeth: 26, dir: -1, m: 'darkSteel' },
  { pos: [4.8, -1.4, -1.2], r: 2.6, teeth: 52, dir: -1, m: 'brass' },
  { pos: [1.6, -3.4, -1.0], r: 1.0, teeth: 20, dir: 1, m: 'gold' },
  { pos: [-3.6, -3.2, 1.2], r: 1.8, teeth: 36, dir: -1, m: 'darkSteel' },
  { pos: [3.0, 3.6, 2.4], r: 1.5, teeth: 30, dir: 1, m: 'brass' },
  { pos: [-1.8, 0.4, 4.0], r: 1.1, teeth: 22, dir: 1, m: 'gold' },
  { pos: [2.4, 0.8, 5.5], r: 0.8, teeth: 16, dir: -1, m: 'brass' },
];

export default function TimeScene() {
  const p = useProgress('time', 3);
  const count = useParticleCount(3500);
  const ring = useMemo(romanRing, []);
  useEffect(() => () => ring.dispose(), [ring]);
  const gearRefs = useRef<(THREE.Mesh | null)[]>([]);
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const pendulum = useRef<THREE.Group>(null);

  useCameraRig(
    (prog, t, out) => {
      const pts = [
        [0, 0.6, 19],
        [-2.6, 0.9, 9],
        [2.2, -0.4, 4.2],
        [-0.6, 0.3, 1.2],
      ];
      const f = Math.min(2.999, prog * 3);
      const i = Math.floor(f);
      const k = THREE.MathUtils.smoothstep(f - i, 0, 1);
      const a = pts[i];
      const b = pts[i + 1];
      out.pos.set(
        a[0] + (b[0] - a[0]) * k,
        a[1] + (b[1] - a[1]) * k + Math.sin(t * 0.3) * 0.1,
        a[2] + (b[2] - a[2]) * k,
      );
      out.look.set(0, 0.2, -6);
      out.fov = 38;
    },
    p,
    2.2,
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime + scrollState.progress.time * 40;
    gearRefs.current.forEach((g, i) => {
      if (g) g.rotation.z = (GEARS[i].dir * t * 0.35) / GEARS[i].r;
    });
    if (minute.current) minute.current.rotation.z = -t * 0.2;
    if (hour.current) hour.current.rotation.z = (-t * 0.2) / 12 - 1.2;
    if (pendulum.current) pendulum.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.32;
  });

  return (
    <>
      <fog attach="fog" args={['#080807', 6, 34]} />
      <ambientLight intensity={0.05} color="#c7a76b" />
      <spotLight
        position={[2, 14, 6]}
        angle={0.42}
        penumbra={0.7}
        intensity={900}
        color="#ffe4b0"
        decay={2}
      />
      <pointLight position={[0, 0, -4]} intensity={30} color="#e4c88d" decay={2} />
      <VolumetricBeam
        position={[2, 6.5, 2]}
        rotation={[0.22, 0, 0.12]}
        length={14}
        radius={3.5}
        intensity={0.9}
      />

      {/* the great chapter ring */}
      <group position={[0, 0.5, -6]}>
        <mesh>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial
            map={ring}
            transparent
            roughness={0.4}
            metalness={0.8}
            color="#ffffff"
            emissive="#3a2a10"
            emissiveIntensity={0.25}
          />
        </mesh>
        <group ref={hour} position={[0, 0, 0.2]}>
          <mesh geometry={handGeometry('dauphine', 3.6, 0.55)} material={mat('gold')} />
        </group>
        <group ref={minute} position={[0, 0, 0.45]}>
          <mesh geometry={handGeometry('dauphine', 5.4, 0.42)} material={mat('gold')} />
        </group>
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={mat('gold')}>
          <cylinderGeometry args={[0.28, 0.28, 0.3, 32]} />
        </mesh>
      </group>

      {/* gears */}
      {GEARS.map((g, i) => (
        <mesh
          key={i}
          ref={(el) => (gearRefs.current[i] = el)}
          position={g.pos}
          geometry={gearGeometry({
            teeth: g.teeth,
            radius: g.r,
            thickness: 0.35,
            spokes: g.r > 1.2 ? 6 : 4,
            hole: g.r * 0.12,
            toothDepth: g.r * 0.08,
          })}
          material={mat(g.m)}
        />
      ))}

      {/* pendulum */}
      <group ref={pendulum} position={[0, -3.2, -4.6]}>
        <mesh position={[0, -2.6, 0]} material={mat('brass')}>
          <boxGeometry args={[0.08, 5.2, 0.08]} />
        </mesh>
        <mesh position={[0, -5.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat('gold')}>
          <cylinderGeometry args={[0.9, 0.9, 0.18, 64]} />
        </mesh>
      </group>

      {/* colonnade */}
      {[-1, 1].map((side) =>
        Array.from({ length: 5 }, (_, i) => (
          <mesh key={`${side}${i}`} position={[side * 9, 0, 6 - i * 6]}>
            <boxGeometry args={[1.1, 22, 1.1]} />
            <meshStandardMaterial color="#14120f" roughness={0.75} metalness={0.2} />
          </mesh>
        )),
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, -9, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d0c0a" roughness={0.35} metalness={0.6} />
      </mesh>
      <GoldDust count={count} radius={12} height={14} size={30} />
    </>
  );
}
