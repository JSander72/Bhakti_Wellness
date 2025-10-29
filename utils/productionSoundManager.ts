/**
 * Production Sound Manager using expo-audio for cross-platform audio support
 * Supports iOS, Android, and Web with real audio files
 */

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export class ProductionSoundManager {
  private player: AudioPlayer | null = null;
  private isPlaying = false;
  private currentSoundType: string | null = null;

  // Audio file mappings - you'll need to add these files to assets/sounds/
  // For now, these will fail gracefully if files don't exist
  private soundFiles = {
    ocean: () => require('../assets/sounds/ocean-waves.mp3'),
    rain: () => require('../assets/sounds/gentle-rain.mp3'),
    forest: () => require('../assets/sounds/forest-birds.mp3'),
    'singing-bowl': () => require('../assets/sounds/singing-bowl.mp3'),
    'white-noise': () => require('../assets/sounds/white-noise.mp3'),
  };

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Configure audio for background playback and mixing with other audio
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        // Prefer ducking other audio on Android and mixing elsewhere
        interruptionModeAndroid: 'duckOthers',
        interruptionMode: 'mixWithOthers',
      });
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }

  async start(soundType: string): Promise<void> {
    try {
      // Stop current sound if playing a different one
      if (this.isPlaying && this.currentSoundType !== soundType) {
        await this.stop();
      }

      // Don't restart if already playing the same sound
      if (this.isPlaying && this.currentSoundType === soundType) {
        return;
      }

      // Check if sound type is supported
      const soundLoader = this.soundFiles[soundType as keyof typeof this.soundFiles];
      if (!soundLoader) {
        console.log('Unsupported sound type:', soundType);
        return;
      }

      let audioSource;
      try {
        audioSource = soundLoader();
      } catch {
        console.log(`Audio file not found for ${soundType}. Please add the audio file to assets/sounds/`);
        return;
      }

      // Create and configure the audio player
      const player = createAudioPlayer(audioSource, { updateInterval: 500 });
      player.loop = true;
      player.volume = 0.3;
      player.play();

      this.player = player;
      this.isPlaying = true;
      this.currentSoundType = soundType;

      console.log('Background sound started:', soundType);
    } catch (error) {
      console.log('Failed to start background sound:', error);
      this.isPlaying = false;
      this.currentSoundType = null;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.player) {
        this.player.pause();
        this.player.remove();
        this.player = null;
      }
      this.isPlaying = false;
      this.currentSoundType = null;
      console.log('Background sound stopped');
    } catch (error) {
      console.log('Failed to stop background sound:', error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      if (this.player) {
        this.player.volume = Math.max(0, Math.min(1, volume));
      }
    } catch (error) {
      console.log('Failed to set volume:', error);
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentSoundType(): string | null {
    return this.currentSoundType;
  }
}