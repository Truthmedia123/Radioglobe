import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useAlarmStore } from '../store/alarmStore';
import { Station } from '../api/radioBrowser';

interface AlarmModalProps {
    visible: boolean;
    onClose: () => void;
    station?: Station;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmModal: React.FC<AlarmModalProps> = ({ visible, onClose, station }) => {
    const { addAlarm, updateAlarm, editingAlarm, setEditingAlarm } = useAlarmStore();
    const [name, setName] = useState('');
    const [time, setTime] = useState(new Date());
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
    const [useFallbackTone, setUseFallbackTone] = useState(false);
    const [snoozeMinutes, setSnoozeMinutes] = useState(5);
    const [volume, setVolume] = useState(0.8);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (editingAlarm) {
            setName(editingAlarm.name);
            setTime(new Date(editingAlarm.time));
            setSelectedDays(editingAlarm.days);
            setUseFallbackTone(editingAlarm.useFallbackTone);
            setSnoozeMinutes(editingAlarm.snoozeMinutes);
            setVolume(editingAlarm.volume);
        } else {
            // Reset to defaults
            setName(station ? `Wake to ${station.name}` : 'Morning Alarm');
            setTime(new Date());
            setTime(prev => {
                const newTime = new Date(prev);
                newTime.setHours(7, 0, 0, 0); // Default to 7:00 AM
                return newTime;
            });
            setSelectedDays([1, 2, 3, 4, 5]);
            setUseFallbackTone(false);
            setSnoozeMinutes(5);
            setVolume(0.8);
        }
    }, [editingAlarm, station]);

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const toggleDay = (dayIndex: number) => {
        if (selectedDays.includes(dayIndex)) {
            setSelectedDays(selectedDays.filter(d => d !== dayIndex));
        } else {
            setSelectedDays([...selectedDays, dayIndex]);
        }
    };

    const handleSave = async () => {
        if (selectedDays.length === 0) {
            alert('Please select at least one day');
            return;
        }

        const alarmData = {
            name,
            time,
            days: selectedDays,
            station: station || undefined,
            stationUrl: station?.url_resolved,
            useFallbackTone,
            enabled: true,
            snoozeMinutes,
            volume,
        };

        try {
            if (editingAlarm) {
                await updateAlarm(editingAlarm.id, alarmData);
            } else {
                await addAlarm(alarmData);
            }
            onClose();
            setEditingAlarm(null);
        } catch (error) {
            console.error('Failed to save alarm:', error);
            alert('Failed to save alarm');
        }
    };

    const handleCancel = () => {
        setEditingAlarm(null);
        onClose();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {editingAlarm ? 'Edit Alarm' : 'Set New Alarm'}
                        </Text>
                        <TouchableOpacity onPress={handleCancel}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Alarm Name */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Alarm Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Morning Wake Up"
                                placeholderTextColor={COLORS.secondaryText}
                            />
                        </View>

                        {/* Time Picker */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Time</Text>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.timeText}>{formatTime(time)}</Text>
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={time}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                    style={styles.timePicker}
                                />
                            )}
                        </View>

                        {/* Days Selection */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Repeat</Text>
                            <View style={styles.daysContainer}>
                                {DAYS.map((day, index) => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayButton,
                                            selectedDays.includes(index) && styles.dayButtonSelected,
                                        ]}
                                        onPress={() => toggleDay(index)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                selectedDays.includes(index) && styles.dayTextSelected,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Audio Source */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Wake Up To</Text>
                            <View style={styles.audioSourceContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.audioSourceButton,
                                        !useFallbackTone && styles.audioSourceButtonSelected,
                                    ]}
                                    onPress={() => setUseFallbackTone(false)}
                                >
                                    <Text
                                        style={[
                                            styles.audioSourceText,
                                            !useFallbackTone && styles.audioSourceTextSelected,
                                        ]}
                                    >
                                        📻 Radio Station
                                    </Text>
                                    {station && (
                                        <Text style={styles.stationName} numberOfLines={1}>
                                            {station.name}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.audioSourceButton,
                                        useFallbackTone && styles.audioSourceButtonSelected,
                                    ]}
                                    onPress={() => setUseFallbackTone(true)}
                                >
                                    <Text
                                        style={[
                                            styles.audioSourceText,
                                            useFallbackTone && styles.audioSourceTextSelected,
                                        ]}
                                    >
                                        🔔 Alarm Tone
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Snooze Duration */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Snooze Duration</Text>
                            <View style={styles.snoozeContainer}>
                                {[5, 10, 15, 30].map((minutes) => (
                                    <TouchableOpacity
                                        key={minutes}
                                        style={[
                                            styles.snoozeButton,
                                            snoozeMinutes === minutes && styles.snoozeButtonSelected,
                                        ]}
                                        onPress={() => setSnoozeMinutes(minutes)}
                                    >
                                        <Text
                                            style={[
                                                styles.snoozeText,
                                                snoozeMinutes === minutes && styles.snoozeTextSelected,
                                            ]}
                                        >
                                            {minutes} min
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Volume */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Volume</Text>
                            <View style={styles.volumeContainer}>
                                <Text style={styles.volumeLabel}>Low</Text>
                                <View style={styles.volumeSliderContainer}>
                                    {[0, 1, 2, 3, 4].map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.volumeLevel,
                                                volume >= level * 0.25 && styles.volumeLevelActive,
                                            ]}
                                            onPress={() => setVolume(level * 0.25)}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.volumeLabel}>High</Text>
                            </View>
                            <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>
                                {editingAlarm ? 'Update Alarm' : 'Set Alarm'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.secondaryText,
        padding: 5,
    },
    content: {
        padding: 20,
    },
    field: {
        marginBottom: 24,
    },
    label: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    timeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    timeText: {
        ...TYPOGRAPHY.h2,
        fontSize: 32,
        color: COLORS.primary,
    },
    timePicker: {
        marginTop: 10,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayButtonSelected: {
        backgroundColor: COLORS.primary,
    },
    dayText: {
        color: COLORS.secondaryText,
        fontSize: 12,
        fontWeight: '600',
    },
    dayTextSelected: {
        color: COLORS.background,
    },
    audioSourceContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    audioSourceButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    audioSourceButtonSelected: {
        backgroundColor: 'rgba(245, 166, 35, 0.2)',
        borderColor: COLORS.primary,
    },
    audioSourceText: {
        color: COLORS.secondaryText,
        fontSize: 14,
        fontWeight: '600',
    },
    audioSourceTextSelected: {
        color: COLORS.primary,
    },
    stationName: {
        color: COLORS.secondaryText,
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    snoozeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    snoozeButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    snoozeButtonSelected: {
        backgroundColor: 'rgba(245, 166, 35, 0.2)',
        borderColor: COLORS.primary,
    },
    snoozeText: {
        color: COLORS.secondaryText,
        fontSize: 14,
    },
    snoozeTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    volumeLabel: {
        color: COLORS.secondaryText,
        fontSize: 12,
        width: 40,
    },
    volumeSliderContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
    },
    volumeLevel: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
    },
    volumeLevelActive: {
        backgroundColor: COLORS.primary,
    },
    volumeValue: {
        ...TYPOGRAPHY.data,
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.secondaryText,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
});