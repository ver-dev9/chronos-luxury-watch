import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { BezelStyle, CaseShape } from '../data/watches';
import { ringGeometry, roundCaseGeometry, shapedCaseGeometry } from '../utils/geometry';
import { mat } from '../utils/materials';
import { tachyTexture } from '../utils/textures';
import { ExplodePart } from './explode';

export const CASE_R = 1;
export const CASE_H = 0.32;

interface CaseProps {
  shape: CaseShape;
  material: THREE.Material;
}

/** Middle case, lugs and crown. */
export function WatchCase({ shape, material }: CaseProps) {
  const body = useMemo(
    () =>
      shape === 'round'
        ? roundCaseGeometry(CASE_R, CASE_H)
        : shapedCaseGeometry(shape, CASE_R * 0.98, CASE_H),
    [shape],
  );
  const lugX = shape === 'cushion' ? 0.5 : 0.56;
  return (
    <group>
      <mesh geometry={body} material={material} castShadow receiveShadow />
      {[-1, 1].map((sy) =>
        [-1, 1].map((sx) => (
          <RoundedBox
            key={`${sx}${sy}`}
            args={[0.15, 0.42, 0.2]}
            radius={0.05}
            smoothness={3}
            position={[sx * lugX, sy * 0.98, -0.03]}
            rotation={[sy * -0.22, 0, 0]}
            material={material}
            castShadow
          />
        )),
      )}
      {/* crown + guards */}
      <group position={[CASE_R * 1.02, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 0.06, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 36]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={material}>
          <torusGeometry args={[0.1, 0.012, 6, 36]} />
        </mesh>
        <mesh position={[0, 0.125, 0]} material={mat('gold')}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 24]} />
        </mesh>
      </group>
    </group>
  );
}

interface BezelProps {
  style: BezelStyle;
  shape: CaseShape;
  material: THREE.Material;
}

/** Bezel variants: smooth, fluted, tachymeter, gem-set, screwed. */
export function Bezel({ style, shape, material }: BezelProps) {
  const sides = shape === 'octagon' ? 8 : undefined;
  const geo = useMemo(
    () =>
      ringGeometry(CASE_R * (shape === 'cushion' ? 0.94 : 0.97), 0.86, 0.04, {
        flutes: style === 'fluted' ? 60 : undefined,
        sides,
        bevel: 0.02,
      }),
    [style, shape, sides],
  );
  const gems = useRef<THREE.InstancedMesh>(null);
  const count = 36;
  useLayoutEffect(() => {
    if (style !== 'gem' || !gems.current) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      m.compose(
        new THREE.Vector3(Math.cos(a) * 0.915, Math.sin(a) * 0.915, 0.045),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, a, 0)),
        new THREE.Vector3(1, 0.7, 1),
      );
      gems.current.setMatrixAt(i, m);
    }
    gems.current.instanceMatrix.needsUpdate = true;
  }, [style]);

  return (
    <group>
      <mesh geometry={geo} material={style === 'tachymeter' ? mat('ceramic') : material} castShadow />
      {style === 'tachymeter' && (
        <mesh position={[0, 0, 0.042]}>
          <ringGeometry args={[0.865, 0.955, 96]} />
          <meshPhysicalMaterial map={tachyTexture()} roughness={0.3} clearcoat={1} />
        </mesh>
      )}
      {style === 'gem' && (
        <instancedMesh ref={gems} args={[undefined, undefined, count]} material={mat('gem')}>
          <octahedronGeometry args={[0.042, 0]} />
        </instancedMesh>
      )}
      {style === 'screwed' &&
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <group
              key={i}
              position={[Math.cos(a) * 0.915, Math.sin(a) * 0.915, 0.04]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <mesh material={mat('steel')}>
                <cylinderGeometry args={[0.035, 0.035, 0.02, 6]} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

/** Domed sapphire crystal. Uses transmission on high quality. */
export function Crystal({ lite }: { lite: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(2.2, 64, 8, 0, Math.PI * 2, 0, Math.asin(0.87 / 2.2));
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, -2.2 * Math.cos(Math.asin(0.87 / 2.2)));
    return g;
  }, []);
  return <mesh geometry={geo} material={mat(lite ? 'sapphireLite' : 'sapphire')} renderOrder={5} />;
}

/** Screw-down case back with a sapphire exhibition window. */
export function CaseBack({ material, lite }: { material: THREE.Material; lite: boolean }) {
  return (
    <group>
      <mesh geometry={ringGeometry(0.84, 0.55, 0.05, { bevel: 0.015 })} material={material} castShadow />
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat(lite ? 'sapphireLite' : 'sapphire')}>
        <cylinderGeometry args={[0.56, 0.56, 0.02, 64]} />
      </mesh>
    </group>
  );
}

export { ExplodePart };
