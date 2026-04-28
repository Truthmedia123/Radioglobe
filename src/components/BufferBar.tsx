import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { audioService, AUDIO_EVENTS } from '../services/audioService';

export interface BufferInfo {
    positionMillis: number;
    playableDurationMillis: number;
    durationMillis: number;
    isBuffering: boolean;
}

export const BufferBar: React.FC = () => {
    const [bufferPercent, setBufferPercent] = useState(100);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBufferUpdate = (info: BufferInfo) => {
            // Calculate buffer percentage
            let percent = 100;
            if (info.durationMillis > 0) {
                percent = Math.min(100, (info.playableDurationMillis / info.durationMillis) * 100);
            }

            setBufferPercent(percent);
            setIsBuffering(info.isBuffering);

            // Show buffer bar if buffering or buffer is low
            if (info.isBuffering || percent < 90) {
                setIsVisible(true);
            } else {
                // Hide after a delay when buffer is good
                setTimeout(() => setIsVisible(false), 1000);
            }
        };

        // Listen for buffer updates
        audioService.on(AUDIO_EVENTS.BUFFER_UPDATE, handleBufferUpdate);

        return () => {
            audioService.removeListener(AUDIO_EVENTS.BUFFER_UPDATE, handleBufferUpdate);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        { width: `${bufferPercent}%` },
                        isBuffering ? styles.barBuffering : styles.barNormal
                    ]}
                />
            </View>

            <Text style={styles.statusText}>
                {isBuffering ? 'Buffering...' : `${Math.round(bufferPercent)}% buffered`}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    barBackground: {
        height: 4,
        backgroundColor: COLORS.background,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    barNormal: {
        backgroundColor: COLORS.primary,
    },
    barBuffering: {
        backgroundColor: COLORS.record,
    },
    statusText: {
        fontFamily: 'Inter',
        fontSize: 12,
        color: COLORS.secondaryText,
        textAlign: 'center',
    },
});