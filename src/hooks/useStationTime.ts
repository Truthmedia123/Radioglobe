import { useEffect, useState } from 'react';
import { getTimezoneForCountry } from '../constants/timezones';

export interface StationTimeInfo {
    timeString: string;
    timeZone: string;
    hour: number;
    minute: number;
    second: number;
    isUnknown: boolean;
}

export function useStationTime(countryCode: string | null | undefined): StationTimeInfo {
    const [time, setTime] = useState<StationTimeInfo>({
        timeString: '--:--',
        timeZone: 'UTC',
        hour: 0,
        minute: 0,
        second: 0,
        isUnknown: true,
    });

    useEffect(() => {
        if (!countryCode) {
            setTime({
                timeString: '--:--',
                timeZone: 'UTC',
                hour: 0,
                minute: 0,
                second: 0,
                isUnknown: true,
            });
            return;
        }

        const timeZone = getTimezoneForCountry(countryCode);
        const isUnknown = timeZone === 'UTC' && countryCode !== 'UTC';

        const updateTime = () => {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                const parts = formatter.formatToParts(now);
                const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
                const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
                const second = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);

                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                setTime({
                    timeString,
                    timeZone,
                    hour,
                    minute,
                    second,
                    isUnknown,
                });
            } catch (error) {
                console.error('Error formatting time:', error);
                setTime({
                    timeString: '--:--',
                    timeZone: 'UTC',
                    hour: 0,
                    minute: 0,
                    second: 0,
                    isUnknown: true,
                });
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [countryCode]);

    return time;
}