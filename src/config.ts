/**
 * Configuration for external APIs and services.
 * In production, these values should be loaded from environment variables.
 */

export const CONFIG = {
    // AudD API for song identification
    // Get a free API key from https://audd.io/
    AUDD_API_KEY: process.env.EXPO_PUBLIC_AUDD_API_KEY || 'demo_key_for_development',

    // Open-Meteo API for weather (already used in Weather Sync)
    OPEN_METEO_URL: 'https://api.open-meteo.com/v1/forecast',

    // Radio Browser API
    RADIO_BROWSER_URL: 'https://de1.api.radio-browser.info/json',

    // Mock mode for development
    MOCK_MODE: __DEV__, // Use mock data in development
} as const;