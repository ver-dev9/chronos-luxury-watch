/**
 * Post-processing chain, scaled by quality level and by chapter:
 *  HIGH   bloom + chapter DOF + speed-reactive chromatic aberration + grain + vignette (+ outline)
 *  MEDIUM bloom + grain + vignette (+ outline)
 *  LOW    no composer (CSS vignette only)
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Outline,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';
import { useExperience } from '../store/useExperience';
import { scrollState } from '../store/scrollState';
import { dofFocus } from './dof';

function SpeedAberration() {
  const ref = useRef<any>(null);
  const offset = useRef(new THREE.Vector2(0.0004, 0.0004));
  useFrame(() => {
    const v = Math.min(Math.abs(scrollState.velocity), 60) / 60;
    const o = 0.00035 + v * 0.0022;
    offset.current.set(o, o * 0.6);
    if (ref.current) ref.current.offset = offset.current;
  });
  return (
    <ChromaticAberration
      ref={ref}
      offset={offset.current}
      radialModulation
      modulationOffset={0.35}
      blendFunction={BlendFunction.NORMAL}
    />
  );
}

export function Effects() {
  const quality = useExperience((s) => s.quality);
  const chapter = useExperience((s) => s.displayed);
  if (quality === 'low') return null;
  const dof = quality === 'high' && (chapter === 'movement' || chapter === 'signature');
  const outline = chapter === 'exploded';
  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
      <>
        {outline ? (
          <Outline
            visibleEdgeColor={0xe4c88d}
            hiddenEdgeColor={0x6b5a35}
            edgeStrength={6}
            blur
            kernelSize={KernelSize.SMALL}
            xRay
          />
        ) : null}
      </>
      <>{dof ? <DepthOfField target={dofFocus} focalLength={0.04} bokehScale={4} height={480} /> : null}</>
      <Bloom
        mipmapBlur
        intensity={quality === 'high' ? 0.7 : 0.5}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.2}
        radius={0.7}
      />
      <>{quality === 'high' ? <SpeedAberration /> : null}</>
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
    </EffectComposer>
  );
}
