/**
 * Procedural canvas textures. Generated once, cached, and shared across
 * every material that needs them — no bitmap assets ship with the site.
 */
import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

function canvas(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  return { c, ctx };
}

function finish(key: string, c: HTMLCanvasElement, srgb: boolean, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat !== 1) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  cache.set(key, t);
  return t;
}

/** Deterministic PRNG so textures are identical between sessions. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const DIAL_COLORS: Record<string, string> = {
  obsidian: '#0b0b0c',
  champagne: '#b99a62',
  ivory: '#ece4d2',
  midnight: '#0d1a33',
  emerald: '#0c3a2c',
  smoke: '#26282b',
};

export interface DialTextureOpts {
  style: 'sunburst' | 'guilloche' | 'enamel' | 'carbon' | 'skeleton';
  color: string;
  roman: boolean;
  printColor: string;
  subdials: boolean;
  size: number;
}

/** Dial albedo: finish pattern, minute track, brand print, optional roman numerals. */
export function dialTexture(o: DialTextureOpts) {
  const key = `dial:${JSON.stringify(o)}`;
  if (cache.has(key)) return cache.get(key)!;
  const S = o.size;
  const { c, ctx } = canvas(S);
  const cx = S / 2;
  const base = DIAL_COLORS[o.color] ?? o.color;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const rand = rng(7);
  const light = new THREE.Color(base).lerp(new THREE.Color('#ffffff'), 0.22).getStyle();
  const dark = new THREE.Color(base).lerp(new THREE.Color('#000000'), 0.35).getStyle();

  if (o.style === 'sunburst') {
    // radial brushing: thin rays whose brightness depends on angle -> sunburst sheen
    for (let i = 0; i < 2400; i++) {
      const a = rand() * Math.PI * 2;
      const sheen = Math.pow(Math.abs(Math.cos(a * 1 + 0.6)), 3);
      ctx.strokeStyle = sheen > 0.5 ? light : dark;
      ctx.globalAlpha = 0.05 + sheen * 0.12;
      ctx.lineWidth = 0.6 + rand() * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cx);
      ctx.lineTo(cx + Math.cos(a) * S, cx + Math.sin(a) * S);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    g.addColorStop(0, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  } else if (o.style === 'guilloche') {
    // engine-turned "clous de Paris"-like wave rings
    ctx.lineWidth = S / 900;
    for (let r = 4; r < cx; r += S / 260) {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.01) {
        const rr = r + Math.sin(a * 24 + r * 0.05) * (S / 300);
        const x = cx + Math.cos(a) * rr;
        const y = cx + Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = (Math.round(r) % 3 === 0 ? dark : light).toString();
      ctx.globalAlpha = 0.35;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (o.style === 'enamel') {
    const g = ctx.createRadialGradient(cx * 0.8, cx * 0.7, 0, cx, cx, cx);
    g.addColorStop(0, light);
    g.addColorStop(0.6, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    // stars of aventurine
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = '#e8d6a8';
      ctx.globalAlpha = rand() * 0.8;
      ctx.fillRect(rand() * S, rand() * S, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  } else if (o.style === 'carbon') {
    const cell = S / 48;
    for (let y = 0; y < 48; y++)
      for (let x = 0; x < 48; x++) {
        const twill = (x + y) % 4 < 2;
        const g = ctx.createLinearGradient(x * cell, y * cell, x * cell + (twill ? cell : 0), y * cell + (twill ? 0 : cell));
        g.addColorStop(0, '#0a0a0a');
        g.addColorStop(0.5, twill ? '#2b2b2d' : '#1a1a1c');
        g.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = g;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
  }

  // minute track
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = o.printColor;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r1 = cx * 0.93;
    const r2 = i % 5 === 0 ? cx * 0.86 : cx * 0.9;
    ctx.lineWidth = i % 5 === 0 ? S / 300 : S / 700;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * r1, cx - Math.cos(a) * r1);
    ctx.lineTo(cx + Math.sin(a) * r2, cx - Math.cos(a) * r2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // brand print
  ctx.fillStyle = o.printColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${S * 0.045}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText('C H R O N O S', cx, cx - S * 0.2);
  ctx.font = `400 ${S * 0.018}px Inter, Arial, sans-serif`;
  ctx.globalAlpha = 0.75;
  ctx.fillText('MANUFACTURE  ·  GENÈVE', cx, cx - S * 0.165);
  ctx.fillText('AUTOMATIC', cx, cx + S * 0.2);
  ctx.globalAlpha = 1;

  if (o.roman) {
    const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.font = `500 ${S * 0.06}px "Cormorant Garamond", Georgia, serif`;
    numerals.forEach((n, i) => {
      if (o.subdials && i === 6) return;
      const a = (i / 12) * Math.PI * 2;
      const r = cx * 0.72;
      ctx.save();
      ctx.translate(cx + Math.sin(a) * r, cx - Math.cos(a) * r);
      ctx.rotate(a);
      ctx.fillText(n, 0, 0);
      ctx.restore();
    });
  }
  return finish(key, c, true);
}

/** Bezel scale for tachymeter rings. */
export function tachyTexture(size = 1024) {
  const key = `tachy:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(size);
  const cx = size / 2;
  ctx.fillStyle = '#0a0a0b';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#d9d4c8';
  ctx.strokeStyle = '#d9d4c8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${size * 0.034}px Inter, Arial, sans-serif`;
  const values = [500, 400, 300, 250, 200, 180, 160, 140, 120, 110, 100, 90, 80, 70, 65, 60];
  values.forEach((v) => {
    const sec = 3600 / v;
    const a = (sec / 60) * Math.PI * 2;
    const r = cx * 0.9;
    ctx.save();
    ctx.translate(cx + Math.sin(a) * r, cx - Math.cos(a) * r);
    ctx.rotate(a);
    ctx.fillText(String(v), 0, 0);
    ctx.restore();
  });
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * cx * 0.99, cx - Math.cos(a) * cx * 0.99);
    ctx.lineTo(cx + Math.sin(a) * cx * (i % 10 === 0 ? 0.95 : 0.97), cx - Math.cos(a) * cx * (i % 10 === 0 ? 0.95 : 0.97));
    ctx.stroke();
  }
  return finish(key, c, true);
}

/** Twill carbon weave albedo (tileable). */
export function carbonTexture(size = 512) {
  const key = `carbon:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(size);
  const n = 16;
  const cell = size / n;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const twill = (x + y) % 4 < 2;
      const g = ctx.createLinearGradient(x * cell, y * cell, x * cell + (twill ? cell : 0), y * cell + (twill ? 0 : cell));
      g.addColorStop(0, '#060606');
      g.addColorStop(0.5, twill ? '#323236' : '#1c1c1f');
      g.addColorStop(1, '#060606');
      ctx.fillStyle = g;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  return finish(key, c, true, 3);
}

/** Leather grain height map used as bump. */
export function leatherBump(size = 512) {
  const key = `leather:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  const rand = rng(42);
  for (let i = 0; i < size * 9; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 1 + rand() * 3.5;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(40,40,40,0.35)' : 'rgba(200,200,200,0.25)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(key, c, false, 4);
}

/** Brushed metal roughness: fine linear streaks. */
export function brushedRoughness(size = 512) {
  const key = `brushed:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, size, size);
  const rand = rng(3);
  for (let i = 0; i < size * 2; i++) {
    const y = rand() * size;
    const v = Math.floor(90 + rand() * 90);
    ctx.strokeStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.lineWidth = rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (rand() - 0.5) * 4);
    ctx.stroke();
  }
  return finish(key, c, false, 2);
}

/** Côtes de Genève stripes for movement plates (albedo tint). */
export function genevaStripes(size = 512) {
  const key = `geneva:${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const { c, ctx } = canvas(size);
  const stripes = 9;
  const w = size / stripes;
  for (let i = 0; i < stripes; i++) {
    const g = ctx.createLinearGradient(i * w, 0, (i + 1) * w, 0);
    g.addColorStop(0, '#948d82');
    g.addColorStop(0.5, '#ece7de');
    g.addColorStop(1, '#948d82');
    ctx.fillStyle = g;
    ctx.fillRect(i * w, 0, w, size);
  }
  return finish(key, c, true);
}

export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
