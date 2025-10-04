/**
 * Web Audio API-based sound generator for background meditation sounds
 * Since we don't have audio files, this generates sounds programmatically
 * Note: This primarily works on web platform. Mobile implementation would need actual audio files.
 */

export class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private isSupported = false;

  constructor() {
    // Check if we're in a web environment with AudioContext support
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.3; // Set volume to 30%
        this.isSupported = true;
      } catch (error) {
        console.log('Web Audio API not supported:', error);
        this.isSupported = false;
      }
    } else {
      console.log('Audio generation not supported on this platform - would need actual audio files for mobile');
      this.isSupported = false;
    }
  }

  async start(soundType: string): Promise<void> {
    if (!this.isSupported || !this.audioContext || this.isPlaying) {
      console.log('Sound generation not supported or already playing');
      return;
    }

    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;

    switch (soundType) {
      case 'ocean':
        this.generateOceanSound();
        break;
      case 'rain':
        this.generateRainSound();
        break;
      case 'forest':
        this.generateForestSound();
        break;
      case 'singing-bowl':
        this.generateSingingBowlSound();
        break;
      case 'white-noise':
        this.generateWhiteNoise();
        break;
      default:
        this.isPlaying = false;
        console.log('Unknown sound type:', soundType);
        break;
    }
  }

  stop(): void {
    if (!this.isSupported || !this.audioContext || !this.isPlaying) return;

    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];

    // Stop noise source
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      this.noiseSource = null;
    }

    this.isPlaying = false;
  }

  private generateOceanSound(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create filtered white noise for ocean waves
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pink noise (filtered white noise)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    // Low-pass filter for ocean-like sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    this.noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.noiseSource.start();
  }

  private generateRainSound(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create noise buffer for rain
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate high-frequency noise for rain
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    // High-pass filter for rain-like sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    this.noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.noiseSource.start();
  }

  private generateForestSound(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create gentle wind sound with occasional bird chirps
    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate soft pink noise for wind
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    // Band-pass filter for forest ambience
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.8;

    this.noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.noiseSource.start();
  }

  private generateSingingBowlSound(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create a series of harmonic tones
    const frequencies = [256, 384, 512, 768]; // C4 and harmonics
    
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Each harmonic gets progressively quieter
      oscGain.gain.value = 0.15 / (index + 1);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      
      osc.start();
      this.oscillators.push(osc);
    });
  }

  private generateWhiteNoise(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create white noise buffer
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pure white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    this.noiseSource.connect(this.gainNode);
    this.noiseSource.start();
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsSupported(): boolean {
    return this.isSupported;
  }
}