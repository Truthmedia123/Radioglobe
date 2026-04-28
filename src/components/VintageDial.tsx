/**
 * VintageDial.tsx
 * 
 * FM Visualizer with Vintage Tuner Dial
 * Audio-reactive needle that moves in real time with audio signal.
 * Replaces the static dial placeholder in PlayerScreen.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText, Line } from 'react-native-svg';
import { usePlayerStore } from '../store/playerStore';
import { COLORS } from '../constants/theme';

// Extended colors for the dial (compatible with dark theme)
const DIAL_COLORS = {
    ...COLORS,
    border: '#2A2F3E',
    secondary: '#4ECDC4', // Using record color as secondary
    accent: '#F5A623', // Using primary as accent
    success: '#4ECDC4', // Teal
    warning: '#F5A623', // Amber
};

const { width } = Dimensions.get('window');
const DIAL_SIZE = Math.min(width * 0.7, 300);
const DIAL_RADIUS = DIAL_SIZE / 2;
const NEEDLE_LENGTH = DIAL_RADIUS * 0.85;
const NEEDLE_WIDTH = 3;

// Frequency scale for the dial (FM range 88-108 MHz)
const FREQUENCIES = [
    { freq: 88.0, label: '88.0' },
    { freq: 90.0, label: '90.0' },
    { freq: 92.0, label: '92.0' },
    { freq: 94.0, label: '94.0' },
    { freq: 96.0, label: '96.0' },
    { freq: 98.0, label: '98.0' },
    { freq: 100.0, label: '100.0' },
    { freq: 102.0, label: '102.0' },
    { freq: 104.0, label: '104.0' },
    { freq: 106.0, label: '106.0' },
    { freq: 108.0, label: '108.0' },
];

// Station presets (mock data)
const STATION_PRESETS = [
    { freq: 88.5, name: 'Jazz FM', color: '#FF6B6B' },
    { freq: 91.3, name: 'Rock 91', color: '#4ECDC4' },
    { freq: 94.7, name: 'Classical', color: '#FFD166' },
    { freq: 98.2, name: 'News Talk', color: '#06D6A0' },
    { freq: 101.5, name: 'Hits 101', color: '#118AB2' },
    { freq: 105.9, name: 'Indie 106', color: '#EF476F' },
];

interface VintageDialProps {
    /**
     * Current audio level in dB (0-1 normalized)
     * If not provided, will use mock animation
     */
    audioLevel?: number;

    /**
     * Current station frequency in MHz
     * Used to position the needle
     */
    frequency?: number;

    /**
     * Whether to show station presets
     */
    showPresets?: boolean;

    /**
     * Callback when a preset is selected
     */
    onPresetSelect?: (frequency: number, name: string) => void;
}

export const VintageDial: React.FC<VintageDialProps> = ({
    audioLevel = 0.3,
    frequency = 98.5,
    showPresets = true,
    onPresetSelect,
}) => {
    const { isPlaying } = usePlayerStore();
    const [needleAngle, setNeedleAngle] = useState<number>(0);
    const [audioVibration, setAudioVibration] = useState<number>(0);
    const needleRotation = useRef(new Animated.Value(0)).current;
    const vibrationAnim = useRef(new Animated.Value(0)).current;

    // Calculate needle angle based on frequency (88-108 MHz maps to -135 to 135 degrees)
    const frequencyToAngle = (freq: number): number => {
        const minFreq = 88;
        const maxFreq = 108;
        const minAngle = -135;
        const maxAngle = 135;

        const normalized = (freq - minFreq) / (maxFreq - minFreq);
        return minAngle + normalized * (maxAngle - minAngle);
    };

    // Simulate audio reactivity
    useEffect(() => {
        if (!isPlaying) {
            setAudioVibration(0);
            return;
        }

        // Simulate audio level changes
        const interval = setInterval(() => {
            // Generate random vibration based on audio level
            const vibration = audioLevel * (0.5 + Math.random() * 0.5);
            setAudioVibration(vibration);

            // Slight needle movement based on audio
            const drift = (Math.random() - 0.5) * 2 * audioLevel;
            const currentAngle = frequencyToAngle(frequency);
            setNeedleAngle(currentAngle + drift);
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, audioLevel, frequency]);

    // Animate needle to target angle
    useEffect(() => {
        const targetAngle = frequencyToAngle(frequency) + (audioVibration * 2);

        Animated.spring(needleRotation, {
            toValue: targetAngle,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, [frequency, audioVibration]);

    // Animate vibration
    useEffect(() => {
        if (audioVibration > 0) {
            Animated.sequence([
                Animated.timing(vibrationAnim, {
                    toValue: audioVibration,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(vibrationAnim, {
                    toValue: 0,
                    duration: 100,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [audioVibration]);

    // Calculate needle position
    const needleTransform = needleRotation.interpolate({
        inputRange: [-180, 180],
        outputRange: ['-180deg', '180deg'],
    });

    const vibrationTransform = vibrationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 5],
    });

    // Generate dial markings
    const renderDialMarkings = () => {
        return FREQUENCIES.map(({ freq, label }, index) => {
            const angle = frequencyToAngle(freq);
            const rad = (angle * Math.PI) / 180;
            const isMajor = freq % 2 === 0;

            // Position for tick mark
            const tickLength = isMajor ? 15 : 8;
            const tickX1 = DIAL_RADIUS + (DIAL_RADIUS - tickLength - 10) * Math.sin(rad);
            const tickY1 = DIAL_RADIUS - (DIAL_RADIUS - tickLength - 10) * Math.cos(rad);
            const tickX2 = DIAL_RADIUS + (DIAL_RADIUS - 10) * Math.sin(rad);
            const tickY2 = DIAL_RADIUS - (DIAL_RADIUS - 10) * Math.cos(rad);

            // Position for label
            const labelDist = DIAL_RADIUS - 35;
            const labelX = DIAL_RADIUS + labelDist * Math.sin(rad);
            const labelY = DIAL_RADIUS - labelDist * Math.cos(rad);

            return (
                <G key={`marking-${freq}`}>
                    {/* Tick mark */}
                    <Line
                        x1={tickX1}
                        y1={tickY1}
                        x2={tickX2}
                        y2={tickY2}
                        stroke={COLORS.text}
                        strokeWidth={isMajor ? 2 : 1}
                        opacity={0.7}
                    />

                    {/* Frequency label */}
                    {isMajor && (
                        <SvgText
                            x={labelX}
                            y={labelY}
                            fill={COLORS.text}
                            fontSize="12"
                            fontWeight="500"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            opacity={0.8}
                        >
                            {label}
                        </SvgText>
                    )}
                </G>
            );
        });
    };

    // Render station presets
    const renderStationPresets = () => {
        if (!showPresets) return null;

        return STATION_PRESETS.map((preset) => {
            const angle = frequencyToAngle(preset.freq);
            const rad = (angle * Math.PI) / 180;
            const presetRadius = DIAL_RADIUS - 60;
            const presetX = DIAL_RADIUS + presetRadius * Math.sin(rad);
            const presetY = DIAL_RADIUS - presetRadius * Math.cos(rad);

            return (
                <G key={`preset-${preset.freq}`}>
                    {/* Preset dot */}
                    <Circle
                        cx={presetX}
                        cy={presetY}
                        r={6}
                        fill={preset.color}
                        opacity={0.8}
                        onPress={() => onPresetSelect?.(preset.freq, preset.name)}
                    />

                    {/* Preset label (on hover/active) */}
                    {Math.abs(frequency - preset.freq) < 0.3 && (
                        <SvgText
                            x={presetX}
                            y={presetY - 15}
                            fill={preset.color}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            opacity={0.9}
                        >
                            {preset.name}
                        </SvgText>
                    )}
                </G>
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.dialWrapper}>
                <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
                    {/* Dial background */}
                    <Circle
                        cx={DIAL_RADIUS}
                        cy={DIAL_RADIUS}
                        r={DIAL_RADIUS - 5}
                        fill="transparent"
                        stroke={DIAL_COLORS.border}
                        strokeWidth={2}
                        opacity={0.3}
                    />

                    {/* Inner gradient ring */}
                    <Circle
                        cx={DIAL_RADIUS}
                        cy={DIAL_RADIUS}
                        r={DIAL_RADIUS - 20}
                        fill="transparent"
                        stroke="url(#dialGradient)"
                        strokeWidth={3}
                        opacity={0.5}
                    />

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={DIAL_COLORS.primary} stopOpacity={0.8} />
                            <stop offset="50%" stopColor={DIAL_COLORS.secondary} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={DIAL_COLORS.accent} stopOpacity={0.4} />
                        </linearGradient>
                    </defs>

                    {/* Dial markings */}
                    {renderDialMarkings()}

                    {/* Station presets */}
                    {renderStationPresets()}

                    {/* Center pivot */}
                    <Circle
                        cx={DIAL_RADIUS}
                        cy={DIAL_RADIUS}
                        r={8}
                        fill={COLORS.background}
                        stroke={COLORS.primary}
                        strokeWidth={2}
                    />

                    {/* Needle */}
                    <G
                        origin={`${DIAL_RADIUS}, ${DIAL_RADIUS}`}
                        rotation={needleAngle}
                    >
                        {/* Needle shaft */}
                        <Line
                            x1={DIAL_RADIUS}
                            y1={DIAL_RADIUS}
                            x2={DIAL_RADIUS}
                            y2={DIAL_RADIUS - NEEDLE_LENGTH}
                            stroke={DIAL_COLORS.accent}
                            strokeWidth={NEEDLE_WIDTH}
                            strokeLinecap="round"
                        />

                        {/* Needle head */}
                        <Circle
                            cx={DIAL_RADIUS}
                            cy={DIAL_RADIUS - NEEDLE_LENGTH}
                            r={6}
                            fill={DIAL_COLORS.accent}
                        />

                        {/* Needle reflection */}
                        <Line
                            x1={DIAL_RADIUS - 1}
                            y1={DIAL_RADIUS}
                            x2={DIAL_RADIUS - 1}
                            y2={DIAL_RADIUS - NEEDLE_LENGTH + 3}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth={1}
                            strokeLinecap="round"
                        />
                    </G>

                    {/* Current frequency display */}
                    <SvgText
                        x={DIAL_RADIUS}
                        y={DIAL_RADIUS + 40}
                        fill={COLORS.text}
                        fontSize="24"
                        fontWeight="bold"
                        textAnchor="middle"
                        opacity={0.9}
                    >
                        {frequency.toFixed(1)} MHz
                    </SvgText>

                    {/* Audio level indicator */}
                    {isPlaying && (
                        <G>
                            {/* Vibration rings */}
                            <Circle
                                cx={DIAL_RADIUS}
                                cy={DIAL_RADIUS}
                                r={20 + audioVibration * 10}
                                fill="transparent"
                                stroke={DIAL_COLORS.primary}
                                strokeWidth={1}
                                opacity={0.3 * audioVibration}
                            />
                            <Circle
                                cx={DIAL_RADIUS}
                                cy={DIAL_RADIUS}
                                r={15 + audioVibration * 8}
                                fill="transparent"
                                stroke={DIAL_COLORS.secondary}
                                strokeWidth={1}
                                opacity={0.4 * audioVibration}
                            />
                        </G>
                    )}
                </Svg>

                {/* Reception quality ring (outside the dial) */}
                <View style={styles.receptionRing}>
                    <View style={[styles.receptionSegment, { backgroundColor: DIAL_COLORS.success }]} />
                    <View style={[styles.receptionSegment, { backgroundColor: DIAL_COLORS.warning }]} />
                    <View style={[styles.receptionSegment, { backgroundColor: DIAL_COLORS.error }]} />
                    <View style={[styles.receptionSegment, { backgroundColor: 'transparent' }]} />
                </View>
            </View>

            {/* Audio level meter */}
            <View style={styles.meterContainer}>
                <View style={styles.meterLabel}>
                    <Animated.Text style={[styles.meterText, { opacity: audioVibration }]}>
                        SIGNAL
                    </Animated.Text>
                </View>
                <View style={styles.meterBar}>
                    <Animated.View
                        style={[
                            styles.meterFill,
                            {
                                width: `${audioLevel * 100}%`,
                                opacity: 0.5 + audioLevel * 0.5
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    dialWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    receptionRing: {
        position: 'absolute',
        width: DIAL_SIZE + 40,
        height: DIAL_SIZE + 40,
        borderRadius: (DIAL_SIZE + 40) / 2,
        borderWidth: 4,
        borderColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-45deg' }],
    },
    receptionSegment: {
        flex: 1,
        height: 4,
        marginHorizontal: 2,
        borderRadius: 2,
    },
    meterContainer: {
        marginTop: 20,
        width: DIAL_SIZE * 0.8,
        alignItems: 'center',
    },
    meterLabel: {
        marginBottom: 8,
    },
    meterText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        opacity: 0.7,
    },
    meterBar: {
        width: '100%',
        height: 4,
        backgroundColor: DIAL_COLORS.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    meterFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
});