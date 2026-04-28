import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface WeatherInfo {
    temperature: number;
    weatherCode: number;
    description: string;
    moodTags: string[];
    location: {
        latitude: number;
        longitude: number;
        city?: string;
    } | null;
    isLoading: boolean;
    error: string | null;
}

// Mapping of WMO weather codes to mood tags
const WEATHER_CODE_TO_MOOD: Record<number, string[]> = {
    0: ['pop', 'tropical house'], // Clear sky
    1: ['ambient', 'chillout'], // Mainly clear
    2: ['ambient', 'chillout'], // Partly cloudy
    3: ['ambient', 'chillout'], // Overcast
    45: ['experimental', 'ambient'], // Fog
    48: ['experimental', 'ambient'], // Depositing rime fog
    51: ['jazz', 'lounge'], // Light drizzle
    53: ['jazz', 'lounge'], // Moderate drizzle
    55: ['jazz', 'lounge'], // Dense drizzle
    56: ['jazz', 'lounge'], // Light freezing drizzle
    57: ['jazz', 'lounge'], // Dense freezing drizzle
    61: ['jazz', 'lounge'], // Slight rain
    63: ['jazz', 'lounge'], // Moderate rain
    65: ['jazz', 'lounge'], // Heavy rain
    66: ['jazz', 'lounge'], // Light freezing rain
    67: ['jazz', 'lounge'], // Heavy freezing rain
    71: ['classical', 'lullaby'], // Slight snow fall
    73: ['classical', 'lullaby'], // Moderate snow fall
    75: ['classical', 'lullaby'], // Heavy snow fall
    77: ['classical', 'lullaby'], // Snow grains
    80: ['jazz', 'lounge'], // Slight rain showers
    81: ['jazz', 'lounge'], // Moderate rain showers
    82: ['jazz', 'lounge'], // Violent rain showers
    85: ['classical', 'lullaby'], // Slight snow showers
    86: ['classical', 'lullaby'], // Heavy snow showers
    95: ['ambient', 'dark'], // Thunderstorm
    96: ['ambient', 'dark'], // Thunderstorm with slight hail
    99: ['ambient', 'dark'], // Thunderstorm with heavy hail
};

const DEFAULT_LOCATION = {
    latitude: 51.5074, // London
    longitude: -0.1278,
    city: 'London',
};

export function useWeatherSync(): WeatherInfo {
    const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
        temperature: 0,
        weatherCode: 0,
        description: 'Clear',
        moodTags: ['pop', 'tropical house'],
        location: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        const fetchWeather = async () => {
            try {
                // Request location permission
                const { status } = await Location.requestForegroundPermissionsAsync();

                let location = DEFAULT_LOCATION;

                if (status === 'granted') {
                    const currentLocation = await Location.getCurrentPositionAsync({});
                    location = {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        city: 'Your Location',
                    };
                }

                // Fetch weather from Open-Meteo API
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch weather');
                }

                const data = await response.json();
                const current = data.current_weather;

                const weatherCode = current.weathercode;
                const temperature = current.temperature;
                const description = getWeatherDescription(weatherCode);
                const moodTags = WEATHER_CODE_TO_MOOD[weatherCode] || ['ambient', 'chillout'];

                if (mounted) {
                    setWeatherInfo({
                        temperature,
                        weatherCode,
                        description,
                        moodTags,
                        location,
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error) {
                console.error('Weather fetch error:', error);
                if (mounted) {
                    setWeatherInfo(prev => ({
                        ...prev,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    }));
                }
            }
        };

        fetchWeather();

        // Refresh every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return weatherInfo;
}

function getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Heavy thunderstorm with hail',
    };

    return descriptions[code] || 'Unknown';
}