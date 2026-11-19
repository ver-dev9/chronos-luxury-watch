/**
 * Generative sound: a warm low drone and a soft escapement tick, synthesised
 * with WebAudio (no audio files, no licensing). Muted until the visitor opts in.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private tickTimer: number | null = null;
  private nodes: AudioNode[] = [];

  async enable() {
    if (!this.ctx) this.build();
    await this.ctx!.resume();
    this.master!.gain.cancelScheduledValues(this.ctx!.currentTime);
    this.master!.gain.linearRampToValueAtTime(0.5, this.ctx!.currentTime + 1.5);
    if (this.tickTimer == null) this.tickTimer = window.setInterval(() => this.tick(), 250);
  }

  disable() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    if (this.tickTimer != null) clearInterval(this.tickTimer);
    this.tickTimer = null;
  }

  private build() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.connect(master);
    [55, 82.5, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 1 ? 'triangle' : 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.06 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lg = ctx.createGain();
      lg.gain.value = 0.03 / (i + 1);
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(filter);
      o.start();
      lfo.start();
      this.nodes.push(o, lfo);
    });
  }

  private tick() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 0.02);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200 + Math.random() * 600;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.value = 0.18;
    src.connect(bp).connect(g).connect(this.master);
    src.start();
  }
}

export const sound = new SoundEngine();
