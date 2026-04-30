import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';
import { EventEmitter } from 'events';

// Event names for audio service events
export const AUDIO_EVENTS = {
  DEAD_STREAM: 'dead_stream',
  BUFFER_UPDATE: 'buffer_update',
  QUALITY_CHANGE: 'quality_change',
  PLAYBACK_ERROR: 'playback_error',
} as const;

class AudioService extends EventEmitter {
  private sound: Audio.Sound | null = null;
  private currentUrl: string | null = null;
  private isInitialized = false;
  private deadStreamWatchdog: NodeJS.Timeout | null = null;
  private bufferWatchdog: NodeJS.Timeout | null = null;
  private silentCounter = 0;
  private lastAmplitude = -60;
  private lastProgressUpdate = 0;

  async init() {
    if (this.isInitialized) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });

    this.isInitialized = true;
    console.log('AudioService initialized');
  }

  /**
   * Play a stream with optional pre-buffering
   */
  async play(url: string, shouldPreBuffer = true) {
    try {
      if (this.sound) {
        await this.stop();
      }

      usePlayerStore.getState().setIsLoading(true);
      this.currentUrl = url;

      // Pre-buffer if requested
      if (shouldPreBuffer) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false },
          this.onPlaybackStatusUpdate
        );

        this.sound = sound;

        // Wait for some buffer to accumulate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Start playback
        await sound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          this.onPlaybackStatusUpdate
        );

        this.sound = sound;
      }

      usePlayerStore.getState().setIsPlaying(true);
      usePlayerStore.getState().setIsLoading(false);

      // Start watchdogs
      this.startDeadStreamWatchdog();
      this.startBufferWatchdog();

      console.log(`Playing stream: ${url}`);
    } catch (error) {
      console.error('Error playing audio', error);
      usePlayerStore.getState().setIsLoading(false);
      usePlayerStore.getState().setIsPlaying(false);
      this.emit(AUDIO_EVENTS.PLAYBACK_ERROR, { error, url });
    }
  }

  /**
   * Hot-swap to a different stream URL without stopping playback
   */
  async hotSwapStream(newUrl: string) {
    if (!this.sound) {
      await this.play(newUrl);
      return;
    }

    try {
      console.log(`Hot-swapping to: ${newUrl}`);

      // Unload current stream and load new one
      await this.sound.unloadAsync();

      const { sound } = await Audio.Sound.createAsync(
        { uri: newUrl },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentUrl = newUrl;

      this.emit(AUDIO_EVENTS.QUALITY_CHANGE, { newUrl });
      console.log('Hot-swap completed successfully');
    } catch (error) {
      console.error('Error in hot-swap:', error);
      // Fall back to regular play
      await this.play(newUrl);
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      usePlayerStore.getState().setIsPlaying(false);
      this.stopWatchdogs();
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      usePlayerStore.getState().setIsPlaying(true);
      this.startDeadStreamWatchdog();
      this.startBufferWatchdog();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentUrl = null;
      usePlayerStore.getState().setIsPlaying(false);
      this.stopWatchdogs();
    }
  }

  async setVolume(volume: number) {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
    usePlayerStore.getState().setVolume(volume);
  }

  /**
   * Get current playback status
   */
  async getStatus() {
    if (!this.sound) return null;
    return await this.sound.getStatusAsync();
  }

  /**
   * Skip forward by specified seconds (positive) or backward (negative)
   */
  async skipBy(seconds: number) {
    if (!this.sound) return;
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.positionMillis !== undefined) {
        const newPosition = Math.max(0, status.positionMillis + seconds * 1000);
        await this.sound.setPositionAsync(newPosition);
        console.log(`Skipped ${seconds}s to ${newPosition}ms`);
      }
    } catch (error) {
      console.error('Error skipping:', error);
    }
  }

  /**
   * Seek to a specific position in milliseconds
   */
  async seekTo(positionMillis: number) {
    if (!this.sound) return;
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        await this.sound.setPositionAsync(positionMillis);
        console.log(`Seeked to ${positionMillis}ms`);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  /**
   * Skip forward 15 seconds
   */
  async skipForward() {
    await this.skipBy(15);
  }

  /**
   * Skip backward 15 seconds
   */
  async skipBackward() {
    await this.skipBy(-15);
  }

  /**
   * Start dead stream detection watchdog
   */
  private startDeadStreamWatchdog() {
    this.stopDeadStreamWatchdog();

    this.deadStreamWatchdog = setInterval(async () => {
      if (!this.sound) return;

      try {
        const status = await this.sound.getStatusAsync();

        // Check if stream is dead (not playing, not buffering, but should be)
        if (status.isLoaded && !status.isPlaying && !status.isBuffering) {
          const { isPlaying } = usePlayerStore.getState();
          if (isPlaying) {
            // Stream appears dead
            this.silentCounter++;

            if (this.silentCounter >= 5) { // 5 seconds of silence
              console.log('Dead stream detected');
              this.emit(AUDIO_EVENTS.DEAD_STREAM, { url: this.currentUrl });
              this.silentCounter = 0;
            }
          }
        } else {
          this.silentCounter = 0;
        }

        // Note: metering is not available in expo-av TypeScript definitions
        // We'll rely on the isPlaying/isBuffering state instead
      } catch (error) {
        // If player does not exist, clear the sound reference and stop watchdog
        if (error instanceof Error && error.message.includes('Player does not exist')) {
          console.log('Player no longer exists, clearing sound reference');
          this.sound = null;
          this.stopDeadStreamWatchdog();
          return;
        }
        console.error('Error in dead stream watchdog:', error);
      }
    }, 1000);
  }

  /**
   * Start buffer monitoring watchdog
   */
  private startBufferWatchdog() {
    this.stopBufferWatchdog();

    this.bufferWatchdog = setInterval(async () => {
      if (!this.sound) return;

      try {
        const status = await this.sound.getStatusAsync();

        if (status.isLoaded) {
          const bufferInfo = {
            positionMillis: status.positionMillis || 0,
            playableDurationMillis: status.playableDurationMillis || 0,
            durationMillis: status.durationMillis || 0,
            isBuffering: status.isBuffering || false,
          };

          this.emit(AUDIO_EVENTS.BUFFER_UPDATE, bufferInfo);

          // Calculate buffer percentage
          if (status.durationMillis && status.durationMillis > 0 && status.playableDurationMillis) {
            const bufferPercent = (status.playableDurationMillis / status.durationMillis) * 100;

            // If buffer is very low and we're not currently buffering, trigger rebuffer
            if (bufferPercent < 10 && !status.isBuffering && status.isPlaying) {
              console.log('Low buffer detected, attempting to rebuffer');
              // Pause briefly to allow buffer to build
              await this.sound.pauseAsync();
              await new Promise(resolve => setTimeout(resolve, 500));
              await this.sound.playAsync();
            }
          }
        }
      } catch (error) {
        // If player does not exist, clear the sound reference and stop watchdog
        if (error instanceof Error && error.message.includes('Player does not exist')) {
          console.log('Player no longer exists, clearing sound reference');
          this.sound = null;
          this.stopBufferWatchdog();
          return;
        }
        console.error('Error in buffer watchdog:', error);
      }
    }, 500);
  }

  private stopDeadStreamWatchdog() {
    if (this.deadStreamWatchdog) {
      clearInterval(this.deadStreamWatchdog);
      this.deadStreamWatchdog = null;
    }
  }

  private stopBufferWatchdog() {
    if (this.bufferWatchdog) {
      clearInterval(this.bufferWatchdog);
      this.bufferWatchdog = null;
    }
  }

  private stopWatchdogs() {
    this.stopDeadStreamWatchdog();
    this.stopBufferWatchdog();
    this.silentCounter = 0;
  }

  private onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      usePlayerStore.getState().setIsPlaying(status.isPlaying);

      // Update buffer info in real-time
      if (status.positionMillis !== undefined && status.playableDurationMillis !== undefined) {
        this.emit(AUDIO_EVENTS.BUFFER_UPDATE, {
          positionMillis: status.positionMillis,
          playableDurationMillis: status.playableDurationMillis,
          durationMillis: status.durationMillis,
          isBuffering: status.isBuffering,
        });

        // Track podcast progress
        const currentEpisode = usePlayerStore.getState().currentPodcastEpisode;
        if (currentEpisode && status.durationMillis) {
          const now = Date.now();
          if (now - this.lastProgressUpdate > 5000) {
            usePodcastStore.getState().updateProgress(
              currentEpisode,
              status.positionMillis,
              status.durationMillis
            );
            this.lastProgressUpdate = now;
          }
        }
      }
    } else if (status.error) {
      console.error('Playback error: ', status.error);
      usePlayerStore.getState().setIsPlaying(false);
      this.emit(AUDIO_EVENTS.PLAYBACK_ERROR, { error: status.error });
    }
  };

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.stop();
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

export const audioService = new AudioService();
