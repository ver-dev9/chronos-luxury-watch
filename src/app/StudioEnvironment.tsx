/**
 * Procedural studio HDRI built from Lightformers and baked once (frames=1).
 * Provides physically plausible reflections without downloading an HDR.
 */
import { Environment, Lightformer } from '@react-three/drei';

export function StudioEnvironment({ warmth = 1 }: { warmth?: number }) {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={['#050505']} />
      <Lightformer form="rect" intensity={2.4} color="#fff3dc" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.6 * warmth} color="#f0c27a" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[1.2, 8, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[5, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[0.6, 8, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#e4c88d" position={[0, 0, -6]} scale={3} />
      <Lightformer form="rect" intensity={0.6} color="#9aa4b8" position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[6, 2, 1]} />
    </Environment>
  );
}
