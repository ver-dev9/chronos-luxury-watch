/**
 * Fake volumetric light: an additive cone with a noise-modulated falloff.
 * Far cheaper than ray-marched volumetrics and art-directable.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SIMPLEX } from '../noise.glsl';

const vertex = /* glsl */ `
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
void main(){ vPos = position; vec4 wp = modelMatrix*vec4(position,1.0);
 vNormal = normalize(normalMatrix*normal); vView = normalize(-(viewMatrix*wp).xyz);
 gl_Position = projectionMatrix*viewMatrix*wp; }
`;
const fragment = /* glsl */ `
uniform float uTime; uniform float uIntensity; uniform vec3 uColor; uniform float uLength;
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
${SIMPLEX}
void main(){
  float along = clamp(0.5 - vPos.y/uLength, 0.0, 1.0);
  float rim = pow(abs(dot(vNormal, vView)), 1.6);
  float dust = 0.75 + 0.25*snoise(vec3(vPos*1.5 + vec3(0.0, uTime*0.2, 0.0)));
  float a = rim * (1.0-along) * dust * uIntensity * 0.22;
  gl_FragColor = vec4(uColor, a);
}
`;

export function VolumetricBeam({
  position = [0, 4, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
  length = 8,
  radius = 2.4,
  intensity = 1,
  color = '#e4c88d',
}) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color(color) },
      uLength: { value: length },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value += dt;
      ref.current.uniforms.uIntensity.value = intensity;
    }
  });
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[radius, length, 48, 1, true]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
