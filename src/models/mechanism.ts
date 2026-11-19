/**
 * Shared mechanism clock. Every gear derives its angle from the same time
 * base and gear ratios, so meshing wheels turn at coordinated speeds.
 * The motion is illustrative: ratios are simplified for legibility.
 */
export const BEAT_HZ = 2; // visual balance frequency (real watches: 3–4 Hz)

export function balanceAngle(t: number) {
  return Math.sin(t * Math.PI * 2 * BEAT_HZ) * 2.4;
}

/** Escape wheel advances one half-tooth per balance swing, in quick steps. */
export function escapeAngle(t: number) {
  const ticks = t * BEAT_HZ * 2;
  const whole = Math.floor(ticks);
  const frac = ticks - whole;
  const ease = Math.min(1, frac * 6); // snaps quickly, then locks — the "tick"
  return -((whole + ease) * (Math.PI * 2)) / 30;
}

/** Pallet fork rocks in sync with the balance. */
export function palletAngle(t: number) {
  return Math.sign(Math.sin(t * Math.PI * 2 * BEAT_HZ)) * 0.14;
}

/** Train ratios: escape -> fourth -> third -> centre -> barrel */
export const RATIOS = { fourth: 1 / 8, third: 1 / 60, centre: 1 / 480, barrel: 1 / 3000 };

export function trainAngle(t: number, ratio: number, dir: 1 | -1) {
  return escapeAngle(t) * ratio * dir * -1 * 8; // scaled so slow wheels still visibly move
}
