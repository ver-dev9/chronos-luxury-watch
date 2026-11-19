/**
 * 05 — THE ART OF MATERIALS
 * The case material cross-fades through eight physically based presets as
 * the camera orbits. Beside it, a dedicated specimen for each material is
 * shown in close-up with the true preset (not a recoloured gold).
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { WatchModel } from '../../models/WatchModel';
import { MATERIAL_STORIES } from '../../data/materials';
import type { WatchSpec } from '../../data/watches';
import { mat, type MatKey } from '../../utils/materials';
import { carbonTexture, leatherBump } from '../../utils/textures';
import { StudioLights, useCameraRig, useProgress } from '../shared';
import { LightSweep } from '../../shaders/transitions/LightSweep';
import { damp } from '../../utils/math';

interface Preset {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  transmission: number;
  sheen: number;
  ior: number;
  map?: 'carbon';
  bump?: 'leather';
}

const PRESETS: Record<string, Preset> = {
  gold: {
    color: '#e9b964',
    metalness: 1,
    roughness: 0.17,
    clearcoat: 0.3,
    transmission: 0,
    sheen: 0,
    ior: 1.5,
  },
  titanium: {
    color: '#8d9096',
    metalness: 1,
    roughness: 0.42,
    clearcoat: 0,
    transmission: 0,
    sheen: 0,
    ior: 1.5,
  },
  steel: {
    color: '#c8ccd2',
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0,
    transmission: 0,
    sheen: 0,
    ior: 1.5,
  },
  sapphire: {
    color: '#ffffff',
    metalness: 0,
    roughness: 0.03,
    clearcoat: 1,
    transmission: 1,
    sheen: 0,
    ior: 1.77,
  },
  ceramic: {
    color: '#0c0c0e',
    metalness: 0,
    roughness: 0.16,
    clearcoat: 1,
    transmission: 0,
    sheen: 0,
    ior: 1.6,
  },
  carbon: {
    color: '#ffffff',
    metalness: 0.25,
    roughness: 0.38,
    clearcoat: 1,
    transmission: 0,
    sheen: 0,
    ior: 1.5,
    map: 'carbon',
  },
  leather: {
    color: '#5a3420',
    metalness: 0,
    roughness: 0.68,
    clearcoat: 0,
    transmission: 0,
    sheen: 0.8,
    ior: 1.4,
    bump: 'leather',
  },
  gem: {
    color: '#e9b964',
    metalness: 1,
    roughness: 0.15,
    clearcoat: 0.3,
    transmission: 0,
    sheen: 0,
    ior: 1.5,
  },
};

const SPEC: WatchSpec = {
  caseMaterial: 'gold',
  caseShape: 'round',
  bezel: 'smooth',
  dial: 'sunburst',
  dialColor: 'obsidian',
  hands: 'dauphine',
  strap: 'leatherBlack',
  markers: 'minimal',
};
const GEM_SPEC: WatchSpec = { ...SPEC, bezel: 'gem', markers: 'gem' };

/** A brilliant-cut gem built with a lathe profile and flat shading. */
function Brilliant() {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, -0.6),
      new THREE.Vector2(0.5, -0.05),
      new THREE.Vector2(0.5, 0.02),
      new THREE.Vector2(0.3, 0.22),
      new THREE.Vector2(0, 0.22),
    ];
    const g = new THREE.LatheGeometry(pts, 16);
    return g.toNonIndexed();
  }, []);
  useEffect(() => {
    geo.computeVertexNormals();
  }, [geo]);
  return <mesh geometry={geo} material={mat('gem')} rotation={[0.4, 0, 0.2]} />;
}

function Specimen({ k }: { k: MatKey | 'brilliant' }) {
  switch (k) {
    case 'gold':
      return <RoundedBox args={[1.2, 0.5, 0.28]} radius={0.06} material={mat('gold')} />;
    case 'titanium':
      return (
        <mesh material={mat('titanium')} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.12, 64]} />
        </mesh>
      );
    case 'steel':
      return (
        <mesh material={mat('steel')}>
          <torusKnotGeometry args={[0.38, 0.12, 128, 16]} />
        </mesh>
      );
    case 'sapphire':
      return (
        <mesh material={mat('sapphire')} rotation={[Math.PI / 2.3, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.08, 64]} />
        </mesh>
      );
    case 'ceramic':
      return (
        <mesh material={mat('ceramic')}>
          <torusGeometry args={[0.5, 0.14, 32, 96]} />
        </mesh>
      );
    case 'carbon':
      return (
        <RoundedBox args={[1.1, 1.1, 0.08]} radius={0.04} material={mat('carbon')} rotation={[0.3, 0.4, 0]} />
      );
    case 'leatherBrown':
      return (
        <RoundedBox
          args={[0.9, 1.3, 0.06]}
          radius={0.03}
          material={mat('leatherBrown')}
          rotation={[0.2, 0.5, 0.1]}
        />
      );
    default:
      return <Brilliant />;
  }
}

const SPECIMENS: (MatKey | 'brilliant')[] = [
  'gold',
  'titanium',
  'steel',
  'sapphire',
  'ceramic',
  'carbon',
  'leatherBrown',
  'brilliant',
];

export default function MaterialsScene() {
  const p = useProgress('materials', 3);
  const caseMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ envMapIntensity: 1.25, thickness: 0.6 }),
    [],
  );
  const specimens = useRef<(THREE.Group | null)[]>([]);
  const gemWatch = useRef<THREE.Group>(null);
  const plainWatch = useRef<THREE.Group>(null);
  const tmpA = useMemo(() => new THREE.Color(), []);
  const tmpB = useMemo(() => new THREE.Color(), []);
  const lastMap = useRef<string>('');
  const holder = useRef<THREE.Group>(null);
  const right = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => caseMat.dispose(), [caseMat]);

  useCameraRig(
    (prog, t, out) => {
      const ang = prog * Math.PI * 2 * 1.0 + 0.4;
      const r = 7.6 + Math.sin(prog * Math.PI * 8) * 0.5;
      out.pos.set(Math.sin(ang) * r, 0.9 + Math.sin(t * 0.2) * 0.1, Math.cos(ang) * r);
      out.look.set(0, 0, 0);
      out.fov = 30;
    },
    p,
    2.5,
  );

  useFrame((state, dt) => {
    const n = MATERIAL_STORIES.length;
    const f = Math.min(n - 1.0001, Math.max(0, p.current * n - 0.5));
    const i = Math.floor(f);
    const blend = THREE.MathUtils.smoothstep(f - i, 0.55, 1);
    const A = PRESETS[MATERIAL_STORIES[i].key];
    const B = PRESETS[MATERIAL_STORIES[Math.min(n - 1, i + 1)].key];
    const L = (a: number, b: number) => a + (b - a) * blend;
    caseMat.color.copy(tmpA.set(A.color)).lerp(tmpB.set(B.color), blend);
    caseMat.metalness = L(A.metalness, B.metalness);
    caseMat.roughness = L(A.roughness, B.roughness);
    caseMat.clearcoat = L(A.clearcoat, B.clearcoat);
    caseMat.transmission = L(A.transmission, B.transmission);
    caseMat.sheen = L(A.sheen, B.sheen);
    caseMat.ior = L(A.ior, B.ior);
    const dominant = blend < 0.5 ? A : B;
    const mapKey = `${dominant.map ?? ''}|${dominant.bump ?? ''}`;
    if (mapKey !== lastMap.current) {
      caseMat.map = dominant.map === 'carbon' ? carbonTexture() : null;
      caseMat.bumpMap = dominant.bump === 'leather' ? leatherBump() : null;
      caseMat.bumpScale = 0.8;
      caseMat.sheenColor.set('#c08a5a');
      caseMat.needsUpdate = true;
      lastMap.current = mapKey;
    }
    const active = Math.round(f);
    specimens.current.forEach((g, k) => {
      if (!g) return;
      const target = k === active ? 1 : 0.0001;
      const s = damp(g.scale.x, target, 5, dt);
      g.scale.setScalar(s);
      g.visible = s > 0.002;
      g.rotation.y += dt * 0.4;
    });
    const gemOn = MATERIAL_STORIES[active].key === 'gem';
    if (gemWatch.current && plainWatch.current) {
      gemWatch.current.visible = gemOn;
      plainWatch.current.visible = !gemOn;
    }
    if (holder.current) {
      // keep the specimen framed to the right of the watch, whatever the orbit
      right.set(1, 0, 0).applyQuaternion(state.camera.quaternion);
      holder.current.position.copy(right.multiplyScalar(2.15)).add(new THREE.Vector3(0, 0.75, 0));
    }
  });

  return (
    <>
      <StudioLights keyLight={1.1} rim={1.5} shadowY={-1.8} />
      <LightSweep period={5} intensity={70} />
      <group rotation={[-0.15, 0, 0]}>
        <group ref={plainWatch}>
          <WatchModel spec={SPEC} caseMaterial={caseMat} />
        </group>
        <group ref={gemWatch} visible={false}>
          <WatchModel spec={GEM_SPEC} />
        </group>
      </group>
      <group ref={holder}>
        {SPECIMENS.map((k, i) => (
          <group key={k} ref={(el) => (specimens.current[i] = el)} scale={0.0001}>
            <Specimen k={k} />
          </group>
        ))}
      </group>
    </>
  );
}
