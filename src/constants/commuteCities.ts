export interface CommuteCity {
    city: string;
    country: string;
    countryCode: string;
    timeZone: string;
    icon?: string; // For future use
}

export const COMMUTE_CITIES: CommuteCity[] = [
    {
        city: 'Tokyo',
        country: 'Japan',
        countryCode: 'JP',
        timeZone: 'Asia/Tokyo',
    },
    {
        city: 'New York',
        country: 'United States',
        countryCode: 'US',
        timeZone: 'America/New_York',
    },
    {
        city: 'London',
        country: 'United Kingdom',
        countryCode: 'GB',
        timeZone: 'Europe/London',
    },
    {
        city: 'Paris',
        country: 'France',
        countryCode: 'FR',
        timeZone: 'Europe/Paris',
    },
    {
        city: 'Sydney',
        country: 'Australia',
        countryCode: 'AU',
        timeZone: 'Australia/Sydney',
    },
    {
        city: 'Mumbai',
        country: 'India',
        countryCode: 'IN',
        timeZone: 'Asia/Kolkata',
    },
    {
        city: 'São Paulo',
        country: 'Brazil',
        countryCode: 'BR',
        timeZone: 'America/Sao_Paulo',
    },
    {
        city: 'Shanghai',
        country: 'China',
        countryCode: 'CN',
        timeZone: 'Asia/Shanghai',
    },
    {
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        timeZone: 'Asia/Dubai',
    },
    {
        city: 'Cape Town',
        country: 'South Africa',
        countryCode: 'ZA',
        timeZone: 'Africa/Johannesburg',
    },
    {
        city: 'Mexico City',
        country: 'Mexico',
        countryCode: 'MX',
        timeZone: 'America/Mexico_City',
    },
    {
        city: 'Toronto',
        country: 'Canada',
        countryCode: 'CA',
        timeZone: 'America/Toronto',
    },
];

/**
 * Get current hour in a given timezone
 */
export function getCurrentHourInTimezone(timeZone: string): number {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour12: false,
            hour: '2-digit',
        });
        const parts = formatter.formatToParts(new Date());
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        return hour;
    } catch (error) {
        console.error(`Error getting hour for timezone ${timeZone}:`, error);
        return 0;
    }
}

/**
 * Filter cities where it's currently morning (7-9) or evening (17-19)
 */
export function getCommutingCities(): CommuteCity[] {
    const now = new Date();
    return COMMUTE_CITIES.filter(city => {
        const hour = getCurrentHourInTimezone(city.timeZone);
        return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    });
}

/**
 * Get gradient colors based on time of day
 */
export function getTimeOfDayGradient(hour: number): { start: string; end: string } {
    if (hour >= 7 && hour <= 9) {
        // Morning: dawn orange to soft yellow
        return {
            start: '#FF8C42',
            end: '#FFD166',
        };
    } else if (hour >= 17 && hour <= 19) {
        // Evening: sunset amber to deep purple
        return {
            start: '#F5A623',
            end: '#6A0572',
        };
    } else {
        // Default: night blue
        return {
            start: '#1A1F2E',
            end: '#0B0E14',
        };
    }
}