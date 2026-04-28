import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { audioService } from './audioService';
import { usePlayerStore } from '../store/playerStore';

export type SleepTimerDuration = 15 | 30 | 45 | 60 | 90 | 120 | 'custom';

export interface SleepTimerState {
    isActive: boolean;
    duration: number; // in minutes
    remainingSeconds: number;
    isFading: boolean;
    withNatureSounds: boolean;
}

class SleepTimerService {
    private timerId: NodeJS.Timeout | null = null;
    private fadeAnimation: Animated.Value = new Animated.Value(1);
    private natureSoundPlaying = false;
    private currentVolume = 1;

    /**
     * Start the sleep timer
     */
    async start(durationMinutes: number, withNatureSounds: boolean = false) {
        // Stop any existing timer
        this.stop();

        const durationSeconds = durationMinutes * 60;
        let remaining = durationSeconds;

        console.log(`Sleep timer started: ${durationMinutes} minutes`);

        // Store initial volume from player store
        const { volume } = usePlayerStore.getState();
        this.currentVolume = volume;

        // Start countdown
        this.timerId = setInterval(async () => {
            remaining -= 1;

            // Update store
            usePlayerStore.getState().setSleepTimerState({
                isActive: true,
                duration: durationMinutes,
                remainingSeconds: remaining,
                isFading: remaining <= 10,
                withNatureSounds,
            });

            // Start fade out in last 10 seconds
            if (remaining === 10) {
                await this.startFadeOut();
            }

            // Timer finished
            if (remaining <= 0) {
                await this.onTimerComplete(withNatureSounds);
            }
        }, 1000);
    }

    /**
     * Start fade out animation
     */
    private async startFadeOut() {
        console.log('Starting fade out...');

        // Create fade animation from current volume to 0 over 10 seconds
        this.fadeAnimation = new Animated.Value(this.currentVolume);

        Animated.timing(this.fadeAnimation, {
            toValue: 0,
            duration: 10000, // 10 seconds
            useNativeDriver: false,
        }).start(async () => {
            // Fade complete, pause audio
            await audioService.pause();

            // Reset volume for next time
            await audioService.setVolume(this.currentVolume);
        });

        // Update volume gradually
        this.fadeAnimation.addListener(({ value }) => {
            audioService.setVolume(value);
        });
    }

    /**
     * Handle timer completion
     */
    private async onTimerComplete(withNatureSounds: boolean) {
        this.stopTimer();

        if (withNatureSounds) {
            await this.playNatureSounds();
        }

        // Reset store state
        usePlayerStore.getState().setSleepTimerState({
            isActive: false,
            duration: 0,
            remainingSeconds: 0,
            isFading: false,
            withNatureSounds: false,
        });

        console.log('Sleep timer completed');
    }

    /**
     * Play nature sounds for 10 minutes
     */
    private async playNatureSounds(): Promise<void> {
        console.log('Playing nature sounds...');
        this.natureSoundPlaying = true;

        // In a real implementation, this would play a local nature sounds file
        // For now, we'll just log and simulate
        setTimeout(() => {
            this.natureSoundPlaying = false;
            console.log('Nature sounds completed');
        }, 600000); // 10 minutes
    }

    /**
     * Stop the timer
     */
    stop() {
        this.stopTimer();

        // Reset fade animation
        this.fadeAnimation.stopAnimation();

        // Restore original volume
        audioService.setVolume(this.currentVolume);

        // Reset store state
        usePlayerStore.getState().setSleepTimerState({
            isActive: false,
            duration: 0,
            remainingSeconds: 0,
            isFading: false,
            withNatureSounds: false,
        });

        console.log('Sleep timer stopped');
    }

    /**
     * Stop the internal timer
     */
    private stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Get current timer state
     */
    getState(): SleepTimerState {
        return usePlayerStore.getState().sleepTimer;
    }

    /**
     * Check if timer is active
     */
    isActive(): boolean {
        return this.getState().isActive;
    }

    /**
     * Format remaining time as MM:SS
     */
    formatRemainingTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

export const sleepTimerService = new SleepTimerService();

/**
 * React hook for sleep timer
 */
export const useSleepTimer = () => {
    const sleepTimer = usePlayerStore((state) => state.sleepTimer);
    const [localRemaining, setLocalRemaining] = useState(sleepTimer.remainingSeconds);

    useEffect(() => {
        if (sleepTimer.isActive && sleepTimer.remainingSeconds > 0) {
            const interval = setInterval(() => {
                setLocalRemaining((prev: number) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setLocalRemaining(sleepTimer.remainingSeconds);
        }
    }, [sleepTimer.isActive, sleepTimer.remainingSeconds]);

    const startTimer = async (durationMinutes: number, withNatureSounds: boolean = false) => {
        await sleepTimerService.start(durationMinutes, withNatureSounds);
    };

    const stopTimer = () => {
        sleepTimerService.stop();
    };

    const formatTime = (seconds: number) => {
        return sleepTimerService.formatRemainingTime(seconds);
    };

    return {
        ...sleepTimer,
        remainingSeconds: localRemaining,
        startTimer,
        stopTimer,
        formatTime,
    };
};