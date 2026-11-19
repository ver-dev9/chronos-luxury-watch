/**
 * Post-processing chain, scaled by quality level and by chapter:
 *  HIGH   bloom (2x MSAA) + grain + vignette (+ outline)
 *  MEDIUM bloom + grain + vignette (+ outline)
 *  LOW    no composer (CSS vignette only)
 */
import { Bloom, EffectComposer, Noise, Outline, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { useExperience } from '../store/useExperience';

export function Effects() {
  const quality = useExperience((s) => s.quality);
  const chapter = useExperience((s) => s.displayed);
  if (quality === 'low') return null;
  const outline = chapter === 'exploded';
  return (
    <EffectComposer multisampling={quality === 'high' ? 2 : 0} enableNormalPass={false}>
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
      <Bloom
        mipmapBlur
        intensity={quality === 'high' ? 0.7 : 0.5}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.2}
        radius={0.7}
        resolutionScale={0.5}
      />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
      <Vignette eskil={false} offset={0.22} darkness={0.85} />
    </EffectComposer>
  );
}
