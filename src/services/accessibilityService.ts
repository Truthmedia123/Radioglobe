import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Accessibility service for improving app accessibility
 * Provides screen reader support, contrast checking, and accessibility features
 */
export class AccessibilityService {
    private static instance: AccessibilityService;
    private isScreenReaderEnabled: boolean = false;
    private isBoldTextEnabled: boolean = false;
    private isInvertColorsEnabled: boolean = false;
    private isReduceMotionEnabled: boolean = false;
    private isReduceTransparencyEnabled: boolean = false;

    private constructor() {
        this.init();
    }

    static getInstance(): AccessibilityService {
        if (!AccessibilityService.instance) {
            AccessibilityService.instance = new AccessibilityService();
        }
        return AccessibilityService.instance;
    }

    /**
     * Initialize accessibility service
     */
    private async init(): Promise<void> {
        try {
            // Check screen reader status
            this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();

            // Listen for screen reader changes
            AccessibilityInfo.addEventListener(
                'screenReaderChanged',
                this.handleScreenReaderChanged
            );

            // Check other accessibility settings
            if (Platform.OS === 'ios') {
                // iOS-specific accessibility checks
                // Note: These APIs may not be available on all platforms
                // @ts-ignore
                this.isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled?.() || false;
                // @ts-ignore
                this.isInvertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled?.() || false;
                // @ts-ignore
                this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled?.() || false;
                // @ts-ignore
                this.isReduceTransparencyEnabled = await AccessibilityInfo.isReduceTransparencyEnabled?.() || false;
            }
        } catch (error) {
            console.warn('Accessibility initialization failed:', error);
        }
    }

    /**
     * Handle screen reader status changes
     */
    private handleScreenReaderChanged = (enabled: boolean): void => {
        this.isScreenReaderEnabled = enabled;
        console.log(`Screen reader ${enabled ? 'enabled' : 'disabled'}`);
    };

    /**
     * Check if screen reader is enabled
     */
    isScreenReaderActive(): boolean {
        return this.isScreenReaderEnabled;
    }

    /**
     * Check if reduce motion is enabled
     */
    isReduceMotionActive(): boolean {
        return this.isReduceMotionEnabled;
    }

    /**
     * Check if bold text is enabled
     */
    isBoldTextActive(): boolean {
        return this.isBoldTextEnabled;
    }

    /**
     * Check if invert colors is enabled
     */
    isInvertColorsActive(): boolean {
        return this.isInvertColorsEnabled;
    }

    /**
     * Check if reduce transparency is enabled
     */
    isReduceTransparencyActive(): boolean {
        return this.isReduceTransparencyEnabled;
    }

    /**
     * Announce message to screen reader
     */
    announce(message: string, priority: 'assertive' | 'polite' = 'polite'): void {
        if (this.isScreenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility(message);
        }
    }

    /**
     * Set accessibility focus on a React component
     */
    setAccessibilityFocus(ref: React.RefObject<any>): void {
        if (ref.current) {
            // @ts-ignore - setAccessibilityFocus may not be typed in all versions
            ref.current.setAccessibilityFocus?.();
        }
    }

    /**
     * Get recommended font size based on system settings
     */
    getRecommendedFontSize(baseSize: number): number {
        // In a real app, you would check system font scale
        // For now, return base size
        return baseSize;
    }

    /**
     * Get recommended contrast colors
     */
    getContrastColor(backgroundColor: string, lightColor: string, darkColor: string): string {
        // Simple contrast calculation - in a real app, use proper contrast ratio
        // For dark backgrounds, use light text; for light backgrounds, use dark text
        const isDark = this.isColorDark(backgroundColor);
        return isDark ? lightColor : darkColor;
    }

    /**
     * Check if a color is dark
     */
    private isColorDark(color: string): boolean {
        // Simple brightness calculation
        // Remove # if present
        const hex = color.replace('#', '');

        // Parse RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate brightness (perceived luminance)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness < 128;
    }

    /**
     * Get accessibility labels for common actions
     */
    getActionLabel(action: string, context?: string): string {
        const labels: Record<string, string> = {
            'play': 'Play radio station',
            'pause': 'Pause radio',
            'stop': 'Stop radio',
            'record': 'Start recording',
            'stop-record': 'Stop recording',
            'tune': 'Tune radio frequency',
            'volume-up': 'Increase volume',
            'volume-down': 'Decrease volume',
            'station-select': 'Select radio station',
            'favorite': 'Add to favorites',
            'share': 'Share station',
            'settings': 'Open settings',
            'back': 'Go back',
            'menu': 'Open menu',
            'search': 'Search stations',
        };

        const baseLabel = labels[action] || action;

        if (context) {
            return `${baseLabel} ${context}`;
        }

        return baseLabel;
    }

    /**
     * Get accessibility hints for common actions
     */
    getActionHint(action: string): string {
        const hints: Record<string, string> = {
            'play': 'Double tap to play the selected radio station',
            'pause': 'Double tap to pause the radio',
            'record': 'Double tap to start recording the current station',
            'tune': 'Swipe up or down to adjust the frequency',
            'station-select': 'Double tap to select this station',
            'favorite': 'Double tap to add this station to your favorites',
            'share': 'Double tap to share this station with others',
        };

        return hints[action] || 'Double tap to activate';
    }

    /**
     * Generate proper accessibility props for a button
     */
    getButtonAccessibilityProps(
        label: string,
        hint?: string,
        role: 'button' | 'link' | 'tab' = 'button'
    ) {
        return {
            accessible: true,
            accessibilityLabel: label,
            accessibilityHint: hint || this.getActionHint('button'),
            accessibilityRole: role,
            accessibilityState: { disabled: false },
        };
    }

    /**
     * Generate proper accessibility props for a slider
     */
    getSliderAccessibilityProps(label: string, value: number, min: number, max: number) {
        return {
            accessible: true,
            accessibilityLabel: label,
            accessibilityHint: `Adjust value between ${min} and ${max}`,
            accessibilityValue: {
                min,
                max,
                now: value,
            },
            accessibilityRole: 'adjustable',
        };
    }

    /**
     * Clean up event listeners
     */
    cleanup(): void {
        // Note: In newer React Native versions, removeEventListener might not be available
        // or the subscription object has a remove method
        // For now, we'll store the subscription and remove it properly
        // This is a placeholder - in a real implementation, store the subscription
        try {
            // @ts-ignore - Different RN versions have different APIs
            AccessibilityInfo.removeEventListener?.(
                'screenReaderChanged',
                this.handleScreenReaderChanged
            );
        } catch (error) {
            // Silently fail in cleanup
        }
    }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// React hooks for accessibility
import { useEffect, useState, useCallback } from 'react';

export const useAccessibility = () => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

    useEffect(() => {
        // Check initial state
        AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

        // Listen for changes
        const subscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            setIsScreenReaderEnabled
        );

        return () => {
            subscription.remove();
        };
    }, []);

    const announce = useCallback((message: string, priority: 'assertive' | 'polite' = 'polite') => {
        accessibilityService.announce(message, priority);
    }, []);

    const getButtonProps = useCallback((
        label: string,
        hint?: string,
        role: 'button' | 'link' | 'tab' = 'button'
    ) => {
        return accessibilityService.getButtonAccessibilityProps(label, hint, role);
    }, []);

    const getSliderProps = useCallback((
        label: string,
        value: number,
        min: number,
        max: number
    ) => {
        return accessibilityService.getSliderAccessibilityProps(label, value, min, max);
    }, []);

    const getActionLabel = useCallback((action: string, context?: string) => {
        return accessibilityService.getActionLabel(action, context);
    }, []);

    return {
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        announce,
        getButtonProps,
        getSliderProps,
        getActionLabel,
        setAccessibilityFocus: accessibilityService.setAccessibilityFocus.bind(accessibilityService),
        getContrastColor: accessibilityService.getContrastColor.bind(accessibilityService),
    };
};