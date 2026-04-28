import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { Station } from '../api/radioBrowser';
import { useRecordingStore } from '../store/recordingStore';
import { recordingService } from '../services/recordingService';

interface ScheduleRecordingModalProps {
    visible: boolean;
    onClose: () => void;
    station?: Station;
}

export const ScheduleRecordingModal: React.FC<ScheduleRecordingModalProps> = ({
    visible,
    onClose,
    station,
}) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('30'); // minutes
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addScheduledRecording, setRecordingModalOpen } = useRecordingStore();

    const handleSchedule = async () => {
        if (!station) {
            alert('Please select a station first');
            return;
        }

        if (!title.trim()) {
            alert('Please enter a title for the recording');
            return;
        }

        setIsSubmitting(true);

        try {
            const scheduledRecording = await recordingService.scheduleRecording(
                station,
                date,
                parseInt(duration, 10),
                title
            );

            // Add to store
            addScheduledRecording(scheduledRecording);

            // Show success message
            alert(`Recording "${title}" scheduled for ${date.toLocaleString()}`);

            // Reset form and close modal
            setTitle('');
            setDuration('30');
            setDate(new Date());
            onClose();
        } catch (error) {
            console.error('Failed to schedule recording:', error);
            alert('Failed to schedule recording. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(date);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setDate(newDate);
        }
    };

    const durationOptions = ['15', '30', '45', '60', '90', '120'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Schedule Recording</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {station && (
                            <View style={styles.stationInfo}>
                                <Text style={styles.label}>Station</Text>
                                <Text style={styles.stationName}>{station.name}</Text>
                                <Text style={styles.stationDetails}>
                                    {station.country} • {station.language}
                                </Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Recording Title</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Morning News, Evening Jazz, etc."
                                placeholderTextColor={COLORS.secondaryText}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Date & Time</Text>
                            <View style={styles.datetimeRow}>
                                <TouchableOpacity
                                    style={styles.datetimeButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.datetimeText}>
                                        {date.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.datetimeButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.datetimeText}>
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Duration (minutes)</Text>
                            <View style={styles.durationOptions}>
                                {durationOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.durationOption,
                                            duration === option && styles.durationOptionSelected,
                                        ]}
                                        onPress={() => setDuration(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.durationOptionText,
                                                duration === option && styles.durationOptionTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.input}
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                placeholder="Custom duration"
                                placeholderTextColor={COLORS.secondaryText}
                            />
                        </View>

                        <View style={styles.note}>
                            <Text style={styles.noteText}>
                                Note: The recording will start automatically at the scheduled time.
                                Make sure the app has background permissions enabled.
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.scheduleButton, isSubmitting && styles.buttonDisabled]}
                            onPress={handleSchedule}
                            disabled={isSubmitting || !station}
                        >
                            <Text style={styles.scheduleButtonText}>
                                {isSubmitting ? 'Scheduling...' : 'Schedule Recording'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.background,
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
        borderBottomColor: COLORS.surface,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.secondaryText,
    },
    content: {
        padding: 20,
    },
    stationInfo: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
    },
    stationName: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        marginBottom: 4,
    },
    stationDetails: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.surface,
        fontFamily: 'Inter_400Regular',
    },
    datetimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    datetimeButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    datetimeText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    durationOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    durationOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
    },
    durationOptionSelected: {
        backgroundColor: COLORS.primary,
    },
    durationOptionText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text,
    },
    durationOptionTextSelected: {
        color: COLORS.background,
    },
    note: {
        marginTop: 20,
        padding: 16,
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.record,
    },
    noteText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text,
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.surface,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
    },
    scheduleButton: {
        backgroundColor: COLORS.primary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    cancelButtonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.text,
    },
    scheduleButtonText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.background,
    },
});