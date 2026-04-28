import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';

export interface QRCodeProps {
    value: string;
    size?: number;
}

/**
 * Reusable QR code component with app theme styling
 * Uses Warm Signal Amber (#F5A623) on Deep Receiving Black (#0B0E14) background
 */
export const QRCode: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
    return (
        <View style={styles.container}>
            <View style={styles.qrBorder}>
                <QRCodeSVG
                    value={value}
                    size={size}
                    color={COLORS.primary} // Warm Signal Amber
                    backgroundColor={COLORS.background} // Deep Receiving Black
                    logoSize={0}
                    logoMargin={0}
                    logoBorderRadius={0}
                    quietZone={8}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    qrBorder: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.3)', // Amber glow
        backgroundColor: COLORS.background,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default QRCode;