// Web Audio API Synthesizer Engine for Harmoniq

export type InstrumentType = 'piano' | 'rhodes' | 'guitar' | 'synth';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: { stop: () => void }[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public noteToMidi(note: string, octave: number = 4): number {
    const noteMap: Record<string, number> = {
      C: 0,
      'C#': 1,
      Db: 1,
      D: 2,
      'D#': 3,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      Gb: 6,
      G: 7,
      'G#': 8,
      Ab: 8,
      A: 9,
      'A#': 10,
      Bb: 10,
      B: 11,
    };
    const semitone = noteMap[note] ?? 0;
    return (octave + 1) * 12 + semitone;
  }

  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  public playNote(
    note: string,
    octave: number = 4,
    durationSec: number = 1.2,
    instrument: InstrumentType = 'piano',
    velocity: number = 0.8
  ) {
    try {
      const ctx = this.getContext();
      const midi = this.noteToMidi(note, octave);
      const freq = this.midiToFreq(midi);
      const now = ctx.currentTime;

      const voiceGain = ctx.createGain();
      voiceGain.connect(this.masterGain!);

      // Sound design per instrument
      if (instrument === 'piano') {
        // Fundamental
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);

        // 2nd harmonic (warmth)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);

        // Chime overtone
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, now);

        const subGain1 = ctx.createGain();
        subGain1.gain.setValueAtTime(0.7 * velocity, now);

        const subGain2 = ctx.createGain();
        subGain2.gain.setValueAtTime(0.25 * velocity, now);

        const subGain3 = ctx.createGain();
        subGain3.gain.setValueAtTime(0.08 * velocity, now);

        osc1.connect(subGain1);
        osc2.connect(subGain2);
        osc3.connect(subGain3);

        subGain1.connect(voiceGain);
        subGain2.connect(voiceGain);
        subGain3.connect(voiceGain);

        // Envelope
        voiceGain.gain.setValueAtTime(0.001, now);
        voiceGain.gain.exponentialRampToValueAtTime(0.8 * velocity, now + 0.015);
        voiceGain.gain.exponentialRampToValueAtTime(0.4 * velocity, now + 0.25);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        osc1.stop(now + durationSec);
        osc2.stop(now + durationSec);
        osc3.stop(now + durationSec);
      } else if (instrument === 'rhodes') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const tines = ctx.createOscillator();
        tines.type = 'triangle';
        tines.frequency.setValueAtTime(freq * 4, now);

        const tinesGain = ctx.createGain();
        tinesGain.gain.setValueAtTime(0.15 * velocity, now);
        tinesGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        tines.connect(tinesGain);
        tinesGain.connect(voiceGain);
        osc.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0.001, now);
        voiceGain.gain.exponentialRampToValueAtTime(0.7 * velocity, now + 0.02);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.5);

        osc.start(now);
        tines.start(now);
        osc.stop(now + durationSec * 1.5);
        tines.stop(now + 0.3);
      } else if (instrument === 'guitar') {
        // Pluck simulation with filter sweep
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 4, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.4);

        osc.connect(filter);
        filter.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0.001, now);
        voiceGain.gain.exponentialRampToValueAtTime(0.9 * velocity, now + 0.008);
        voiceGain.gain.exponentialRampToValueAtTime(0.2 * velocity, now + 0.3);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.start(now);
        osc.stop(now + durationSec);
      } else {
        // Warm synth pad
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        osc.connect(filter);
        filter.connect(voiceGain);

        voiceGain.gain.setValueAtTime(0.001, now);
        voiceGain.gain.linearRampToValueAtTime(0.5 * velocity, now + 0.15);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.2);

        osc.start(now);
        osc.stop(now + durationSec * 1.2);
      }
    } catch (e) {
      console.warn('Audio playback not supported or user has not interacted with page yet', e);
    }
  }

  // Play a full chord together or with gentle strum
  public playChord(
    notes: { note: string; octave?: number }[],
    instrument: InstrumentType = 'piano',
    strumSpeedMs: number = 30
  ) {
    notes.forEach((item, index) => {
      setTimeout(() => {
        this.playNote(item.note, item.octave || 4, 1.8, instrument, 0.75);
      }, index * strumSpeedMs);
    });
  }

  // Play an entire scale arpeggiated up and down
  public playScaleArpeggio(
    notes: { note: string; octave?: number }[],
    instrument: InstrumentType = 'piano',
    speedBpm: number = 140,
    onStep?: (note: string, index: number) => void
  ) {
    const delayMs = (60 / speedBpm) * 500; // 8th notes
    notes.forEach((item, index) => {
      setTimeout(() => {
        this.playNote(item.note, item.octave || 4, 0.5, instrument, 0.85);
        if (onStep) onStep(item.note, index);
      }, index * delayMs);
    });
  }
}

export const soundEngine = new SoundEngine();
