/**
 * The single, fixed WebGL stage shared by every chapter.
 */
import { Canvas } from '@react-three/fiber';
import { AdaptiveEvents, PerformanceMonitor, Preload } from '@react-three/drei';
import { Selection } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useExperience, type Quality } from '../store/useExperience';
import { SceneDirector } from './SceneDirector';
import { Effects } from './Effects';
import { StudioEnvironment } from './StudioEnvironment';
import { LiquidGold } from '../shaders/gold/LiquidGold';

const DPR: Record<Quality, [number, number]> = { high: [1, 2], medium: [1, 1.5], low: [0.75, 1] };
const DOWN: Record<Quality, Quality> = { high: 'medium', medium: 'low', low: 'low' };
const UP: Record<Quality, Quality> = { high: 'high', medium: 'high', low: 'medium' };

export function Experience({ onReady }: { onReady: () => void }) {
  const quality = useExperience((s) => s.quality);
  const auto = useExperience((s) => s.autoQuality);
  const setQuality = useExperience((s) => s.setQuality);
  const viewer = useExperience((s) => s.viewer);

  return (
    <div className={`fixed inset-0 ${viewer ? 'z-[60]' : 'z-0'}`} aria-hidden="true">
      <Canvas
        dpr={DPR[quality]}
        shadows={quality !== 'low' ? 'soft' : false}
        camera={{ fov: 32, near: 0.05, far: 120, position: [0, 0, 9] }}
        gl={{
          antialias: quality !== 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor('#080807');
          scene.fog = new THREE.FogExp2('#080807', 0.035);
          requestAnimationFrame(() => requestAnimationFrame(onReady));
        }}
      >
        <PerformanceMonitor
          bounds={() => [38, 58]}
          flipflops={3}
          onDecline={() => auto && setQuality(DOWN[useExperience.getState().quality], true)}
          onIncline={() => auto && setQuality(UP[useExperience.getState().quality], true)}
        />
        <AdaptiveEvents />
        <StudioEnvironment />
        <Selection>
          <SceneDirector />
          <Effects />
        </Selection>
        <LiquidGold />
        <Preload all />
      </Canvas>
    </div>
  );
}
