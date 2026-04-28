import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface ArchiveIconProps {
    size?: number;
    color?: string;
    active?: boolean;
}

export const ArchiveIcon: React.FC<ArchiveIconProps> = ({
    size = 24,
    color = COLORS.secondaryText,
    active = false
}) => {
    const strokeColor = active ? COLORS.primary : color;
    const strokeWidth = 2;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="16" rx="2" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M8 8H16" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M8 12H16" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M8 16H14" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M3 10H21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
    );
};