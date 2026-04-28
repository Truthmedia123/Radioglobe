import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { StationTimeInfo } from '../hooks/useStationTime';

interface ClockFaceProps {
    timeInfo: StationTimeInfo;
    size?: number;
    showDigital?: boolean;
}

export const ClockFace: React.FC<ClockFaceProps> = ({
    timeInfo,
    size = 80,
    showDigital = true
}) => {
    const { hour, minute, second, isUnknown, timeString } = timeInfo;

    if (isUnknown) {
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <View style={styles.unknownContainer}>
                    <Text style={styles.unknownText}>--:--</Text>
                </View>
            </View>
        );
    }

    const clockSize = size;
    const center = clockSize / 2;
    const radius = clockSize * 0.4;

    // Convert to angles (radians)
    const hourAngle = ((hour % 12) + minute / 60) * 30 * Math.PI / 180;
    const minuteAngle = minute * 6 * Math.PI / 180;
    const secondAngle = second * 6 * Math.PI / 180;

    // Hand lengths
    const hourHandLength = radius * 0.5;
    const minuteHandLength = radius * 0.7;
    const secondHandLength = radius * 0.8;

    // Calculate hand endpoints
    const hourX = center + hourHandLength * Math.sin(hourAngle);
    const hourY = center - hourHandLength * Math.cos(hourAngle);
    const minuteX = center + minuteHandLength * Math.sin(minuteAngle);
    const minuteY = center - minuteHandLength * Math.cos(minuteAngle);
    const secondX = center + secondHandLength * Math.sin(secondAngle);
    const secondY = center - secondHandLength * Math.cos(secondAngle);

    return (
        <View style={styles.container}>
            <Svg width={clockSize} height={clockSize}>
                {/* Clock face */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={COLORS.surface}
                    strokeWidth={2}
                    fill="transparent"
                />

                {/* Hour markers */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = i * 30 * Math.PI / 180;
                    const markerLength = i % 3 === 0 ? 6 : 3;
                    const markerX1 = center + (radius - 2) * Math.sin(angle);
                    const markerY1 = center - (radius - 2) * Math.cos(angle);
                    const markerX2 = center + (radius - 2 - markerLength) * Math.sin(angle);
                    const markerY2 = center - (radius - 2 - markerLength) * Math.cos(angle);

                    return (
                        <Line
                            key={i}
                            x1={markerX1}
                            y1={markerY1}
                            x2={markerX2}
                            y2={markerY2}
                            stroke={COLORS.secondaryText}
                            strokeWidth={i % 3 === 0 ? 2 : 1}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Hour hand */}
                <Line
                    x1={center}
                    y1={center}
                    x2={hourX}
                    y2={hourY}
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    strokeLinecap="round"
                />

                {/* Minute hand */}
                <Line
                    x1={center}
                    y1={center}
                    x2={minuteX}
                    y2={minuteY}
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    strokeLinecap="round"
                />

                {/* Second hand */}
                <Line
                    x1={center}
                    y1={center}
                    x2={secondX}
                    y2={secondY}
                    stroke={COLORS.record}
                    strokeWidth={1}
                    strokeLinecap="round"
                />

                {/* Center dot */}
                <Circle
                    cx={center}
                    cy={center}
                    r={3}
                    fill={COLORS.primary}
                />
            </Svg>

            {showDigital && (
                <Text style={styles.digitalTime}>{timeString}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    unknownContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    unknownText: {
        ...TYPOGRAPHY.data,
        fontSize: 14,
        color: COLORS.secondaryText,
    },
    digitalTime: {
        ...TYPOGRAPHY.data,
        fontSize: 12,
        color: COLORS.secondaryText,
        marginTop: 8,
        fontFamily: 'PlayfairDisplay_400Regular',
    },
});