/**
 * Production Sound Manager using expo-audio for cross-platform audio support
 * Supports iOS, Android, and Web with real audio files
 */

import { Audio } from 'expo-av';

export class ProductionSoundManager {
  private sound: Audio.Sound | null = null;
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
      // Set audio mode for background playback and mixing with other audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
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

      // Load and play the audio file
      // Using expo-audio: load sound and start playback
      const sound = new Audio.Sound();
      await sound.loadAsync(audioSource);
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(0.3);
      await sound.playAsync();

      this.sound = sound;
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
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
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
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
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