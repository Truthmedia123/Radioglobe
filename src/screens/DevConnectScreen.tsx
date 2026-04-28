import React, { useState, useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { QRCode } from '../components/QRCode';

interface DevConnectScreenProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Temporary debugging screen to display Expo dev server QR code
 * for easy connection during testing
 */
export const DevConnectScreen: React.FC<DevConnectScreenProps> = ({ visible, onClose }) => {
    const [expoUrl, setExpoUrl] = useState<string>('');

    useEffect(() => {
        // Get the local IP address for the Expo dev server
        // Using the actual IP address for the development machine
        const localIp = '10.236.232.17'; // Actual local IP address
        const port = 8081; // Default Expo port

        const url = `exp://${localIp}:${port}`;
        setExpoUrl(url);
    }, []);

    const handleCopyUrl = async () => {
        if (!expoUrl) return;

        try {
            await Clipboard.setStringAsync(expoUrl);
            Alert.alert('Copied!', 'Expo server URL copied to clipboard');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy URL to clipboard');
            console.error('Copy failed:', error);
        }
    };

    const handleOpenInstructions = () => {
        Alert.alert(
            'How to Connect',
            '1. Make sure your phone is on the same Wi-Fi network as the development machine\n' +
            '2. Scan the QR code with Expo Go app\n' +
            '3. Or copy the URL and paste it in Expo Go\n\n' +
            'Current development server IP: 10.236.232.17:8081',
            [{ text: 'OK' }]
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Connect to Dev Server</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.subtitle}>
                        Scan this QR code with Expo Go to connect to the development server
                    </Text>

                    <View style={styles.qrContainer}>
                        <QRCode value={expoUrl} size={240} />
                    </View>

                    <View style={styles.urlContainer}>
                        <Text style={styles.urlLabel}>Expo Server URL:</Text>
                        <Text style={styles.urlText} selectable={true}>
                            {expoUrl}
                        </Text>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleCopyUrl}>
                            <Text style={styles.buttonText}>Copy URL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleOpenInstructions}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                Instructions
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.noteContainer}>
                        <Text style={styles.noteTitle}>Note:</Text>
                        <Text style={styles.noteText}>
                            This screen is for development testing only. It will be removed in production.
                            Using development server at 10.236.232.17:8081.
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 24,
        color: COLORS.text,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20,
    },
    qrContainer: {
        marginBottom: 32,
    },
    urlContainer: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    urlLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    urlText: {
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: 14,
        color: COLORS.secondaryText,
        lineHeight: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.background,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        color: COLORS.primary,
    },
    noteContainer: {
        backgroundColor: 'rgba(245, 166, 35, 0.1)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.3)',
        width: '100%',
    },
    noteTitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.primary,
        marginBottom: 8,
        fontWeight: '600',
    },
    noteText: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.secondaryText,
        lineHeight: 18,
    },
});

export default DevConnectScreen;