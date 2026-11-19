/**
 * 07 — THE ATELIER (configurator)
 * The model rebuilds instantly from the store's configuration. Drag (or the
 * on-screen rotate controls) to inspect; "Reveal your creation" runs a
 * cinematic orbit with a light sweep and a gold-dust vortex.
 */
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { WatchModel } from '../../models/WatchModel';
import { useExperience } from '../../store/useExperience';
import { specFromConfig } from './specFromConfig';
import { DragRotate, StudioLights, useCameraRig, useParticleCount } from '../shared';
import { LightSweep } from '../../shaders/transitions/LightSweep';
import { GoldDust } from '../../shaders/particles/GoldDust';

export default function ConfiguratorScene() {
  const config = useExperience((s) => s.config);
  const revealing = useExperience((s) => s.revealing);
  const viewer = useExperience((s) => s.viewer);
  const spec = useMemo(() => specFromConfig(config), [config]);
  const { size } = useThree();
  const revealStart = useRef<number | null>(null);
  const sweep = useRef({ current: 0 }).current;
  const count = useParticleCount(2500);
  const prog = useRef({ current: 0 }).current;
  const portrait = size.width < size.height;

  useCameraRig(
    (_p, t, out) => {
      if (useExperience.getState().revealing) {
        if (revealStart.current == null) revealStart.current = t;
        const k = Math.min(1, (t - revealStart.current) / 5);
        const ang = -0.9 + k * Math.PI * 1.15;
        const r = 8 - Math.sin(k * Math.PI) * 3.2;
        out.pos.set(Math.sin(ang) * r, 0.3 + Math.sin(k * Math.PI) * 1.2, Math.cos(ang) * r);
        out.look.set(0, 0, 0);
        out.fov = 28;
        sweep.current = k;
        return;
      }
      revealStart.current = null;
      const full = useExperience.getState().viewer;
      if (portrait) {
        out.pos.set(0, -1.6, 10.5);
        out.look.set(0, -1.25, 0);
      } else {
        out.pos.set(full ? 0 : -1.9, 0.2, full ? 7.5 : 8);
        out.look.set(full ? 0 : -1.9, 0, 0);
      }
      out.fov = 32;
    },
    prog,
    3,
  );

  useFrame(() => {
    if (!useExperience.getState().revealing) sweep.current = 0;
  });

  return (
    <>
      <StudioLights keyLight={1} rim={1.3} shadowY={-1.8} />
      {revealing && <LightSweep drive={sweep} intensity={120} />}
      {!revealing && <LightSweep period={8} intensity={40} />}
      <GoldDust count={count} radius={6} height={6} size={16} flow={revealing ? 1 : 0} />
      <DragRotate hover={viewer ? 0.05 : 0.15} autoSpin={0}>
        <group rotation={[-0.15, -0.35, 0]}>
          <WatchModel spec={spec} />
        </group>
      </DragRotate>
    </>
  );
}
