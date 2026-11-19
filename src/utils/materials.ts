/**
 * Material library. Each material is a physically based preset tuned for
 * its real-world counterpart and shared across all scenes (material reuse).
 */
import * as THREE from 'three';
import { brushedRoughness, carbonTexture, genevaStripes, leatherBump } from './textures';

export type MatKey =
  | 'gold'
  | 'roseGold'
  | 'steel'
  | 'platinum'
  | 'titanium'
  | 'ceramic'
  | 'carbon'
  | 'sapphire'
  | 'sapphireLite'
  | 'leatherBlack'
  | 'leatherBrown'
  | 'rubber'
  | 'gem'
  | 'ruby'
  | 'blued'
  | 'brass'
  | 'rhodium'
  | 'plate'
  | 'lume'
  | 'darkSteel'
  | 'stitch';

const cache = new Map<string, THREE.Material>();

function make(key: MatKey): THREE.Material {
  switch (key) {
    case 'gold':
      return new THREE.MeshPhysicalMaterial({
        color: '#e9b964',
        metalness: 1,
        roughness: 0.17,
        envMapIntensity: 1.25,
        clearcoat: 0.3,
        clearcoatRoughness: 0.12,
      });
    case 'roseGold':
      return new THREE.MeshPhysicalMaterial({
        color: '#e7a98c',
        metalness: 1,
        roughness: 0.18,
        envMapIntensity: 1.2,
        clearcoat: 0.3,
      });
    case 'steel':
      return new THREE.MeshPhysicalMaterial({
        color: '#c8ccd2',
        metalness: 1,
        roughness: 0.22,
        envMapIntensity: 1.2,
        roughnessMap: brushedRoughness(),
      });
    case 'platinum':
      return new THREE.MeshPhysicalMaterial({
        color: '#dedfe3',
        metalness: 1,
        roughness: 0.13,
        envMapIntensity: 1.3,
      });
    case 'titanium':
      return new THREE.MeshPhysicalMaterial({
        color: '#8d9096',
        metalness: 1,
        roughness: 0.42,
        envMapIntensity: 1.0,
        roughnessMap: brushedRoughness(),
      });
    case 'darkSteel':
      return new THREE.MeshPhysicalMaterial({
        color: '#3a3b3f',
        metalness: 1,
        roughness: 0.32,
        envMapIntensity: 1,
      });
    case 'ceramic':
      return new THREE.MeshPhysicalMaterial({
        color: '#0c0c0e',
        metalness: 0,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.4,
      });
    case 'carbon':
      return new THREE.MeshPhysicalMaterial({
        map: carbonTexture(),
        metalness: 0.25,
        roughness: 0.38,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.1,
      });
    case 'sapphire':
      return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.15,
        ior: 1.77,
        transparent: true,
        opacity: 1,
        envMapIntensity: 1.6,
        specularIntensity: 1,
        attenuationColor: new THREE.Color('#f4f7ff'),
      });
    case 'sapphireLite':
      return new THREE.MeshPhysicalMaterial({
        color: '#dfe8ff',
        metalness: 0,
        roughness: 0.02,
        transparent: true,
        opacity: 0.12,
        envMapIntensity: 2,
        depthWrite: false,
      });
    case 'leatherBlack':
      return new THREE.MeshPhysicalMaterial({
        color: '#141210',
        roughness: 0.72,
        sheen: 0.6,
        sheenColor: new THREE.Color('#5a4a3a'),
        bumpMap: leatherBump(),
        bumpScale: 0.6,
      });
    case 'leatherBrown':
      return new THREE.MeshPhysicalMaterial({
        color: '#5a3420',
        roughness: 0.66,
        sheen: 0.7,
        sheenColor: new THREE.Color('#c08a5a'),
        bumpMap: leatherBump(),
        bumpScale: 0.6,
      });
    case 'rubber':
      return new THREE.MeshPhysicalMaterial({ color: '#121212', roughness: 0.85, metalness: 0 });
    case 'gem':
      return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 0.4,
        ior: 2.4,
        envMapIntensity: 3,
        specularIntensity: 1,
        iridescence: 0.4,
        flatShading: true,
        ...({ dispersion: 5 } as object),
      });
    case 'ruby':
      return new THREE.MeshPhysicalMaterial({
        color: '#a3122a',
        roughness: 0.05,
        metalness: 0,
        clearcoat: 1,
        emissive: '#3a0008',
        emissiveIntensity: 0.4,
      });
    case 'blued':
      return new THREE.MeshPhysicalMaterial({
        color: '#1b3d9c',
        metalness: 0.9,
        roughness: 0.28,
        envMapIntensity: 1.2,
      });
    case 'brass':
      return new THREE.MeshPhysicalMaterial({
        color: '#d4a85f',
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.1,
      });
    case 'rhodium':
      return new THREE.MeshPhysicalMaterial({
        color: '#cfd2d6',
        metalness: 1,
        roughness: 0.26,
        envMapIntensity: 1.1,
      });
    case 'plate':
      return new THREE.MeshPhysicalMaterial({
        map: genevaStripes(),
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.1,
      });
    case 'lume':
      return new THREE.MeshStandardMaterial({
        color: '#f1ead7',
        roughness: 0.6,
        emissive: '#c9e8c9',
        emissiveIntensity: 0.05,
      });
    case 'stitch':
      return new THREE.MeshStandardMaterial({ color: '#d9cbb0', roughness: 0.9 });
  }
}

export function mat(key: MatKey): THREE.Material {
  if (!cache.has(key)) cache.set(key, make(key));
  return cache.get(key)!;
}

/**
 * Materials that must change per-instance (highlight, cross-fade) are cloned
 * on demand. Callers own and dispose clones.
 */
export function matClone(key: MatKey) {
  return mat(key).clone() as THREE.MeshPhysicalMaterial;
}

export function caseMatKey(m: string): MatKey {
  const map: Record<string, MatKey> = {
    gold: 'gold',
    roseGold: 'roseGold',
    steel: 'steel',
    silver: 'steel',
    platinum: 'platinum',
    titanium: 'titanium',
    ceramic: 'ceramic',
    carbon: 'carbon',
  };
  return map[m] ?? 'gold';
}

export function disposeMaterials() {
  cache.forEach((m) => m.dispose());
  cache.clear();
}
