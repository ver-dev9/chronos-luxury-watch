/**
 * Explode system. A WatchModel can be given a mutable `explode` ref (0..1).
 * Every ExplodePart reads it inside useFrame and moves along its own offset
 * with a staggered, eased curve — no React re-renders while scrolling.
 */
import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Select } from '@react-three/postprocessing';
import type { ComponentId } from '../data/components';
import { COMPONENTS } from '../data/components';
import { useExperience } from '../store/useExperience';

export interface ExplodeCtx {
  explode: { current: number } | null;
  interactive: boolean;
  labels: boolean;
}

export const ExplodeContext = createContext<ExplodeCtx>({ explode: null, interactive: false, labels: false });
export const useExplode = () => useContext(ExplodeContext);

const smooth = (a: number, b: number, v: number) => {
  const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

interface PartProps {
  id: ComponentId;
  offset: [number, number, number];
  /** 0..1 — when in the explode timeline this part starts to move */
  delay?: number;
  /** extra rotation (radians around Z) once fully separated */
  spin?: number;
  /** extra tilt (radians around X) when separated, for a more sculptural composition */
  tilt?: number;
  label?: boolean;
  labelOffset?: [number, number, number];
  children: ReactNode;
}

export function ExplodePart({ id, offset, delay = 0, spin = 0, tilt = 0, label = true, labelOffset = [0, 0, 0], children }: PartProps) {
  const { explode, interactive, labels } = useExplode();
  const group = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const selected = useExperience((s) => s.selectedComponent === id);
  const selectComponent = useExperience((s) => s.selectComponent);

  useFrame((state) => {
    if (!group.current) return;
    const e = explode ? explode.current : 0;
    const t = smooth(delay, Math.min(1, delay + 0.5), e);
    group.current.position.set(offset[0] * t, offset[1] * t, offset[2] * t);
    group.current.rotation.z = spin * t;
    group.current.rotation.x = tilt * t;
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.015 + 0.03 : 1;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, pulse, 0.15));
    if (labelRef.current) {
      const vis = labels && e > 0.55 ? smooth(0.55, 0.8, e) : 0;
      labelRef.current.style.opacity = String(vis);
      labelRef.current.style.pointerEvents = vis > 0.5 ? 'auto' : 'none';
    }
  });

  if (!interactive) return <group ref={group}>{children}</group>;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // it was a drag, not a click
    selectComponent(selected ? null : id);
  };

  return (
    <group
      ref={group}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.dataset.cursor = 'inspect';
      }}
      onPointerOut={() => {
        delete document.body.dataset.cursor;
      }}
    >
      <Select enabled={selected}>{children}</Select>
      {labels && label && (
        <Html position={labelOffset} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            ref={labelRef}
            className={`part-label ${selected ? 'is-selected' : ''}`}
            style={{ opacity: 0 }}
            onClick={() => selectComponent(selected ? null : id)}
          >
            <span className="dot" />
            {COMPONENTS[id].name}
          </div>
        </Html>
      )}
    </group>
  );
}
