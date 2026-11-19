/**
 * 09 — THE CRAFTSMANSHIP
 * Six fictional atelier vignettes along a workbench — machining, gear
 * cutting, polishing, assembly, dial finishing, inspection — each an
 * animated 3D tableau. Scroll dollies the camera from station to station.
 */
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraRig, useProgress } from '../shared';
import { gearGeometry, ringGeometry } from '../../utils/geometry';
import { mat } from '../../utils/materials';
import { GoldDust } from '../../shaders/particles/GoldDust';
import { Movement } from '../../models/Movement';
import { Dial } from '../../models/Dial';
import { WatchModel } from '../../models/WatchModel';
import { HERO_SPEC } from '../../data/watches';
import { CRAFT_STEPS } from '../../data/materials';
import { scrollState } from '../../store/scrollState';
import { damp } from '../../utils/math';

const GAP = 7;

function Station({ index, children }: { index: number; children: ReactNode }) {
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef(new THREE.Object3D());
  useFrame((_, dt) => {
    const active = Math.round(scrollState.progress.craftsmanship * (CRAFT_STEPS.length - 1)) === index;
    if (light.current) {
      light.current.target = target.current;
      light.current.intensity = damp(light.current.intensity, active ? 260 : 30, 3, dt);
    }
  });
  return (
    <group position={[index * GAP, 0, 0]}>
      <primitive object={target.current} />
      <spotLight
        ref={light}
        position={[1.2, 5, 3]}
        angle={0.45}
        penumbra={0.8}
        color="#ffefd2"
        decay={2}
        intensity={30}
      />
      {children}
    </group>
  );
}

function Machining() {
  const blank = useRef<THREE.Group>(null);
  const tool = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (blank.current) blank.current.rotation.y = t * 6;
    if (tool.current) tool.current.position.x = 1.25 + Math.sin(t * 0.8) * 0.12;
  });
  return (
    <group rotation={[0, -0.4, 0]}>
      <group ref={blank}>
        <mesh material={mat('steel')}>
          <cylinderGeometry args={[0.9, 0.95, 0.55, 96]} />
        </mesh>
        <mesh position={[0, -0.6, 0]} material={mat('darkSteel')}>
          <cylinderGeometry args={[0.6, 0.7, 0.7, 6]} />
        </mesh>
      </group>
      <group ref={tool} position={[1.25, 0.05, 0]}>
        <mesh material={mat('darkSteel')}>
          <boxGeometry args={[1.2, 0.18, 0.18]} />
        </mesh>
        <mesh position={[-0.65, 0, 0]} material={mat('gold')} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.12, 0.2]} />
        </mesh>
      </group>
      <group position={[0.85, 0.05, 0]}>
        <GoldDust count={260} radius={0.5} height={0.6} size={10} color="#ffb35a" />
      </group>
    </group>
  );
}

function GearCutting() {
  const gear = useRef<THREE.Mesh>(null);
  const hob = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (gear.current) gear.current.rotation.z = t * 0.3;
    if (hob.current) hob.current.rotation.y = t * 4;
  });
  return (
    <group rotation={[-0.5, 0, 0]}>
      <mesh
        ref={gear}
        geometry={gearGeometry({ teeth: 48, radius: 1, thickness: 0.12, spokes: 5, hole: 0.12 })}
        material={mat('brass')}
      />
      <group ref={hob} position={[1.35, 0, 0]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={i}
            position={[0, (i - 3) * 0.09, 0]}
            rotation={[Math.PI / 2, 0, i * 0.4]}
            geometry={gearGeometry({ teeth: 14, radius: 0.32, thickness: 0.06, spokes: 0, hole: 0.05 })}
            material={mat('darkSteel')}
          />
        ))}
      </group>
    </group>
  );
}

function Polishing() {
  const ring = useRef<THREE.Mesh>(null);
  const wheel = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 0.5;
    if (wheel.current) wheel.current.rotation.x = t * 10;
  });
  return (
    <group rotation={[-0.6, 0.3, 0]}>
      <mesh
        ref={ring}
        geometry={ringGeometry(1, 0.78, 0.18, { flutes: 60, bevel: 0.05 })}
        material={mat('gold')}
      />
      <mesh ref={wheel} position={[1.5, 0, 0.35]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.35, 48]} />
        <meshStandardMaterial color="#e8dcc4" roughness={1} />
      </mesh>
    </group>
  );
}

function Assembly() {
  const part = useRef<THREE.Group>(null);
  useFrame((s) => {
    const k = (s.clock.elapsedTime % 4) / 4;
    const y = k < 0.6 ? 1.6 - (k / 0.6) * 1.55 : 0.05;
    if (part.current) part.current.position.set(0.282 * 1.6, y + 0.103 * 1.6, 0.4 - Math.min(k, 0.6) * 0.5);
  });
  return (
    <group rotation={[-0.75, 0, 0]}>
      <group scale={1.6}>
        <Movement detail="low" motionWorks={false} />
      </group>
      <group ref={part}>
        <mesh
          geometry={gearGeometry({ teeth: 70, radius: 0.3, thickness: 0.03, spokes: 5, hole: 0.03 })}
          material={mat('gold')}
        />
        <mesh position={[0.06, 0.9, 0]} rotation={[0, 0, 0.08]} material={mat('steel')}>
          <boxGeometry args={[0.04, 1.6, 0.03]} />
        </mesh>
        <mesh position={[-0.06, 0.9, 0]} rotation={[0, 0, -0.08]} material={mat('steel')}>
          <boxGeometry args={[0.04, 1.6, 0.03]} />
        </mesh>
      </group>
    </group>
  );
}

function DialFinishing() {
  const dial = useRef<THREE.Group>(null);
  const brush = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (dial.current) dial.current.rotation.z = t * 0.6;
    if (brush.current) brush.current.position.x = Math.sin(t * 1.2) * 0.5;
  });
  return (
    <group rotation={[-0.9, 0, 0]} scale={1.3}>
      <group ref={dial}>
        <Dial spec={{ ...HERO_SPEC, dialColor: 'midnight', subdials: false }} size={1024} />
      </group>
      <mesh ref={brush} position={[0, 0, 0.35]} material={mat('darkSteel')}>
        <boxGeometry args={[0.22, 0.9, 0.06]} />
      </mesh>
    </group>
  );
}

function Inspection() {
  const loupe = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (loupe.current) loupe.current.position.set(Math.sin(t * 0.5) * 0.5, Math.cos(t * 0.4) * 0.35, 1.3);
  });
  return (
    <group>
      <group rotation={[-0.2, -0.3, 0]}>
        <WatchModel spec={HERO_SPEC} />
      </group>
      <group ref={loupe}>
        <mesh material={mat('darkSteel')}>
          <torusGeometry args={[0.55, 0.06, 16, 64]} />
        </mesh>
        <mesh material={mat('sapphire')}>
          <sphereGeometry args={[0.55, 32, 16]} />
        </mesh>
      </group>
    </group>
  );
}

export default function CraftsmanshipScene() {
  const p = useProgress('craftsmanship', 3);
  useCameraRig(
    (prog, t, out) => {
      const x = prog * (CRAFT_STEPS.length - 1) * GAP;
      out.pos.set(x + 1.0, 1.2 + Math.sin(t * 0.25) * 0.08, 6.6);
      out.look.set(x + 0.9, 0, 0);
      out.fov = 34;
    },
    p,
    2.6,
  );
  return (
    <>
      <fog attach="fog" args={['#080807', 6, 22]} />
      <ambientLight intensity={0.05} />
      <mesh rotation-x={-Math.PI / 2} position={[17, -1.8, 0]}>
        <planeGeometry args={[60, 14]} />
        <meshStandardMaterial color="#110f0c" roughness={0.55} metalness={0.4} />
      </mesh>
      <Station index={0}>
        <Machining />
      </Station>
      <Station index={1}>
        <GearCutting />
      </Station>
      <Station index={2}>
        <Polishing />
      </Station>
      <Station index={3}>
        <Assembly />
      </Station>
      <Station index={4}>
        <DialFinishing />
      </Station>
      <Station index={5}>
        <Inspection />
      </Station>
    </>
  );
}
