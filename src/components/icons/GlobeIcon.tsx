import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface GlobeIconProps {
    size?: number;
    color?: string;
    active?: boolean;
}

export const GlobeIcon: React.FC<GlobeIconProps> = ({
    size = 24,
    color = COLORS.secondaryText,
    active = false
}) => {
    const strokeColor = active ? COLORS.primary : color;
    const strokeWidth = 2;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M3 12H21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M12 3C15.866 3 19 5.23858 19 8C19 10.7614 15.866 13 12 13C8.13401 13 5 10.7614 5 8C5 5.23858 8.13401 3 12 3Z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M12 13C15.866 13 19 15.2386 19 18C19 20.7614 15.866 23 12 23C8.13401 23 5 20.7614 5 18C5 15.2386 8.13401 13 12 13Z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
    );
};