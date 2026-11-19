import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { gearGeometry, type GearOpts } from '../utils/geometry';
import { mat, type MatKey } from '../utils/materials';

interface Props extends Partial<GearOpts> {
  teeth: number;
  radius: number;
  position?: [number, number, number];
  material?: MatKey;
  /** angle as a function of mechanism time (seconds) */
  drive?: (t: number) => number;
  /** pinion: a small coaxial gear */
  pinion?: number;
}

/** A single procedural gear wheel driven by the shared mechanism clock. */
export function Gear({
  teeth,
  radius,
  thickness = 0.025,
  spokes = 5,
  hole = 0.02,
  position = [0, 0, 0],
  material = 'brass',
  drive,
  pinion,
}: Props) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current && drive) ref.current.rotation.z = drive(s.clock.elapsedTime);
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={gearGeometry({ teeth, radius, thickness, spokes, hole })} material={mat(material)} />
      {pinion && (
        <mesh
          position={[0, 0, -thickness * 1.6]}
          geometry={gearGeometry({
            teeth: pinion,
            radius: radius * 0.22,
            thickness: thickness * 1.6,
            spokes: 0,
            hole,
          })}
          material={mat('rhodium')}
        />
      )}
      <mesh position={[0, 0, thickness * 0.9]} material={mat('rhodium')}>
        <cylinderGeometry args={[hole * 1.3, hole * 1.3, thickness * 1.2, 16]} />
      </mesh>
    </group>
  );
}
