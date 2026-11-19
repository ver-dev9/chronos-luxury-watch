/**
 * Procedural mechanical movement. An artistic, simplified interpretation of
 * a Swiss lever calibre: barrel, centre/third/fourth wheels, escape wheel,
 * pallet fork, balance + hairspring, bridges, jewels and screws. It is
 * decorative geometry with coordinated motion, not a functional CAD calibre.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Gear } from './Gear';
import { BalanceWheel, Hairspring } from './BalanceWheel';
import { ExplodePart } from './explode';
import { mat } from '../utils/materials';
import { bridgeGeometry, escapeWheelGeometry, mainplateGeometry, palletForkGeometry, spiralGeometry } from '../utils/geometry';
import { escapeAngle, palletAngle } from './mechanism';

export const LAYOUT = {
  centre: [0, 0] as [number, number],
  third: [0.282, 0.103] as [number, number],
  fourth: [0.36, -0.11] as [number, number],
  escape: [0.264, -0.276] as [number, number],
  pallet: [0.091, -0.376] as [number, number],
  balance: [-0.14, -0.5] as [number, number],
  barrel: [-0.25, 0.3] as [number, number],
  minute: [0.13, 0.1] as [number, number],
};

const esc = (t: number) => escapeAngle(t);
const fourth = (t: number) => -esc(t) * 0.25;
const third = (t: number) => esc(t) * 0.07;
const centre = (t: number) => -esc(t) * 0.02 - t * 0.02;
const barrel = (t: number) => esc(t) * 0.006 + t * 0.008;

interface Props {
  /** show balance inside a rotating tourbillon cage */
  tourbillon?: boolean;
  /** quality reduces sub-detail (screws, jewels) */
  detail?: 'high' | 'low';
  /** emit the motion works (hidden when a full dial covers them) */
  motionWorks?: boolean;
}

function Jewels({ points }: { points: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    points.forEach((p, i) => {
      m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(1, 1, 1));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [points]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]} material={mat('ruby')}>
      <cylinderGeometry args={[0.022, 0.022, 0.016, 16]} />
    </instancedMesh>
  );
}

function Screws({ points }: { points: [number, number, number][] }) {
  const heads = useRef<THREE.InstancedMesh>(null);
  const slots = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    points.forEach((p, i) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, (i * 1.3) % Math.PI));
      m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(1, 1, 1));
      heads.current!.setMatrixAt(i, m);
      const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, (i * 1.3) % Math.PI));
      m.compose(new THREE.Vector3(p[0], p[1], p[2] - 0.01), q2, new THREE.Vector3(1, 1, 1));
      slots.current!.setMatrixAt(i, m);
    });
    heads.current!.instanceMatrix.needsUpdate = true;
    slots.current!.instanceMatrix.needsUpdate = true;
  }, [points]);
  return (
    <group>
      <instancedMesh ref={heads} args={[undefined, undefined, points.length]} material={mat('blued')} castShadow>
        <cylinderGeometry args={[0.026, 0.026, 0.018, 20]} />
      </instancedMesh>
      <instancedMesh ref={slots} args={[undefined, undefined, points.length]}>
        <boxGeometry args={[0.044, 0.006, 0.006]} />
        <meshStandardMaterial color="#05070d" />
      </instancedMesh>
    </group>
  );
}

function EscapeWheel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = esc(s.clock.elapsedTime);
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={escapeWheelGeometry(0.1, 0.018)} material={mat('rhodium')} castShadow />
      <mesh material={mat('rhodium')}>
        <torusGeometry args={[0.052, 0.008, 6, 32]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} material={mat('rhodium')}>
          <boxGeometry args={[0.008, 0.1, 0.01]} />
        </mesh>
      ))}
    </group>
  );
}

function PalletFork({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = rotation + palletAngle(s.clock.elapsedTime);
  });
  return (
    <group ref={ref} position={position}>
      <mesh geometry={palletForkGeometry(1)} material={mat('steel')} castShadow />
      <mesh position={[-0.18, -0.03, 0.01]} material={mat('ruby')}>
        <boxGeometry args={[0.02, 0.04, 0.02]} />
      </mesh>
      <mesh position={[0.18, -0.03, 0.01]} material={mat('ruby')}>
        <boxGeometry args={[0.02, 0.04, 0.02]} />
      </mesh>
    </group>
  );
}

function Barrel({ position }: { position: [number, number, number] }) {
  const spring = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (spring.current) spring.current.rotation.z = barrel(s.clock.elapsedTime) * 3;
  });
  return (
    <group position={position}>
      <Gear teeth={90} radius={0.3} thickness={0.03} spokes={0} hole={0.04} material="brass" drive={barrel} />
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]} material={mat('rhodium')}>
        <cylinderGeometry args={[0.26, 0.26, 0.07, 64, 1, true]} />
      </mesh>
      <mesh ref={spring} position={[0, 0, -0.02]} geometry={spiralGeometry(0.05, 0.24, 9, 0.006)} material={mat('darkSteel')} />
    </group>
  );
}

function Tourbillon({ position }: { position: [number, number, number] }) {
  const cage = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (cage.current) cage.current.rotation.z = -s.clock.elapsedTime * ((Math.PI * 2) / 60) * 6;
  });
  return (
    <group position={position}>
      <group ref={cage}>
        <mesh material={mat('darkSteel')}>
          <torusGeometry args={[0.23, 0.012, 8, 64]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0.03]} material={mat('darkSteel')}>
            <boxGeometry args={[0.02, 0.46, 0.012]} />
          </mesh>
        ))}
        <BalanceWheel radius={0.12} position={[0, 0.06, 0.0]} />
        <EscapeWheel position={[0.08, -0.1, -0.02]} />
        <group scale={0.5}>
          <PalletFork position={[-0.05, -0.12, 0.02]} rotation={0.6} />
        </group>
      </group>
      <mesh position={[0, 0, -0.05]} material={mat('rhodium')} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.01, 64]} />
      </mesh>
    </group>
  );
}

export function Movement({ tourbillon = false, detail = 'high', motionWorks = true }: Props) {
  const L = LAYOUT;
  const zW = -0.035; // wheel plane
  const zB = -0.08; // bridges
  const plateHoles = useMemo<[number, number, number][]>(
    () =>
      tourbillon
        ? [[0, -0.47, 0.26], [-0.25, 0.3, 0.2], [0.3, -0.05, 0.14]]
        : [[L.balance[0], L.balance[1], 0.24], [-0.25, 0.3, 0.2], [0.33, -0.05, 0.14], [0.27, -0.29, 0.09]],
    [tourbillon, L],
  );
  const bridges = useMemo(
    () => ({
      barrel: bridgeGeometry([[-0.72, 0.15], [-0.4, 0.38], [-0.25, 0.3], [-0.05, 0.62]], 0.13, 0.03),
      train: bridgeGeometry([[0.05, 0.7], [0.28, 0.12], [0.36, -0.11], [0.62, -0.42]], 0.11, 0.03),
      cock: tourbillon
        ? bridgeGeometry([[-0.5, -0.58], [0, -0.47], [0.5, -0.58]], 0.07, 0.03)
        : bridgeGeometry([[-0.66, -0.36], [-0.4, -0.56], [L.balance[0], L.balance[1]]], 0.1, 0.03),
    }),
    [tourbillon, L],
  );

  const jewels: [number, number, number][] = [
    [L.third[0], L.third[1], zB - 0.02],
    [L.fourth[0], L.fourth[1], zB - 0.02],
    [L.escape[0], L.escape[1], zB - 0.02],
    [L.barrel[0], L.barrel[1], zB - 0.02],
    [-0.05, 0.4, zB - 0.02],
    [0.48, -0.25, zB - 0.02],
  ];
  if (!tourbillon) jewels.push([L.balance[0], L.balance[1], zB - 0.02]);
  const screws: [number, number, number][] = [
    [-0.66, 0.18, zB - 0.025],
    [-0.08, 0.6, zB - 0.025],
    [0.08, 0.66, zB - 0.025],
    [0.6, -0.4, zB - 0.025],
    [-0.62, -0.38, zB - 0.025],
    [-0.42, 0.36, zB - 0.025],
    [0.45, 0.45, 0.012],
    [-0.5, -0.1, 0.012],
  ];

  return (
    <group>
      <ExplodePart id="plates" offset={[0, 0, -0.45]} delay={0.38} labelOffset={[-0.85, 0.3, 0]}>
        <mesh geometry={mainplateGeometry(0.8, 0.03, plateHoles)} material={mat('plate')} receiveShadow castShadow />
      </ExplodePart>

      {motionWorks && (
        <ExplodePart id="motionWorks" offset={[0.55, 0.45, 0.7]} delay={0.28} spin={0.6} labelOffset={[0.25, 0.25, 0]}>
          <Gear teeth={40} radius={0.12} thickness={0.015} spokes={4} position={[0, 0, 0.035]} material="brass" drive={(t) => t * 0.1} />
          <Gear teeth={30} radius={0.09} thickness={0.015} spokes={0} position={[L.minute[0], L.minute[1], 0.03]} material="rhodium" drive={(t) => -t * 0.13} />
        </ExplodePart>
      )}

      <ExplodePart id="barrel" offset={[-0.55, 0.65, -0.95]} delay={0.42} tilt={0.25} labelOffset={[-0.3, 0.35, 0]}>
        <Barrel position={[L.barrel[0], L.barrel[1], zW]} />
      </ExplodePart>

      <ExplodePart id="gearTrain" offset={[0.75, 0.25, -0.95]} delay={0.45} tilt={-0.2} labelOffset={[0.55, 0.25, 0]}>
        <Gear teeth={80} radius={0.26} thickness={0.022} spokes={5} position={[0, 0, zW - 0.012]} material="brass" drive={centre} pinion={12} />
        <Gear teeth={70} radius={0.19} thickness={0.02} spokes={5} position={[L.third[0], L.third[1], zW + 0.006]} material="brass" drive={third} pinion={10} />
        <Gear teeth={64} radius={0.17} thickness={0.02} spokes={4} position={[L.fourth[0], L.fourth[1], zW - 0.004]} material="brass" drive={fourth} pinion={8} />
      </ExplodePart>

      {!tourbillon && (
        <>
          <ExplodePart id="escapement" offset={[0.55, -0.85, -1.15]} delay={0.5} labelOffset={[0.3, -0.35, 0]}>
            <EscapeWheel position={[L.escape[0], L.escape[1], zW]} />
            <PalletFork position={[L.pallet[0], L.pallet[1], zW + 0.01]} rotation={-1.0} />
          </ExplodePart>
          <ExplodePart id="balance" offset={[-0.65, -0.75, -1.3]} delay={0.55} labelOffset={[-0.2, -0.32, 0]}>
            <BalanceWheel radius={0.2} position={[L.balance[0], L.balance[1], zW - 0.01]} spring={false} />
          </ExplodePart>
          <ExplodePart id="hairspring" offset={[-0.65, -0.75, -1.65]} delay={0.6} labelOffset={[-0.2, -0.32, 0]}>
            <Hairspring radius={0.2} position={[L.balance[0], L.balance[1], zW - 0.03]} />
          </ExplodePart>
        </>
      )}
      {tourbillon && (
        <ExplodePart id="balance" offset={[0, -0.6, -1.2]} delay={0.55}>
          <Tourbillon position={[0, -0.47, zW]} />
        </ExplodePart>
      )}

      <ExplodePart id="plates" offset={[0, 0, -1.95]} delay={0.6} label={false}>
        <mesh position={[0, 0, zB]} geometry={bridges.barrel} material={mat('plate')} castShadow />
        <mesh position={[0, 0, zB]} geometry={bridges.train} material={mat('plate')} castShadow />
        <mesh position={[0, 0, zB]} geometry={bridges.cock} material={mat('plate')} castShadow />
        {detail === 'high' && <Jewels points={jewels} />}
      </ExplodePart>

      {detail === 'high' && (
        <ExplodePart id="screws" offset={[0, 0, -2.3]} delay={0.66} labelOffset={[0.6, -0.4, 0]}>
          <Screws points={screws} />
        </ExplodePart>
      )}
    </group>
  );
}
