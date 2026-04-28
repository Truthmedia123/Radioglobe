import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';

export const QualityIndicator: React.FC = () => {
    const { networkType, isEcoMode, streamQuality } = usePlayerStore();

    if (networkType === 'unknown' || networkType === 'none') {
        return null;
    }

    const getNetworkIcon = () => {
        switch (networkType) {
            case 'wifi': return '📶';
            case 'cellular': return '📱';
            case 'ethernet': return '🔌';
            default: return '🌐';
        }
    };

    const getQualityLabel = () => {
        if (isEcoMode) return 'ECO';
        switch (streamQuality) {
            case 'low': return 'LOW';
            case 'medium': return 'MED';
            case 'high': return 'HIGH';
            case 'adaptive': return 'AUTO';
            default: return 'AUTO';
        }
    };

    const getQualityColor = () => {
        if (isEcoMode) return COLORS.record;
        switch (streamQuality) {
            case 'low': return COLORS.error;
            case 'medium': return COLORS.primary;
            case 'high': return COLORS.record;
            case 'adaptive': return COLORS.primary;
            default: return COLORS.primary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.indicator, { backgroundColor: getQualityColor() }]}>
                <Text style={styles.icon}>{getNetworkIcon()}</Text>
                <Text style={styles.label}>{getQualityLabel()}</Text>
            </View>

            <Text style={styles.networkText}>
                {networkType === 'cellular' ? 'Cellular - Eco mode' :
                    networkType === 'wifi' ? 'WiFi - High quality' :
                        networkType === 'ethernet' ? 'Ethernet - Best quality' : 'Unknown network'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 8,
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 4,
    },
    icon: {
        fontSize: 14,
        marginRight: 6,
    },
    label: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.background,
        letterSpacing: 0.5,
    },
    networkText: {
        ...TYPOGRAPHY.body,
        fontSize: 12,
        color: COLORS.secondaryText,
    },
});