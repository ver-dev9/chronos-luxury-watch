import { useMemo } from 'react';
import * as THREE from 'three';
import type { WatchSpec } from '../data/watches';
import { dialTexture } from '../utils/textures';
import { mat } from '../utils/materials';
import { ringGeometry } from '../utils/geometry';

const PRINT: Record<string, string> = {
  obsidian: '#d8c49a',
  champagne: '#2a2015',
  ivory: '#2b2418',
  midnight: '#e2cf9f',
  emerald: '#e6d6ad',
  smoke: '#d9d4c8',
};

export function Dial({ spec, size = 1024 }: { spec: WatchSpec; size?: number }) {
  const tex = useMemo(
    () =>
      dialTexture({
        style: spec.dial,
        color: spec.dialColor,
        roman: spec.markers === 'roman',
        printColor: PRINT[spec.dialColor] ?? '#d8c49a',
        subdials: !!spec.subdials,
        size,
      }),
    [spec.dial, spec.dialColor, spec.markers, spec.subdials, size],
  );
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: spec.dial === 'enamel' ? 0.08 : 0.32,
        metalness: spec.dial === 'enamel' ? 0 : 0.55,
        clearcoat: spec.dial === 'enamel' || spec.dial === 'carbon' ? 1 : 0.2,
        envMapIntensity: 0.9,
      }),
    [tex, spec.dial],
  );
  if (spec.skeleton) {
    // open-worked: only a chapter ring remains
    return (
      <group>
        <mesh geometry={ringGeometry(0.86, 0.66, 0.012, { bevel: 0.004 })} material={mat('darkSteel')} />
        <mesh position={[0, 0, 0.012]}>
          <ringGeometry args={[0.68, 0.85, 96]} />
          <meshPhysicalMaterial map={tex} roughness={0.4} metalness={0.4} transparent alphaTest={0.01} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh material={material}>
        <circleGeometry args={[0.86, 128]} />
      </mesh>
      {spec.subdials && <Subdials color={spec.dialColor} />}
    </group>
  );
}

function Subdials({ color }: { color: string }) {
  const dark = ['obsidian', 'midnight', 'emerald', 'smoke'].includes(color);
  return (
    <group>
      {[
        [0, -0.4],
        [-0.38, 0],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, 0.002]}>
          <mesh>
            <circleGeometry args={[0.17, 64]} />
            <meshPhysicalMaterial color={dark ? '#151515' : '#d6ccb5'} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.002]} material={mat(dark ? 'gold' : 'darkSteel')}>
            <ringGeometry args={[0.165, 0.175, 64]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Applied indices. */
export function Markers({ spec }: { spec: WatchSpec }) {
  const kind = spec.markers;
  if (kind === 'roman') return null;
  const matKey = kind === 'silver' ? 'rhodium' : kind === 'gem' ? 'gem' : 'gold';
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <group>
      {items.map((i) => {
        if (kind === 'minimal' && i % 3 !== 0) return null;
        if (spec.subdials && (i === 6 || i === 9)) return null;
        const a = (i / 12) * Math.PI * 2;
        const r = spec.skeleton ? 0.74 : 0.72;
        const big = i % 3 === 0;
        return (
          <group key={i} position={[Math.sin(a) * r, Math.cos(a) * r, 0.01]} rotation={[0, 0, -a]}>
            {kind === 'gem' ? (
              <mesh material={mat('gem')} rotation={[Math.PI / 2, 0, 0]}>
                <octahedronGeometry args={[big ? 0.045 : 0.032, 0]} />
              </mesh>
            ) : (
              <mesh material={mat(matKey)}>
                <boxGeometry
                  args={[big && i === 0 ? 0.07 : 0.035, kind === 'minimal' ? 0.07 : big ? 0.13 : 0.1, 0.02]}
                />
              </mesh>
            )}
            {kind !== 'gem' && kind !== 'minimal' && (
              <mesh position={[0, 0.03, 0.012]} material={mat('lume')}>
                <boxGeometry args={[0.012, 0.05, 0.004]} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
