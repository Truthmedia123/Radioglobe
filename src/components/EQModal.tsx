import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useEQStore } from '../store/eqStore';
import { EQPreset } from '../services/eqService';

interface EQModalProps {
    visible: boolean;
    onClose: () => void;
}

export const EQModal: React.FC<EQModalProps> = ({ visible, onClose }) => {
    const {
        enabled,
        bass,
        treble,
        balance,
        volume,
        presetId,
        presets,
        setEnabled,
        setBass,
        setTreble,
        setBalance,
        setVolume,
        applyPreset,
        reset,
    } = useEQStore();

    const [selectedPreset, setSelectedPreset] = useState<string | undefined>(presetId);

    const handlePresetSelect = async (preset: EQPreset) => {
        setSelectedPreset(preset.id);
        await applyPreset(preset.id);
    };

    const handleReset = async () => {
        await reset();
        setSelectedPreset(undefined);
    };

    const formatDb = (value: number) => {
        if (value === 0) return '0 dB';
        return value > 0 ? `+${value} dB` : `${value} dB`;
    };

    const formatBalance = (value: number) => {
        if (value === 0) return 'Center';
        return value > 0 ? `Right ${value.toFixed(1)}` : `Left ${Math.abs(value).toFixed(1)}`;
    };

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
                        <Text style={styles.title}>Equalizer</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* EQ Toggle */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Enable EQ</Text>
                            <Switch
                                value={enabled}
                                onValueChange={setEnabled}
                                trackColor={{ false: '#767577', true: COLORS.primary }}
                                thumbColor={enabled ? '#f4f3f4' : '#f4f3f4'}
                            />
                        </View>

                        {/* Presets */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Presets</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.presetsContainer}>
                                    {presets.map((preset) => (
                                        <TouchableOpacity
                                            key={preset.id}
                                            style={[
                                                styles.presetButton,
                                                selectedPreset === preset.id && styles.presetButtonSelected,
                                            ]}
                                            onPress={() => handlePresetSelect(preset)}
                                        >
                                            <Text
                                                style={[
                                                    styles.presetName,
                                                    selectedPreset === preset.id && styles.presetNameSelected,
                                                ]}
                                            >
                                                {preset.name}
                                            </Text>
                                            <Text style={styles.presetDescription}>{preset.description}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Bass Control */}
                        <View style={styles.section}>
                            <View style={styles.controlHeader}>
                                <Text style={styles.controlLabel}>Bass</Text>
                                <Text style={styles.controlValue}>{formatDb(bass)}</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={-10}
                                maximumValue={10}
                                step={1}
                                value={bass}
                                onValueChange={setBass}
                                minimumTrackTintColor={COLORS.primary}
                                maximumTrackTintColor={COLORS.secondaryText}
                                thumbTintColor={COLORS.primary}
                                disabled={!enabled}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>-10 dB</Text>
                                <Text style={styles.sliderLabel}>0 dB</Text>
                                <Text style={styles.sliderLabel}>+10 dB</Text>
                            </View>
                        </View>

                        {/* Treble Control */}
                        <View style={styles.section}>
                            <View style={styles.controlHeader}>
                                <Text style={styles.controlLabel}>Treble</Text>
                                <Text style={styles.controlValue}>{formatDb(treble)}</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={-10}
                                maximumValue={10}
                                step={1}
                                value={treble}
                                onValueChange={setTreble}
                                minimumTrackTintColor={COLORS.primary}
                                maximumTrackTintColor={COLORS.secondaryText}
                                thumbTintColor={COLORS.primary}
                                disabled={!enabled}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>-10 dB</Text>
                                <Text style={styles.sliderLabel}>0 dB</Text>
                                <Text style={styles.sliderLabel}>+10 dB</Text>
                            </View>
                        </View>

                        {/* Balance Control */}
                        <View style={styles.section}>
                            <View style={styles.controlHeader}>
                                <Text style={styles.controlLabel}>Balance</Text>
                                <Text style={styles.controlValue}>{formatBalance(balance)}</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={-1}
                                maximumValue={1}
                                step={0.1}
                                value={balance}
                                onValueChange={setBalance}
                                minimumTrackTintColor={COLORS.primary}
                                maximumTrackTintColor={COLORS.secondaryText}
                                thumbTintColor={COLORS.primary}
                                disabled={!enabled}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>Left</Text>
                                <Text style={styles.sliderLabel}>Center</Text>
                                <Text style={styles.sliderLabel}>Right</Text>
                            </View>
                        </View>

                        {/* Volume Control */}
                        <View style={styles.section}>
                            <View style={styles.controlHeader}>
                                <Text style={styles.controlLabel}>Master Volume</Text>
                                <Text style={styles.controlValue}>{Math.round(volume * 100)}%</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.05}
                                value={volume}
                                onValueChange={setVolume}
                                minimumTrackTintColor={COLORS.primary}
                                maximumTrackTintColor={COLORS.secondaryText}
                                thumbTintColor={COLORS.primary}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>0%</Text>
                                <Text style={styles.sliderLabel}>50%</Text>
                                <Text style={styles.sliderLabel}>100%</Text>
                            </View>
                        </View>

                        {/* Reset Button */}
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Reset to Default</Text>
                        </TouchableOpacity>
                    </ScrollView>
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
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
    },
    toggleLabel: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    presetsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    presetButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    presetButtonSelected: {
        backgroundColor: 'rgba(245, 166, 35, 0.2)',
        borderColor: COLORS.primary,
    },
    presetName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    presetNameSelected: {
        color: COLORS.primary,
    },
    presetDescription: {
        color: COLORS.secondaryText,
        fontSize: 12,
    },
    controlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    controlLabel: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
    },
    controlValue: {
        ...TYPOGRAPHY.data,
        fontSize: 14,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    sliderLabel: {
        color: COLORS.secondaryText,
        fontSize: 12,
    },
    resetButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    resetButtonText: {
        color: COLORS.secondaryText,
        fontSize: 16,
        fontWeight: '600',
    },
});