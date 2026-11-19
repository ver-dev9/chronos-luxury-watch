/**
 * LIQUID GOLD TRANSITION — a camera-attached veil whose molten edge is
 * carved by animated noise. Driven by a mutable 0..1 amount set from
 * ScrollTrigger at chosen chapter boundaries.
 */
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SIMPLEX } from '../noise.glsl';

export const veil = { current: 0 };

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const fragment = /* glsl */ `
uniform float uAmount;
uniform float uTime;
uniform float uAspect;
varying vec2 vUv;
${SIMPLEX}
void main(){
  vec2 uv = vUv; uv.x *= uAspect;
  float n = snoise(vec3(uv*2.2, uTime*0.15))*0.5 + snoise(vec3(uv*6.0, uTime*0.3))*0.18;
  float front = uAmount*1.6 - 0.3 + (1.0 - vUv.y)*0.25;
  float m = smoothstep(front-0.02, front+0.02, n + 0.5);
  m = 1.0 - m;
  float edge = smoothstep(0.12, 0.0, abs((n+0.5) - front));
  // molten gold: fresnel-ish sheen from noise gradients
  float sheen = 0.5 + 0.5*snoise(vec3(uv*3.0 + n, uTime*0.4));
  vec3 gold = mix(vec3(0.42,0.29,0.11), vec3(0.95,0.79,0.48), sheen);
  vec3 col = mix(vec3(0.031,0.031,0.027), gold, edge*0.9);
  float a = max(m, edge*0.95) * step(0.001, uAmount);
  gl_FragColor = vec4(col, a);
}
`;

export function LiquidGold() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const uniforms = useMemo(() => ({ uAmount: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 } }), []);
  useFrame((_, dt) => {
    if (!ref.current || !mesh.current) return;
    const v = Math.sin(Math.min(1, Math.max(0, veil.current)) * Math.PI); // in-and-out across boundary
    ref.current.uniforms.uAmount.value = v;
    ref.current.uniforms.uTime.value += dt;
    ref.current.uniforms.uAspect.value = size.width / size.height;
    mesh.current.visible = v > 0.001;
  });
  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
