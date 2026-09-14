/**
 * Procedural WebAudio. No-op when headless or when AudioContext is missing.
 */
export class AudioSys {
  constructor({ headless = false } = {}) {
    this.headless = headless;
    this.ctx = null;
  }

  resume() {
    if (this.headless) return;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") {
      this.ctx.resume?.();
    }
  }

  beep({ freq = 880, freqEnd = 1320, dur = 0.08, type = "sine", gain = 0.08 } = {}) {
    if (this.headless || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }

  pickup() {
    this.beep({ freq: 880, freqEnd: 1320, dur: 0.08, type: "triangle" });
  }

  hit() {
    this.beep({ freq: 120, freqEnd: 60, dur: 0.1, type: "square", gain: 0.06 });
  }

  win() {
    this.beep({ freq: 523, freqEnd: 784, dur: 0.18, type: "sine", gain: 0.07 });
  }

  lose() {
    this.beep({ freq: 240, freqEnd: 60, dur: 0.3, type: "sawtooth", gain: 0.06 });
  }
}
