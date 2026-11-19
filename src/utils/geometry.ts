/**
 * Procedural, cached geometry for every mechanical and case component.
 * All parts lie in the XY plane facing +Z (the dial side), 1 unit ≈ 20 mm.
 */
import * as THREE from 'three';

const cache = new Map<string, THREE.BufferGeometry>();
function cached<T extends THREE.BufferGeometry>(key: string, build: () => T): T {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key) as T;
}

function circlePath(r: number, segments = 64, reverse = false) {
  const p = new THREE.Path();
  for (let i = 0; i <= segments; i++) {
    const a = (reverse ? -1 : 1) * (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

export interface GearOpts {
  teeth: number;
  radius: number;
  thickness: number;
  spokes?: number;
  hole?: number;
  toothDepth?: number;
}

/** Involute-approximated spur gear with spoked web, extruded along Z. */
export function gearGeometry({ teeth, radius, thickness, spokes = 5, hole = 0.06, toothDepth }: GearOpts) {
  const key = `gear:${teeth}:${radius}:${thickness}:${spokes}:${hole}:${toothDepth}`;
  return cached(key, () => {
    const depth = toothDepth ?? Math.min(radius * 0.12, (Math.PI * 2 * radius) / teeth / 1.6);
    const root = radius - depth;
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const pts: [number, number][] = [
        [root, a],
        [root, a + step * 0.12],
        [radius, a + step * 0.3],
        [radius, a + step * 0.5],
        [root, a + step * 0.68],
      ];
      pts.forEach(([r, ang], j) => {
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0 && j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    }
    shape.closePath();
    if (spokes > 0 && root > 0.12) {
      const inner = root * 0.82;
      const hub = Math.max(hole * 2.2, root * 0.24);
      const gap = (Math.PI * 2) / spokes;
      const spokeW = Math.min(0.35, (0.18 * radius) / Math.max(hub, 0.05)) * gap * 0.5;
      for (let s = 0; s < spokes; s++) {
        const a0 = s * gap + spokeW;
        const a1 = (s + 1) * gap - spokeW;
        const path = new THREE.Path();
        const seg = 12;
        for (let k = 0; k <= seg; k++) {
          const a = a0 + ((a1 - a0) * k) / seg;
          const x = Math.cos(a) * inner;
          const y = Math.sin(a) * inner;
          if (k === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        for (let k = seg; k >= 0; k--) {
          const a = a0 + ((a1 - a0) * k) / seg;
          path.lineTo(Math.cos(a) * hub, Math.sin(a) * hub);
        }
        path.closePath();
        shape.holes.push(path);
      }
    }
    if (hole > 0) shape.holes.push(circlePath(hole, 24, true));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: thickness * 0.12,
      bevelSize: Math.min(0.006, depth * 0.15),
      bevelSegments: 1,
      curveSegments: 6,
    });
    g.translate(0, 0, -thickness / 2);
    g.computeVertexNormals();
    return g;
  });
}

/** Swiss-lever escape wheel: club-shaped, hooked teeth. */
export function escapeWheelGeometry(radius: number, thickness: number) {
  return cached(`escape:${radius}:${thickness}`, () => {
    const teeth = 15;
    const shape = new THREE.Shape();
    const root = radius * 0.72;
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const p = [
        [root, a],
        [radius, a + step * 0.42],
        [radius * 0.97, a + step * 0.55],
        [root, a + step * 0.45],
      ];
      p.forEach(([r, ang], j) => {
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0 && j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    }
    shape.closePath();
    shape.holes.push(circlePath(root * 0.75, 40, true));
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, -thickness / 2);
    return g;
  });
}

/** Annulus extrusion, optionally scalloped (fluted bezel) or polygonal (octagon). */
export function ringGeometry(
  outer: number,
  inner: number,
  depth: number,
  opts: { flutes?: number; sides?: number; bevel?: number } = {},
) {
  const key = `ring:${outer}:${inner}:${depth}:${JSON.stringify(opts)}`;
  return cached(key, () => {
    const shape = new THREE.Shape();
    const seg = opts.sides ?? (opts.flutes ? opts.flutes * 8 : 128);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2 + (opts.sides ? Math.PI / opts.sides : 0);
      let r = outer;
      if (opts.flutes) r = outer - Math.pow(Math.abs(Math.sin((a * opts.flutes) / 2)), 0.6) * outer * 0.035;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.holes.push(circlePath(inner, 128, true));
    const b = opts.bevel ?? depth * 0.35;
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: b > 0,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 4,
      curveSegments: 32,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  });
}

/** Round case middle via lathe: a softly curved flank, rotated so the axis is Z. */
export function roundCaseGeometry(radius: number, height: number) {
  return cached(`roundcase:${radius}:${height}`, () => {
    const pts: THREE.Vector2[] = [];
    const h = height / 2;
    pts.push(new THREE.Vector2(radius * 0.8, -h));
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = -h + t * height;
      const bulge = Math.sin(t * Math.PI) * radius * 0.05;
      pts.push(new THREE.Vector2(radius * 0.96 + bulge, y));
    }
    pts.push(new THREE.Vector2(radius * 0.88, h));
    const g = new THREE.LatheGeometry(pts, 128);
    g.rotateX(Math.PI / 2);
    return g;
  });
}

export function shapedCaseGeometry(kind: 'octagon' | 'cushion', radius: number, height: number) {
  return cached(`case:${kind}:${radius}:${height}`, () => {
    const shape = new THREE.Shape();
    if (kind === 'octagon') {
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const x = Math.cos(a) * radius * 1.05;
        const y = Math.sin(a) * radius * 1.05;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
    } else {
      // cushion: superellipse
      const n = 4;
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * radius * 1.0;
        const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * radius * 1.0;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
    }
    const b = height * 0.3;
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: height - b * 2,
      bevelEnabled: true,
      bevelSize: b,
      bevelThickness: b,
      bevelSegments: 5,
    });
    g.translate(0, 0, -(height - b * 2) / 2);
    g.computeVertexNormals();
    return g;
  });
}

export type HandKind = 'dauphine' | 'baton' | 'leaf' | 'sword' | 'needle';

/** Flat watch hand pointing +Y from origin with a pivot boss. */
export function handGeometry(kind: HandKind, length: number, width: number) {
  return cached(`hand:${kind}:${length}:${width}`, () => {
    const s = new THREE.Shape();
    const w = width / 2;
    const tail = length * 0.18;
    switch (kind) {
      case 'dauphine':
        s.moveTo(0, -tail);
        s.lineTo(w * 1.1, length * 0.12);
        s.lineTo(0, length);
        s.lineTo(-w * 1.1, length * 0.12);
        break;
      case 'baton':
        s.moveTo(-w * 0.55, -tail);
        s.lineTo(w * 0.55, -tail);
        s.lineTo(w * 0.55, length);
        s.lineTo(-w * 0.55, length);
        break;
      case 'leaf':
        s.moveTo(0, -tail);
        s.quadraticCurveTo(w * 1.6, length * 0.45, 0, length);
        s.quadraticCurveTo(-w * 1.6, length * 0.45, 0, -tail);
        break;
      case 'sword':
        s.moveTo(-w * 0.35, -tail);
        s.lineTo(w * 0.35, -tail);
        s.lineTo(w * 0.8, length * 0.82);
        s.lineTo(0, length);
        s.lineTo(-w * 0.8, length * 0.82);
        break;
      case 'needle':
        s.moveTo(-w * 0.25, -tail * 1.6);
        s.lineTo(w * 0.25, -tail * 1.6);
        s.lineTo(w * 0.12, length);
        s.lineTo(-w * 0.12, length);
        break;
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.008,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: Math.min(0.004, w * 0.2),
      bevelSegments: 2,
      curveSegments: 16,
    });
    g.computeVertexNormals();
    return g;
  });
}

/** Pallet fork: lever with two pallet stones and a fork. */
export function palletForkGeometry(scale = 1) {
  return cached(`pallet:${scale}`, () => {
    const s = new THREE.Shape();
    const k = scale;
    s.moveTo(-0.16 * k, 0.02 * k);
    s.lineTo(-0.2 * k, -0.04 * k);
    s.lineTo(-0.05 * k, -0.01 * k);
    s.lineTo(0, -0.24 * k);
    s.lineTo(0.03 * k, -0.24 * k);
    s.lineTo(0.02 * k, -0.01 * k);
    s.lineTo(0.2 * k, -0.04 * k);
    s.lineTo(0.16 * k, 0.02 * k);
    s.lineTo(0, 0.05 * k);
    s.closePath();
    s.holes.push(circlePath(0.012 * k, 16, true));
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSize: 0.003,
      bevelThickness: 0.003,
      bevelSegments: 1,
    });
    g.translate(0, 0, -0.01);
    return g;
  });
}

/** A movement bridge: a curved arm with rounded ends between two points. */
export function bridgeGeometry(points: [number, number][], width: number, depth: number) {
  return cached(`bridge:${JSON.stringify(points)}:${width}:${depth}`, () => {
    const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const samples = curve.getSpacedPoints(48);
    const left: THREE.Vector2[] = [];
    const right: THREE.Vector2[] = [];
    samples.forEach((p, i) => {
      const n = samples[Math.min(i + 1, samples.length - 1)]
        .clone()
        .sub(samples[Math.max(i - 1, 0)])
        .normalize();
      const perp = new THREE.Vector2(-n.y, n.x).multiplyScalar(width / 2);
      left.push(p.clone().add(perp));
      right.push(p.clone().sub(perp));
    });
    const shape = new THREE.Shape([...left, ...right.reverse()]);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.008,
      bevelSegments: 2,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  });
}

/** Mainplate: a disc with cut-outs where the train sits. */
export function mainplateGeometry(radius: number, depth: number, holes: [number, number, number][]) {
  return cached(`plate:${radius}:${depth}:${JSON.stringify(holes)}`, () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    holes.forEach(([x, y, r]) => {
      const p = new THREE.Path();
      p.absarc(x, y, r, 0, Math.PI * 2, true);
      shape.holes.push(p);
    });
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 2,
      curveSegments: 48,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  });
}

/** Flat Archimedean spiral (hairspring / mainspring) as a thin tube. */
export function spiralGeometry(inner: number, outer: number, turns: number, tube: number) {
  return cached(`spiral:${inner}:${outer}:${turns}:${tube}`, () => {
    const pts: THREE.Vector3[] = [];
    const n = Math.floor(turns * 80);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t * turns * Math.PI * 2;
      const r = inner + (outer - inner) * t;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, n, tube, 4, false);
  });
}

/**
 * Strap half: a rectangular profile swept along a path that leaves the lug,
 * runs away from the case and curls back under the wrist.
 */
export function strapGeometry(dir: 1 | -1, width: number, thickness: number, length: number, taper = 0.82) {
  return cached(`strap:${dir}:${width}:${thickness}:${length}:${taper}`, () => {
    const pts: THREE.Vector3[] = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      // straight section then curl backwards (-Z)
      const ang = Math.max(0, t - 0.25) * 1.9;
      const y = dir * (Math.sin(ang) * length * 0.55 + Math.min(t, 0.25) * length * 1.0);
      const z = -(1 - Math.cos(ang)) * length * 0.55;
      pts.push(new THREE.Vector3(0, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const segs = 80;
    const frames = curve.computeFrenetFrames(segs, false);
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const profile = (t: number) => {
      const w = (width / 2) * (1 - (1 - taper) * t);
      const h = thickness / 2;
      return [
        [-w, h],
        [w, h],
        [w, -h],
        [-w, -h],
      ];
    };
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      // side vector is always X; up = tangent x X
      const side = new THREE.Vector3(1, 0, 0);
      const up = new THREE.Vector3().crossVectors(tangent, side).normalize();
      void frames;
      const prof = profile(t);
      for (let k = 0; k < 4; k++) {
        const [sx, sy] = prof[k];
        const v = p.clone().addScaledVector(side, sx).addScaledVector(up, sy);
        positions.push(v.x, v.y, v.z);
        const nrm = k < 2 ? up.clone() : up.clone().negate();
        normals.push(nrm.x, nrm.y, nrm.z);
        uvs.push(k % 3 === 0 ? 0 : 1, t * 4);
      }
    }
    for (let i = 0; i < segs; i++) {
      for (let k = 0; k < 4; k++) {
        const a = i * 4 + k;
        const b = i * 4 + ((k + 1) % 4);
        const c = (i + 1) * 4 + k;
        const d = (i + 1) * 4 + ((k + 1) % 4);
        if (dir > 0) indices.push(a, c, b, b, c, d);
        else indices.push(a, b, c, b, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  });
}

/** Sample points along the same strap path for bracelet links. */
export function strapPath(dir: 1 | -1, length: number) {
  const pts: THREE.Vector3[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = Math.max(0, t - 0.25) * 1.9;
    const y = dir * (Math.sin(ang) * length * 0.55 + Math.min(t, 0.25) * length * 1.0);
    const z = -(1 - Math.cos(ang)) * length * 0.55;
    pts.push(new THREE.Vector3(0, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export function disposeGeometries() {
  cache.forEach((g) => g.dispose());
  cache.clear();
}
