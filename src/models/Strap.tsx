import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { StrapStyle } from '../data/watches';
import { strapGeometry, strapPath } from '../utils/geometry';
import { mat, type MatKey } from '../utils/materials';
import { ExplodePart } from './explode';

const LEN = 1.7;
const WIDTH = 0.9;

function Links({ dir, material, center }: { dir: 1 | -1; material: THREE.Material; center: THREE.Material }) {
  const outer = useRef<THREE.InstancedMesh>(null);
  const mid = useRef<THREE.InstancedMesh>(null);
  const curve = useMemo(() => strapPath(dir, LEN), [dir]);
  const count = 16;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const up = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(1, 0, 0);
      up.crossVectors(tan, side).normalize();
      const basis = new THREE.Matrix4().makeBasis(side, tan, up);
      const q = new THREE.Quaternion().setFromRotationMatrix(basis);
      const w = 1 - 0.18 * t;
      m.compose(p, q, new THREE.Vector3(w, 1, 1));
      outer.current!.setMatrixAt(i, m);
      m.compose(p.clone().addScaledVector(up, 0.012), q, new THREE.Vector3(w, 1, 1));
      mid.current!.setMatrixAt(i, m);
    }
    outer.current!.instanceMatrix.needsUpdate = true;
    mid.current!.instanceMatrix.needsUpdate = true;
  }, [curve]);
  return (
    <group>
      <instancedMesh ref={outer} args={[undefined, undefined, count]} material={material}>
        <boxGeometry args={[WIDTH, 0.095, 0.075]} />
      </instancedMesh>
      <instancedMesh ref={mid} args={[undefined, undefined, count]} material={center}>
        <boxGeometry args={[WIDTH * 0.36, 0.1, 0.075]} />
      </instancedMesh>
    </group>
  );
}

function Buckle({ material }: { material: THREE.Material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.42;
    const h = 0.17;
    s.moveTo(-w, -h);
    s.lineTo(w, -h);
    s.quadraticCurveTo(w + 0.08, 0, w, h);
    s.lineTo(-w, h);
    s.quadraticCurveTo(-w - 0.08, 0, -w, -h);
    const hole = new THREE.Path();
    hole.moveTo(-w + 0.06, -h + 0.05);
    hole.lineTo(-w + 0.06, h - 0.05);
    hole.lineTo(w - 0.06, h - 0.05);
    hole.lineTo(w - 0.06, -h + 0.05);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 3,
    });
    g.translate(0, 0, -0.02);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={material} />
      <mesh position={[0, 0, 0.03]} material={material}>
        <boxGeometry args={[0.035, 0.32, 0.03]} />
      </mesh>
    </group>
  );
}

export function Strap({ style, caseMaterial }: { style: StrapStyle; caseMaterial: THREE.Material }) {
  const isLink = style === 'bracelet' || style === 'titaniumLink';
  const strapMat: MatKey =
    style === 'leatherBrown' ? 'leatherBrown' : style === 'rubber' ? 'rubber' : 'leatherBlack';
  const linkMat = style === 'titaniumLink' ? mat('titanium') : mat('steel');
  const linkCenter = style === 'titaniumLink' ? mat('darkSteel') : caseMaterial;
  const geoTop = useMemo(() => strapGeometry(1, WIDTH, 0.07, LEN), []);
  const geoBottom = useMemo(() => strapGeometry(-1, WIDTH, 0.07, LEN), []);
  const end = useMemo(() => strapPath(-1, LEN).getPointAt(0.97), []);
  const endTan = useMemo(() => strapPath(-1, LEN).getTangentAt(0.97), []);
  const buckleRot = Math.atan2(endTan.z, -endTan.y);

  return (
    <group>
      <ExplodePart id="strap" offset={[0, 1.1, -0.35]} delay={0.3} labelOffset={[0.55, 1.2, -0.3]}>
        <group position={[0, 1.05, -0.08]}>
          {isLink ? (
            <Links dir={1} material={linkMat} center={linkCenter} />
          ) : (
            <mesh geometry={geoTop} material={mat(strapMat)} />
          )}
        </group>
      </ExplodePart>
      <ExplodePart id="strap" offset={[0, -1.1, -0.35]} delay={0.3} label={false}>
        <group position={[0, -1.05, -0.08]}>
          {isLink ? (
            <Links dir={-1} material={linkMat} center={linkCenter} />
          ) : (
            <mesh geometry={geoBottom} material={mat(strapMat)} />
          )}
        </group>
      </ExplodePart>
      {!isLink && (
        <ExplodePart id="buckle" offset={[0, -1.7, -0.9]} delay={0.34} labelOffset={[0.5, 0, 0]}>
          <group position={[end.x, end.y - 1.05, end.z - 0.08]} rotation={[buckleRot - Math.PI / 2, 0, 0]}>
            <Buckle material={caseMaterial} />
          </group>
        </ExplodePart>
      )}
    </group>
  );
}
