import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { songIdentificationService } from '../services/songIdentification';
import { usePlayerStore } from '../store/playerStore';

export const SongIdentifier: React.FC = () => {
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [identificationResult, setIdentificationResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { currentStation } = usePlayerStore();

    const handleIdentifySong = async () => {
        if (!currentStation) {
            setError('No station playing');
            return;
        }

        setIsIdentifying(true);
        setError(null);
        setIdentificationResult(null);

        try {
            const result = await songIdentificationService.identifyCurrentSong();

            if (result) {
                setIdentificationResult(result);
            } else {
                setError('Could not identify song');
            }
        } catch (err) {
            console.error('Song identification error:', err);
            setError('Identification failed');
        } finally {
            setIsIdentifying(false);
        }
    };

    const handleCloseResult = () => {
        setIdentificationResult(null);
        setError(null);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, isIdentifying && styles.buttonActive]}
                onPress={handleIdentifySong}
                disabled={isIdentifying}
            >
                {isIdentifying ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.buttonText}>🎵 Identify Song</Text>
                )}
            </TouchableOpacity>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleCloseResult}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}

            {identificationResult && (
                <View style={styles.resultContainer}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultTitle}>Song Identified</Text>
                        <TouchableOpacity onPress={handleCloseResult}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.songTitle}>{identificationResult.title}</Text>
                    <Text style={styles.songArtist}>{identificationResult.artist}</Text>

                    {identificationResult.album && (
                        <Text style={styles.songAlbum}>Album: {identificationResult.album}</Text>
                    )}

                    {identificationResult.confidence && (
                        <Text style={styles.confidenceText}>
                            Confidence: {Math.round(identificationResult.confidence * 100)}%
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    button: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    buttonActive: {
        backgroundColor: COLORS.background,
        opacity: 0.8,
    },
    buttonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: COLORS.surface,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
        padding: 12,
        marginTop: 8,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        ...TYPOGRAPHY.body,
        color: COLORS.secondaryText,
        fontSize: 14,
        flex: 1,
    },
    resultContainer: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 16,
        marginTop: 8,
        borderRadius: 12,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.primary,
    },
    closeText: {
        fontSize: 18,
        color: COLORS.secondaryText,
        paddingHorizontal: 8,
    },
    songTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        color: COLORS.text,
        marginBottom: 4,
    },
    songArtist: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        color: COLORS.secondaryText,
        marginBottom: 8,
    },
    songAlbum: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    confidenceText: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.record,
        marginTop: 4,
    },
});