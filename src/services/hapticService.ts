import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback service for consistent tactile feedback across the app
 * Provides different haptic patterns for various user interactions
 */
export class HapticService {
    private static instance: HapticService;
    private hapticsEnabled: boolean = true;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): HapticService {
        if (!HapticService.instance) {
            HapticService.instance = new HapticService();
        }
        return HapticService.instance;
    }

    /**
     * Enable or disable haptic feedback
     */
    setEnabled(enabled: boolean): void {
        this.hapticsEnabled = enabled;
    }

    /**
     * Check if haptics are enabled
     */
    isEnabled(): boolean {
        return this.hapticsEnabled;
    }

    /**
     * Light impact - for subtle feedback (button taps, toggles)
     */
    async light(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Medium impact - for standard interactions (switches, selections)
     */
    async medium(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Heavy impact - for significant actions (record start/stop, major changes)
     */
    async heavy(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Success notification - for positive confirmations
     */
    async success(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Warning notification - for warnings or errors
     */
    async warning(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Error notification - for failures or blocked actions
     */
    async error(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Selection change - for picker wheels, dial adjustments
     */
    async selection(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Custom pattern for dial/knob interactions
     */
    async dialTick(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            // Light impact for each tick
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Pattern for recording start/stop
     */
    async recordingToggle(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            // Medium impact for recording start
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Pattern for station change/tuning
     */
    async stationChange(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            // Light impact followed by selection
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await new Promise(resolve => setTimeout(resolve, 50));
            await Haptics.selectionAsync();
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Pattern for ad break detection
     */
    async adBreakDetected(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            // Warning pattern
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await new Promise(resolve => setTimeout(resolve, 100));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Pattern for found sound clip capture
     */
    async soundClipCaptured(): Promise<void> {
        if (!this.hapticsEnabled) return;
        try {
            // Success pattern with light impact
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await new Promise(resolve => setTimeout(resolve, 80));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }
}

// Export singleton instance
export const hapticService = HapticService.getInstance();

// React hook for using haptics
import { useCallback } from 'react';

export const useHaptics = () => {
    const light = useCallback(() => hapticService.light(), []);
    const medium = useCallback(() => hapticService.medium(), []);
    const heavy = useCallback(() => hapticService.heavy(), []);
    const success = useCallback(() => hapticService.success(), []);
    const warning = useCallback(() => hapticService.warning(), []);
    const error = useCallback(() => hapticService.error(), []);
    const selection = useCallback(() => hapticService.selection(), []);
    const dialTick = useCallback(() => hapticService.dialTick(), []);
    const recordingToggle = useCallback(() => hapticService.recordingToggle(), []);
    const stationChange = useCallback(() => hapticService.stationChange(), []);
    const adBreakDetected = useCallback(() => hapticService.adBreakDetected(), []);
    const soundClipCaptured = useCallback(() => hapticService.soundClipCaptured(), []);

    return {
        light,
        medium,
        heavy,
        success,
        warning,
        error,
        selection,
        dialTick,
        recordingToggle,
        stationChange,
        adBreakDetected,
        soundClipCaptured,
        setEnabled: hapticService.setEnabled.bind(hapticService),
        isEnabled: hapticService.isEnabled.bind(hapticService),
    };
};