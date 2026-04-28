import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface DialIconProps {
    size?: number;
    color?: string;
    active?: boolean;
}

export const DialIcon: React.FC<DialIconProps> = ({
    size = 24,
    color = COLORS.secondaryText,
    active = false
}) => {
    const strokeColor = active ? COLORS.primary : color;
    const strokeWidth = 2;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Circle cx="12" cy="12" r="3" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="12" y1="3" x2="12" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="12" y1="18" x2="12" y2="21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="3" y1="12" x2="6" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="18" y1="12" x2="21" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M12 9L14 7" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M12 15L10 17" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
    );
};