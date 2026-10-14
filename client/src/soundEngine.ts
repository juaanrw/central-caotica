// Central Caótica - Synthesized Web Audio API Sound Engine
// Native synthesis without external MP3 files + navigator.vibrate

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmOsc1: OscillatorNode | null = null;
  private alarmOsc2: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private alarmInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Haptic feedback
  public vibrate(pattern: number | number[] = 50) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored on devices without vibration
      }
    }
  }

  // 1. Mechanical Button Click
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.vibrate(30);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 2. Realistic Geiger-Müller ticks
  public playGeiger(burstCount: number = 3) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < burstCount; i++) {
      const delay = Math.random() * 0.15;
      const now = ctx.currentTime + delay;

      // Noise click
      const bufferSize = ctx.sampleRate * 0.003; // 3ms click
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.003);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.003);
    }
    this.vibrate(15);
  }

  // 3. Nuclear Siren / Low Alarm Drone
  public playAlarm() {
    if (this.isMuted) return;
    if (this.alarmOsc1) return; // Already playing

    const ctx = this.getContext();
    if (!ctx) return;

    this.vibrate([150, 80, 150, 80, 200]);

    const now = ctx.currentTime;
    this.alarmGain = ctx.createGain();
    this.alarmGain.gain.setValueAtTime(0.3, now);

    this.alarmOsc1 = ctx.createOscillator();
    this.alarmOsc2 = ctx.createOscillator();

    this.alarmOsc1.type = 'sawtooth';
    this.alarmOsc2.type = 'sawtooth';

    this.alarmOsc1.frequency.setValueAtTime(220, now);
    this.alarmOsc2.frequency.setValueAtTime(224, now); // Detuned for sinister dissonance

    this.alarmOsc1.connect(this.alarmGain);
    this.alarmOsc2.connect(this.alarmGain);
    this.alarmGain.connect(ctx.destination);

    this.alarmOsc1.start();
    this.alarmOsc2.start();

    // Klaxon pitch modulation
    let isHigh = false;
    this.alarmInterval = setInterval(() => {
      if (!this.alarmOsc1 || !this.alarmOsc2 || !ctx) return;
      const t = ctx.currentTime;
      isHigh = !isHigh;
      const f1 = isHigh ? 330 : 220;
      const f2 = isHigh ? 336 : 224;
      this.alarmOsc1.frequency.exponentialRampToValueAtTime(f1, t + 0.3);
      this.alarmOsc2.frequency.exponentialRampToValueAtTime(f2, t + 0.3);
    }, 600);
  }

  public stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.alarmOsc1) {
      try {
        this.alarmOsc1.stop();
        this.alarmOsc1.disconnect();
      } catch (e) {}
      this.alarmOsc1 = null;
    }
    if (this.alarmOsc2) {
      try {
        this.alarmOsc2.stop();
        this.alarmOsc2.disconnect();
      } catch (e) {}
      this.alarmOsc2 = null;
    }
  }

  // 4. Success Fanfare (Soviet retro chime)
  public playSuccess() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.vibrate([50, 40, 90]);

    const notes = [440, 554.37, 659.25, 880]; // A major triumphant
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // 5. Error Buzzer
  public playBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.vibrate([100, 50, 100]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 6. Steam Release Hiss (for Valve release)
  public playSteam() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.3);
  }
}

export const sound = new SoundEngine();
