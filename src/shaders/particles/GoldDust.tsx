/**
 * GOLDEN DUST — GPU particles. Positions are animated entirely in the vertex
 * shader (curl-ish noise drift + pointer repulsion), so the CPU only updates
 * three uniforms per frame.
 */
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SIMPLEX } from '../noise.glsl';
import { scrollState } from '../../store/scrollState';

const vertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uReveal;
uniform float uFlow;
uniform vec3 uPointer;
attribute float aSeed;
attribute float aScale;
varying float vAlpha;
${SIMPLEX}
void main(){
  vec3 p = position;
  float t = uTime * 0.06;
  p += vec3(
    snoise(vec3(p.xy*0.35, t+aSeed)),
    snoise(vec3(p.yz*0.35, t+aSeed+10.0)),
    snoise(vec3(p.zx*0.35, t+aSeed+20.0))
  ) * 0.45;
  // flow mode: particles orbit the centre in a vortex (finale / assembly)
  float ang = uFlow * (uTime*0.25 + aSeed*6.28) * (1.0/(0.6+length(p.xz)*0.25));
  mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p.xz = mix(p.xz, r*p.xz, uFlow);
  // pointer repulsion
  vec3 d = p - uPointer;
  float f = smoothstep(1.6, 0.0, length(d));
  p += normalize(d + 1e-4) * f * 0.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (1.0 / -mv.z);
  float tw = 0.55 + 0.45*sin(uTime*1.7 + aSeed*40.0);
  float reveal = smoothstep(aSeed, aSeed+0.15, uReveal);
  vAlpha = tw * reveal * smoothstep(18.0, 3.0, -mv.z);
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 2.2) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * (0.6 + core*0.9), a);
}
`;

interface Props {
  count: number;
  radius?: number;
  height?: number;
  size?: number;
  /** 0..1 mutable reveal, so the dust can fade in during the intro */
  reveal?: { current: number };
  flow?: number;
  color?: string;
}

export function GoldDust({
  count,
  radius = 6,
  height = 6,
  size = 26,
  reveal,
  flow = 0,
  color = '#e4c88d',
}: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * height;
      pos[i * 3 + 2] = Math.sin(a) * r;
      seed[i] = Math.random();
      scale[i] = 0.25 + Math.pow(Math.random(), 4) * 1.8;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count, radius, height]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size * Math.min(window.devicePixelRatio, 2) },
      uReveal: { value: 1 },
      uFlow: { value: flow },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value += dt * (1 + Math.min(Math.abs(scrollState.velocity) * 0.05, 3));
    u.uReveal.value = reveal ? reveal.current * 1.2 : 1.2;
    u.uFlow.value = THREE.MathUtils.lerp(u.uFlow.value, flow, 0.05);
    // project pointer to a plane at the origin depth
    tmp.set(scrollState.pointer.x, scrollState.pointer.y, 0.5).unproject(camera);
    tmp.sub(camera.position).normalize();
    const dist = camera.position.length();
    u.uPointer.value.copy(camera.position).addScaledVector(tmp, dist);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
