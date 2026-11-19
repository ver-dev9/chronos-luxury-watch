/**
 * The CHRONOS watch, assembled from procedural parts.
 * One component renders every collection piece, the configurator and the
 * exploded view — differences come from the WatchSpec, not from copy.
 */
import { forwardRef, useMemo } from 'react';
import type * as THREE from 'three';
import type { WatchSpec } from '../data/watches';
import { caseMatKey, mat } from '../utils/materials';
import { Bezel, CaseBack, Crystal, WatchCase } from './WatchCase';
import { Dial, Markers } from './Dial';
import { WatchHands } from './WatchHands';
import { Movement } from './Movement';
import { Strap } from './Strap';
import { ExplodeContext, ExplodePart } from './explode';
import { useExperience } from '../store/useExperience';

export interface WatchModelProps {
  spec: WatchSpec;
  explode?: { current: number } | null;
  interactive?: boolean;
  labels?: boolean;
  /** render the movement even behind a closed dial (exploded view) */
  showMovement?: boolean;
  /** replace the case material (material showcase cross-fades) */
  caseMaterial?: THREE.Material;
  strap?: boolean;
  frozenTime?: boolean;
}

export const WatchModel = forwardRef<THREE.Group, WatchModelProps & JSX.IntrinsicElements['group']>(function WatchModel(
  { spec, explode = null, interactive = false, labels = false, showMovement, caseMaterial, strap = true, frozenTime = false, ...group },
  ref,
) {
  const quality = useExperience((s) => s.quality);
  const lite = quality === 'low';
  const caseMat = caseMaterial ?? mat(caseMatKey(spec.caseMaterial));
  const ctx = useMemo(() => ({ explode, interactive, labels }), [explode, interactive, labels]);
  const movement = showMovement ?? !!spec.skeleton;

  return (
    <ExplodeContext.Provider value={ctx}>
      <group ref={ref} {...group}>
        <ExplodePart id="crystal" offset={[0, 0, 2.8]} delay={0} labelOffset={[0.6, 0.6, 0.1]}>
          <group position={[0, 0, 0.2]}>
            <Crystal lite={lite} />
          </group>
        </ExplodePart>
        <ExplodePart id="bezel" offset={[0, 0, 2.25]} delay={0.05} labelOffset={[-0.85, 0.55, 0]}>
          <group position={[0, 0, 0.17]}>
            <Bezel style={spec.bezel} shape={spec.caseShape} material={caseMat} />
          </group>
        </ExplodePart>
        <ExplodePart id="hands" offset={[0, 0.0, 1.75]} delay={0.12} spin={-0.4} labelOffset={[0.15, 0.7, 0]}>
          <group position={[0, 0, 0.09]}>
            <WatchHands spec={spec} frozen={frozenTime} />
          </group>
        </ExplodePart>
        <ExplodePart id="markers" offset={[0, 0, 1.35]} delay={0.16} labelOffset={[-0.72, -0.3, 0]}>
          <group position={[0, 0, 0.065]}>
            <Markers spec={spec} />
          </group>
        </ExplodePart>
        <ExplodePart id="dial" offset={[0, 0, 1.0]} delay={0.2} labelOffset={[0.85, -0.3, 0]}>
          <group position={[0, 0, 0.06]}>
            <Dial spec={spec} size={lite ? 512 : 1024} />
          </group>
        </ExplodePart>
        <ExplodePart id="case" offset={[0, 0, 0.3]} delay={0.25} labelOffset={[1.15, 0.2, 0]}>
          <WatchCase shape={spec.caseShape} material={caseMat} />
        </ExplodePart>
        {movement && (
          <group position={[0, 0, 0.0]} scale={1}>
            <Movement tourbillon={!!spec.tourbillon} detail={lite ? 'low' : 'high'} motionWorks={!!explode || !!spec.skeleton} />
          </group>
        )}
        <ExplodePart id="caseback" offset={[0, 0, -2.75]} delay={0.68} labelOffset={[0.7, -0.5, 0]}>
          <group position={[0, 0, -0.17]}>
            <CaseBack material={caseMat} lite={lite} />
          </group>
        </ExplodePart>
        {strap && <Strap style={spec.strap} caseMaterial={caseMat} />}
      </group>
    </ExplodeContext.Provider>
  );
});
