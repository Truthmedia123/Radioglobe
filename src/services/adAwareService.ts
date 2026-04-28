/**
 * AdAwareService
 * 
 * Detects when the station switches to a commercial break and gently lowers volume.
 * When content resumes, fades back up.
 * 
 * Implementation: Manual timer approach where users can flag ad breaks.
 * Users can set "Ad Break, please lower volume for X minutes" directly.
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Station } from '../api/radioBrowser';

export interface AdBreak {
    id: string;
    stationId: string;
    stationName: string;
    startTime: number;
    duration: number; // in minutes
    endTime: number;
    isActive: boolean;
    volumeReduction: number; // 0-1, e.g., 0.5 = 50% volume
    userFlagged: boolean;
}

export interface AdAwareState {
    isAdBreakActive: boolean;
    currentAdBreak: AdBreak | null;
    volumeMultiplier: number; // 0-1
    timeRemaining: number; // seconds
    isCurtainVisible: boolean;
    userFlags: Array<{
        stationId: string;
        timestamp: number;
        duration: number;
    }>;
}

class AdAwareService {
    private static instance: AdAwareService;
    private state: AdAwareState = {
        isAdBreakActive: false,
        currentAdBreak: null,
        volumeMultiplier: 1.0,
        timeRemaining: 0,
        isCurtainVisible: false,
        userFlags: [],
    };
    private timerInterval: NodeJS.Timeout | null = null;
    private curtainTimeout: NodeJS.Timeout | null = null;
    private readonly STORAGE_KEY = 'adAware_userFlags';
    private readonly VOLUME_REDUCTION = 0.5; // Reduce to 50% volume during ads
    private readonly CURTAIN_DURATION = 300; // 5 minutes default

    private constructor() {
        this.loadUserFlags();
    }

    static getInstance(): AdAwareService {
        if (!AdAwareService.instance) {
            AdAwareService.instance = new AdAwareService();
        }
        return AdAwareService.instance;
    }

    /**
     * Initialize service
     */
    async init(): Promise<boolean> {
        try {
            // Load any active ad break from storage
            const stored = await AsyncStorage.getItem('adAware_activeBreak');
            if (stored) {
                const adBreak: AdBreak = JSON.parse(stored);
                if (adBreak.isActive && adBreak.endTime > Date.now()) {
                    // Resume active ad break
                    this.state.currentAdBreak = adBreak;
                    this.state.isAdBreakActive = true;
                    this.state.timeRemaining = Math.max(0, Math.floor((adBreak.endTime - Date.now()) / 1000));
                    this.state.volumeMultiplier = 1 - adBreak.volumeReduction;
                    this.state.isCurtainVisible = true;

                    this.startTimer();
                    this.applyVolumeReduction();
                } else {
                    // Clear expired ad break
                    await AsyncStorage.removeItem('adAware_activeBreak');
                }
            }
            return true;
        } catch (error) {
            console.error('AdAwareService: Failed to initialize', error);
            return false;
        }
    }

    /**
     * Start a manual ad break timer
     */
    async startManualAdBreak(station: Station, durationMinutes: number = 5): Promise<AdBreak> {
        try {
            // Stop any existing ad break
            await this.stopAdBreak();

            const adBreak: AdBreak = {
                id: `adbreak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                stationId: station.stationuuid,
                stationName: station.name,
                startTime: Date.now(),
                duration: durationMinutes,
                endTime: Date.now() + durationMinutes * 60 * 1000,
                isActive: true,
                volumeReduction: this.VOLUME_REDUCTION,
                userFlagged: true,
            };

            // Update state
            this.state.currentAdBreak = adBreak;
            this.state.isAdBreakActive = true;
            this.state.timeRemaining = durationMinutes * 60;
            this.state.volumeMultiplier = 1 - this.VOLUME_REDUCTION;
            this.state.isCurtainVisible = true;

            // Save to storage
            await AsyncStorage.setItem('adAware_activeBreak', JSON.stringify(adBreak));

            // Record user flag
            await this.recordUserFlag(station, durationMinutes);

            // Start timer
            this.startTimer();

            // Apply volume reduction
            await this.applyVolumeReduction();

            // Show curtain
            this.showCurtain();

            return adBreak;
        } catch (error) {
            console.error('AdAwareService: Failed to start manual ad break', error);
            throw error;
        }
    }

    /**
     * Stop current ad break
     */
    async stopAdBreak(): Promise<void> {
        try {
            // Clear timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            // Clear curtain timeout
            if (this.curtainTimeout) {
                clearTimeout(this.curtainTimeout);
                this.curtainTimeout = null;
            }

            // Restore volume
            this.state.volumeMultiplier = 1.0;
            await this.applyVolumeReduction();

            // Update state
            if (this.state.currentAdBreak) {
                this.state.currentAdBreak.isActive = false;
            }

            this.state.isAdBreakActive = false;
            this.state.timeRemaining = 0;
            this.state.isCurtainVisible = false;

            // Clear storage
            await AsyncStorage.removeItem('adAware_activeBreak');

            // Hide curtain
            this.hideCurtain();
        } catch (error) {
            console.error('AdAwareService: Failed to stop ad break', error);
        }
    }

    /**
     * Record a user flag for ad detection (crowdsourcing)
     */
    async recordUserFlag(station: Station, durationMinutes: number): Promise<void> {
        try {
            const flag = {
                stationId: station.stationuuid,
                timestamp: Date.now(),
                duration: durationMinutes,
            };

            this.state.userFlags.push(flag);

            // Keep only last 100 flags
            if (this.state.userFlags.length > 100) {
                this.state.userFlags = this.state.userFlags.slice(-100);
            }

            // Save to storage
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state.userFlags));

            // Analyze patterns (simplified)
            this.analyzeAdPatterns(station);
        } catch (error) {
            console.error('AdAwareService: Failed to record user flag', error);
        }
    }

    /**
     * Analyze ad patterns for a station (simplified)
     */
    private analyzeAdPatterns(station: Station): void {
        const stationFlags = this.state.userFlags.filter(
            flag => flag.stationId === station.stationuuid
        );

        if (stationFlags.length >= 3) {
            // Simple pattern detection: if multiple users flag similar times, we could predict
            console.log(`AdAwareService: ${stationFlags.length} flags for ${station.name}`);
            // In a real implementation, we would analyze timestamps to find patterns
        }
    }

    /**
     * Get suggested ad break duration for a station based on historical data
     */
    getSuggestedDuration(stationId: string): number {
        const stationFlags = this.state.userFlags.filter(
            flag => flag.stationId === stationId
        );

        if (stationFlags.length === 0) {
            return 5; // Default 5 minutes
        }

        // Calculate average duration
        const totalDuration = stationFlags.reduce((sum, flag) => sum + flag.duration, 0);
        return Math.round(totalDuration / stationFlags.length);
    }

    /**
     * Get current state
     */
    getState(): AdAwareState {
        return { ...this.state };
    }

    /**
     * Check if ad break should be auto-started based on time patterns
     */
    shouldAutoStartAdBreak(station: Station): boolean {
        // Simple heuristic: check if current minute is a common ad time (e.g., :00, :15, :30, :45)
        const now = new Date();
        const minute = now.getMinutes();

        // Common ad break times (on the hour, quarter past, half past, quarter to)
        const commonAdMinutes = [0, 15, 30, 45];

        if (commonAdMinutes.includes(minute)) {
            // Check if we have user flags for this station around this time
            const stationFlags = this.state.userFlags.filter(
                flag => flag.stationId === station.stationuuid
            );

            if (stationFlags.length > 0) {
                // Simple: if we have any flags, suggest auto-start
                return true;
            }
        }

        return false;
    }

    /**
     * Start timer for current ad break
     */
    private startTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.state.timeRemaining <= 0) {
                this.stopAdBreak();
                return;
            }

            this.state.timeRemaining -= 1;

            // Gradually restore volume in last 30 seconds
            if (this.state.timeRemaining <= 30) {
                const fadeProgress = 1 - (this.state.timeRemaining / 30);
                this.state.volumeMultiplier = 0.5 + (0.5 * fadeProgress);
                this.applyVolumeReduction();
            }
        }, 1000);
    }

    /**
     * Apply volume reduction to audio system
     */
    private async applyVolumeReduction(): Promise<void> {
        try {
            // In a real implementation, we would adjust the audio playback volume
            // For now, we'll just update the state
            // Note: Actual volume adjustment would be done in AudioService
            console.log(`AdAwareService: Volume multiplier set to ${this.state.volumeMultiplier}`);

            // If we have access to the audio service, we could do:
            // audioService.setVolume(this.state.volumeMultiplier);
        } catch (error) {
            console.error('AdAwareService: Failed to apply volume reduction', error);
        }
    }

    /**
     * Show curtain overlay
     */
    private showCurtain(): void {
        this.state.isCurtainVisible = true;

        // Auto-hide curtain after ad break ends
        if (this.curtainTimeout) {
            clearTimeout(this.curtainTimeout);
        }

        this.curtainTimeout = setTimeout(() => {
            this.state.isCurtainVisible = false;
        }, this.state.timeRemaining * 1000);
    }

    /**
     * Hide curtain overlay
     */
    private hideCurtain(): void {
        this.state.isCurtainVisible = false;
    }

    /**
     * Format time remaining as MM:SS
     */
    formatTimeRemaining(): string {
        const minutes = Math.floor(this.state.timeRemaining / 60);
        const seconds = this.state.timeRemaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Load user flags from storage
     */
    private async loadUserFlags(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.state.userFlags = JSON.parse(stored);
            }
        } catch (error) {
            console.error('AdAwareService: Failed to load user flags', error);
            this.state.userFlags = [];
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.stopAdBreak();
        this.state.userFlags = [];
    }
}

export const adAwareService = AdAwareService.getInstance();