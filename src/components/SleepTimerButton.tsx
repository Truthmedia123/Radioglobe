import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useSleepTimer } from '../services/sleepTimerService';

const DURATIONS = [
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
    { label: '90 min', minutes: 90 },
    { label: 'Off', minutes: 0 },
];

export const SleepTimerButton: React.FC = () => {
    const { isActive, remainingSeconds, startTimer, stopTimer } = useSleepTimer();
    const [showModal, setShowModal] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isActive) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, fadeAnim]);

    const handleDurationSelect = (minutes: number) => {
        if (minutes === 0) {
            stopTimer();
        } else {
            startTimer(minutes);
        }
        setShowModal(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🌙</Text>
                    {isActive && (
                        <Animated.View style={[styles.activeDot, { opacity: fadeAnim }]} />
                    )}
                </View>
                <Text style={styles.label}>
                    {isActive ? formatTime(remainingSeconds) : 'Sleep'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sleep Timer</Text>
                        <Text style={styles.modalDescription}>
                            Audio will fade out gradually when timer ends
                        </Text>

                        <View style={styles.durationsGrid}>
                            {DURATIONS.map((duration) => (
                                <TouchableOpacity
                                    key={duration.minutes}
                                    style={[
                                        styles.durationButton,
                                        isActive && duration.minutes === 0 && styles.stopButton,
                                    ]}
                                    onPress={() => handleDurationSelect(duration.minutes)}
                                >
                                    <Text style={[
                                        styles.durationText,
                                        isActive && duration.minutes === 0 && styles.stopButtonText,
                                    ]}>
                                        {duration.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isActive && (
                            <View style={styles.activeTimer}>
                                <Text style={styles.activeTimerText}>
                                    Timer active: {formatTime(remainingSeconds)} remaining
                                </Text>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => handleDurationSelect(0)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel Timer</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    iconContainer: {
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    icon: {
        fontSize: 20,
    },
    activeDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.record,
    },
    label: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.secondaryText,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 24,
        width: '80%',
        maxWidth: 300,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 8,
    },
    modalDescription: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        textAlign: 'center',
        marginBottom: 24,
    },
    durationsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    durationButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    durationText: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        color: COLORS.text,
    },
    stopButton: {
        backgroundColor: 'rgba(227, 74, 74, 0.2)',
        borderColor: COLORS.error,
    },
    stopButtonText: {
        color: COLORS.error,
    },
    activeTimer: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeTimerText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 12,
    },
    cancelButton: {
        backgroundColor: 'rgba(227, 74, 74, 0.2)',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    cancelButtonText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.error,
    },
});