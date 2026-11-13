import { SoundMaterial } from './types';

// F Major 9 / D Minor 9 calm pentatonic pitch palette (Hz)
const PENTATONIC_HIGH = [349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0];

interface ChordVoicing {
  bass: number;
  pianoNotes: number[];
  kalimbaNotes: number[];
}

const CHORD_CYCLE: ChordVoicing[] = [
  // Fmaj9
  {
    bass: 174.61,
    pianoNotes: [261.63, 329.63, 392.0, 440.0],
    kalimbaNotes: [523.25, 659.25, 698.46, 783.99, 880.0],
  },
  // Dm9
  {
    bass: 146.83,
    pianoNotes: [220.0, 261.63, 329.63, 349.23],
    kalimbaNotes: [440.0, 523.25, 659.25, 698.46, 880.0],
  },
  // Bbmaj7
  {
    bass: 116.54,
    pianoNotes: [233.08, 293.66, 349.23, 440.0],
    kalimbaNotes: [466.16, 587.33, 698.46, 783.99, 880.0],
  },
  // C6sus4 -> C6
  {
    bass: 130.81,
    pianoNotes: [261.63, 293.66, 392.0, 440.0],
    kalimbaNotes: [523.25, 587.33, 659.25, 783.99, 880.0],
  },
];

export class AdaptiveAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private isMuted = false;
  private isRunning = false;
  private energy = 0; // 0 (calm idle) -> 1 (active physics cascade)
  private complexity = 0; // 0..1 based on level progression
  private chordIndex = 0;
  private stepCount = 0;
  private nextNoteTime = 0;
  private nextPadTime = 0;
  private schedulerTimer: number | null = null;
  private lastImpactTime = 0;

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.72, now, 0.08);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.72;
      this.masterGain.connect(this.ctx.destination);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 1800;
      this.filterNode.Q.value = 0.5;

      // Gentle room echo delay network
      const delayL = this.ctx.createDelay(1.0);
      delayL.delayTime.value = 0.32;
      const delayR = this.ctx.createDelay(1.0);
      delayR.delayTime.value = 0.47;

      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.28;

      const echoFilter = this.ctx.createBiquadFilter();
      echoFilter.type = 'lowpass';
      echoFilter.frequency.value = 1100;

      const wetGain = this.ctx.createGain();
      wetGain.gain.value = 0.26;

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.52;

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.65;

      this.musicBus.connect(this.filterNode);
      this.sfxBus.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);

      // Delay loop
      this.filterNode.connect(delayL);
      delayL.connect(echoFilter);
      echoFilter.connect(delayR);
      delayR.connect(feedback);
      feedback.connect(delayL);
      echoFilter.connect(wetGain);
      wetGain.connect(this.masterGain);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (!this.isRunning && this.ctx) {
      this.isRunning = true;
      this.nextNoteTime = this.ctx.currentTime + 0.15;
      this.nextPadTime = this.ctx.currentTime + 0.05;
      this.schedulerTimer = window.setInterval(() => this.tickScheduler(), 110);
    }
  }

  public setComplexity(levelIndex: number) {
    this.complexity = Math.max(0, Math.min(1, (levelIndex - 1) / 11));
  }

  public updateEnergy(kineticEnergy: number) {
    const target = Math.max(0, Math.min(1, kineticEnergy));
    this.energy = this.energy * 0.9 + target * 0.1;

    if (this.filterNode && this.ctx) {
      // Gently open lowpass filter when scene is alive with motion
      const cutoff = 1350 + this.energy * 1450 + this.complexity * 350;
      this.filterNode.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.25);
    }
  }

  public boostEnergy(amount = 0.35) {
    this.energy = Math.min(1, this.energy + amount);
  }

  private tickScheduler() {
    if (!this.ctx || this.ctx.state !== 'running' || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Warm pad every ~6.4 seconds
    if (now >= this.nextPadTime - 0.1) {
      const chord = CHORD_CYCLE[this.chordIndex];
      this.playPadNote(chord.bass, this.nextPadTime, 6.2, 0.065);
      this.playPadNote(chord.pianoNotes[0], this.nextPadTime, 5.8, 0.032);
      this.nextPadTime = Math.max(now, this.nextPadTime) + 6.0;
    }

    // Adaptive step interval: calm 1.45s when idle, flowing 0.48s when active
    const stepDuration = 1.38 - this.energy * 0.72 - this.complexity * 0.16;

    while (this.nextNoteTime < now + 0.25) {
      const chord = CHORD_CYCLE[this.chordIndex];
      const beat = this.stepCount % 8;

      // Felt Piano pattern
      if (beat === 0 || beat === 3 || beat === 5 || (this.energy > 0.35 && beat === 7)) {
        const noteIdx = (beat + Math.floor(this.stepCount / 8)) % chord.pianoNotes.length;
        const vel = 0.09 + this.energy * 0.04;
        this.playFeltPiano(chord.pianoNotes[noteIdx], this.nextNoteTime, vel);
      }

      // Soft bass anchor on beat 0 and 4
      if (beat === 0 || (this.energy > 0.25 && beat === 4)) {
        this.playFeltPiano(chord.bass, this.nextNoteTime, 0.075);
      }

      // Kalimba Zen layer kicks in gently with motion or higher level complexity
      const kalimbaChance = 0.22 + this.energy * 0.58 + this.complexity * 0.2;
      if (beat % 2 === 1 && Math.random() < kalimbaChance) {
        const kIdx = (beat * 2 + this.chordIndex) % chord.kalimbaNotes.length;
        this.playKalimba(chord.kalimbaNotes[kIdx], this.nextNoteTime + 0.03, 0.06 + this.energy * 0.045);
      }

      this.stepCount++;
      if (this.stepCount % 8 === 0) {
        this.chordIndex = (this.chordIndex + 1) % CHORD_CYCLE.length;
      }

      this.nextNoteTime += Math.max(0.42, stepDuration);
    }
  }

  private playPadNote(freq: number, time: number, duration: number, gainPeak: number) {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainPeak, time + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playFeltPiano(freq: number, time: number, gainPeak: number) {
    if (!this.ctx || !this.musicBus) return;
    // Fundamental warm triangle + soft 2nd harmonic sine
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const toneFilter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.16;

    toneFilter.type = 'lowpass';
    toneFilter.frequency.setValueAtTime(freq * 3.2, time);
    toneFilter.frequency.exponentialRampToValueAtTime(freq * 1.4, time + 1.2);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainPeak, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.4);

    osc1.connect(toneFilter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(toneFilter);
    toneFilter.connect(gain);
    gain.connect(this.musicBus);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 2.5);
    osc2.stop(time + 2.5);
  }

  private playKalimba(freq: number, time: number, gainPeak: number) {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const tine = this.ctx.createOscillator();
    const tineGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Metallic/wooden tine transient
    tine.type = 'sine';
    tine.frequency.setValueAtTime(freq * 2.75, time);
    tineGain.gain.setValueAtTime(gainPeak * 0.35, time);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(gainPeak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.95);

    osc.connect(gain);
    tine.connect(tineGain);
    tineGain.connect(gain);
    gain.connect(this.musicBus);

    osc.start(time);
    tine.start(time);
    osc.stop(time + 1.0);
    tine.stop(time + 0.12);
  }

  public playTap(pitchIndex = 0) {
    this.unlock();
    this.boostEnergy(0.28);
    if (!this.ctx || !this.sfxBus || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chord = CHORD_CYCLE[this.chordIndex];
    const freq = chord.kalimbaNotes[Math.abs(pitchIndex) % chord.kalimbaNotes.length];
    this.playKalimba(freq, now, 0.16);
  }

  public playImpact(material: SoundMaterial, impactSpeed: number) {
    if (!this.ctx || !this.sfxBus || this.isMuted) return;
    const nowMs = performance.now();
    if (nowMs - this.lastImpactTime < 55) return;
    if (impactSpeed < 35) return;
    this.lastImpactTime = nowMs;

    const now = this.ctx.currentTime;
    const intensity = Math.min(1, impactSpeed / 360);

    if (material === 'water') {
      // Soft water plop (ascending pitch bubble)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const base = 320 + Math.random() * 110;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.85, now + 0.09);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11 * intensity + 0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now);
      osc.stop(now + 0.16);
      return;
    }

    if (material === 'bell') {
      this.playBellChime();
      return;
    }

    if (material === 'spring') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.14);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now);
      osc.stop(now + 0.3);
      return;
    }

    if (material === 'ceramic' || material === 'glass') {
      const freq = PENTATONIC_HIGH[Math.floor(Math.random() * 4) + 3];
      this.playKalimba(freq, now, 0.04 + intensity * 0.09);
      return;
    }

    // Wood / soft thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = material === 'soft' ? 140 : 185 + Math.random() * 45;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.07);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.03 + intensity * 0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playBellChime() {
    this.unlock();
    if (!this.ctx || !this.sfxBus || this.isMuted) return;
    const now = this.ctx.currentTime;
    [698.46, 1046.5, 1396.91].forEach((freq, i) => {
      if (!this.ctx || !this.sfxBus) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11 / (i + 1), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 - i * 0.3);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now);
      osc.stop(now + 1.9);
    });
  }

  public playLevelSolved() {
    this.unlock();
    if (!this.ctx || !this.sfxBus || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [349.23, 440.0, 523.25, 659.25, 783.99, 880.0];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.09;
      this.playKalimba(freq, t, 0.11);
      if (idx % 2 === 0) {
        this.playFeltPiano(freq * 0.5, t, 0.07);
      }
    });
  }

  public destroy() {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.isRunning = false;
  }
}

export const audioEngine = new AdaptiveAudioEngine();
