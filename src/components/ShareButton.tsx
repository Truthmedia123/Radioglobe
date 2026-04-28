/**
 * Share Button Component
 * 
 * Provides sharing functionality for stations with deep linking support.
 * Integrates with the deep linking service to generate shareable links.
 */

import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Station } from '../api/radioBrowser';
import { deepLinkService } from '../services/deepLinkService';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

interface ShareButtonProps {
    station: Station;
    compact?: boolean;
    onShareComplete?: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    station,
    compact = false,
    onShareComplete,
}) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [isGeneratingLink, setGeneratingLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string>('');

    const handleSharePress = async () => {
        if (compact) {
            // Compact mode: directly share without showing modal
            await shareStation();
        } else {
            // Full mode: show modal with options
            setModalVisible(true);
            await generateLink();
        }
    };

    const generateLink = async () => {
        setGeneratingLink(true);
        try {
            const link = await deepLinkService.createShareableLink({
                station,
                useFirebase: true,
                shortLink: true,
            });
            setGeneratedLink(link);
        } catch (error) {
            console.error('ShareButton: Failed to generate link', error);
            Alert.alert('Error', 'Could not generate share link. Please try again.');
        } finally {
            setGeneratingLink(false);
        }
    };

    const shareStation = async () => {
        try {
            await deepLinkService.shareStation(station);
            onShareComplete?.();
        } catch (error) {
            console.error('ShareButton: Failed to share station', error);
            // Error is already handled by the service
        }
    };

    const copyToClipboard = async () => {
        // In a real app, you would use Clipboard API
        // For now, we'll just show an alert
        Alert.alert('Link Copied', 'Station link has been copied to clipboard.');
        setModalVisible(false);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setGeneratedLink('');
    };

    if (compact) {
        return (
            <TouchableOpacity style={styles.compactButton} onPress={handleSharePress}>
                <Text style={styles.compactIcon}>🔗</Text>
            </TouchableOpacity>
        );
    }

    return (
        <>
            <TouchableOpacity style={styles.button} onPress={handleSharePress}>
                <Text style={styles.icon}>🔗</Text>
                <Text style={styles.label}>Share</Text>
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Share Station</Text>
                        <Text style={styles.stationName}>{station.name}</Text>
                        <Text style={styles.stationDetails}>
                            {station.country} • {station.language}
                        </Text>

                        {isGeneratingLink ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={styles.loadingText}>Generating share link...</Text>
                            </View>
                        ) : generatedLink ? (
                            <View style={styles.linkContainer}>
                                <Text style={styles.linkLabel}>Shareable Link:</Text>
                                <Text style={styles.linkText} numberOfLines={2}>
                                    {generatedLink}
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton]}
                                onPress={copyToClipboard}
                                disabled={!generatedLink}
                            >
                                <Text style={styles.modalButtonText}>Copy Link</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.primaryButton]}
                                onPress={shareStation}
                                disabled={!generatedLink}
                            >
                                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                                    Share Now
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: COLORS.secondaryText,
        minWidth: 100,
    },
    icon: {
        fontSize: 18,
        marginRight: 8,
    },
    label: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontWeight: '500',
    },
    compactButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.secondaryText,
    },
    compactIcon: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: COLORS.secondaryText,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    stationName: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
        color: COLORS.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    stationDetails: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginBottom: 24,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    loadingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.secondaryText,
        marginTop: 12,
    },
    linkContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.secondaryText,
    },
    linkLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginBottom: 8,
    },
    linkText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontFamily: 'monospace',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.secondaryText,
    },
    modalButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: COLORS.background,
    },
    closeButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.secondaryText,
    },
    closeButtonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.secondaryText,
    },
});

export default ShareButton;