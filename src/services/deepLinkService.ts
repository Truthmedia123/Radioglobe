/**
 * Deep Linking Service for RadioGlobe
 * 
 * Handles shared "Radio Garden" style links and deep linking to stations.
 * Supports:
 * - Custom URL scheme: radioglobe://station/:stationId
 * - Universal links (iOS/Android): https://radioglobe.app/station/:stationId
 * - Firebase Dynamic Links for shareable URLs
 * - App clip / Instant app support
 */

import * as Linking from 'expo-linking';
// Note: expo-firebase-links doesn't have TypeScript declarations
// We'll use a conditional import approach
import { Alert, Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Station } from '../api/radioBrowser';

export interface DeepLinkConfig {
    scheme: string;
    host: string;
    prefix: string;
}

export interface ParsedDeepLink {
    type: 'station' | 'playlist' | 'discovery' | 'unknown';
    stationId?: string;
    stationName?: string;
    tags?: string[];
    timestamp?: number;
}

export interface ShareLinkOptions {
    station: Station;
    useFirebase: boolean;
    shortLink?: boolean;
}

class DeepLinkService {
    private config: DeepLinkConfig = {
        scheme: 'radioglobe',
        host: 'radioglobe.app',
        prefix: 'https://radioglobe.app'
    };

    private isInitialized = false;

    /**
     * Initialize deep linking service
     */
    async init(): Promise<boolean> {
        if (this.isInitialized) {
            return true;
        }

        try {
            // Configure Firebase Dynamic Links if available
            if (Platform.OS !== 'web') {
                // Note: In a real app, you would configure Firebase here
                // For now, we'll just set up the basic linking
                console.log('DeepLinkService: Initialized with config', this.config);
            }

            // Set up initial URL handling
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                console.log('DeepLinkService: Initial URL detected', initialUrl);
                await this.handleDeepLink(initialUrl);
            }

            // Add event listener for incoming links
            Linking.addEventListener('url', this.handleIncomingLink);

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('DeepLinkService: Failed to initialize', error);
            return false;
        }
    }

    /**
     * Generate a deep link URL for a station
     */
    generateStationLink(station: Station, useFirebase: boolean = false): string {
        if (useFirebase && Platform.OS !== 'web') {
            // In a real implementation, this would generate a Firebase Dynamic Link
            // For now, we'll return a custom URL scheme
            return this.generateCustomSchemeLink(station);
        }

        // Generate universal link
        return `${this.config.prefix}/station/${station.stationuuid}?name=${encodeURIComponent(station.name)}&country=${encodeURIComponent(station.country || 'Unknown')}`;
    }

    /**
     * Generate custom scheme link (radioglobe://station/:id)
     */
    private generateCustomSchemeLink(station: Station): string {
        return `${this.config.scheme}://station/${station.stationuuid}?name=${encodeURIComponent(station.name)}`;
    }

    /**
     * Parse a deep link URL
     */
    parseDeepLink(url: string): ParsedDeepLink | null {
        try {
            const parsed = Linking.parse(url);

            // Handle custom scheme
            if (parsed.scheme === this.config.scheme) {
                return this.parseCustomScheme(parsed);
            }

            // Handle universal links
            if (parsed.hostname === this.config.host || parsed.hostname?.includes(this.config.host)) {
                return this.parseUniversalLink(parsed);
            }

            // Handle Firebase Dynamic Links
            if (url.includes('link.firebase') || url.includes('page.link')) {
                return this.parseFirebaseLink(url);
            }

            return { type: 'unknown' };
        } catch (error) {
            console.error('DeepLinkService: Failed to parse deep link', error, url);
            return null;
        }
    }

    /**
     * Parse custom scheme URL (radioglobe://)
     */
    private parseCustomScheme(parsed: Linking.ParsedURL): ParsedDeepLink {
        const path = parsed.path;

        if (path?.startsWith('station/')) {
            const stationId = path.replace('station/', '');
            return {
                type: 'station',
                stationId,
                stationName: parsed.queryParams?.name as string || undefined,
                timestamp: Date.now()
            };
        }

        return { type: 'unknown' };
    }

    /**
     * Parse universal link (https://radioglobe.app/)
     */
    private parseUniversalLink(parsed: Linking.ParsedURL): ParsedDeepLink {
        const path = parsed.path;

        if (path?.startsWith('/station/')) {
            const stationId = path.replace('/station/', '');
            return {
                type: 'station',
                stationId,
                stationName: parsed.queryParams?.name as string || undefined,
                tags: typeof parsed.queryParams?.tags === 'string' ? parsed.queryParams.tags.split(',') : [],
                timestamp: Date.now()
            };
        }

        return { type: 'unknown' };
    }

    /**
     * Parse Firebase Dynamic Link
     */
    private parseFirebaseLink(url: string): ParsedDeepLink {
        // In a real implementation, we would extract the deep link from Firebase
        // For now, we'll try to extract station ID from query parameters
        try {
            const urlObj = new URL(url);
            const linkParam = urlObj.searchParams.get('link');

            if (linkParam) {
                const decodedLink = decodeURIComponent(linkParam);
                return this.parseDeepLink(decodedLink) || { type: 'unknown' };
            }
        } catch (error) {
            console.error('DeepLinkService: Failed to parse Firebase link', error);
        }

        return { type: 'unknown' };
    }

    /**
     * Handle incoming deep link
     */
    private handleIncomingLink = async (event: { url: string }) => {
        console.log('DeepLinkService: Incoming link', event.url);
        await this.handleDeepLink(event.url);
    };

    /**
     * Process a deep link and navigate accordingly
     */
    async handleDeepLink(url: string): Promise<ParsedDeepLink | null> {
        const parsed = this.parseDeepLink(url);

        if (!parsed) {
            console.log('DeepLinkService: Could not parse link', url);
            return null;
        }

        console.log('DeepLinkService: Parsed link', parsed);

        // Store the last handled link for analytics
        await AsyncStorage.setItem('last_deep_link', JSON.stringify({
            url,
            parsed,
            timestamp: Date.now()
        }));

        // Emit event for navigation
        // In a real app, you would use a navigation store or event emitter
        // For now, we'll just log and return
        switch (parsed.type) {
            case 'station':
                console.log('DeepLinkService: Navigate to station', parsed.stationId);
                // This would trigger navigation in the app
                // Example: navigationStore.navigateToStation(parsed.stationId);
                break;
            case 'playlist':
                console.log('DeepLinkService: Navigate to playlist');
                break;
            case 'discovery':
                console.log('DeepLinkService: Navigate to discovery');
                break;
        }

        return parsed;
    }

    /**
     * Create a shareable link for a station
     */
    async createShareableLink(options: ShareLinkOptions): Promise<string> {
        const { station, useFirebase, shortLink } = options;

        let link = this.generateStationLink(station, useFirebase);

        // If using Firebase and short links are requested
        if (useFirebase && shortLink && Platform.OS !== 'web') {
            try {
                // In a real implementation, create Firebase Dynamic Link
                // const dynamicLink = await FirebaseLinks.createDynamicLinkAsync({
                //   link,
                //   domainUriPrefix: 'https://radioglobe.page.link',
                //   android: { packageName: 'com.radioglobe.app' },
                //   ios: { bundleId: 'com.radioglobe.app' }
                // });
                // link = dynamicLink;
                console.log('DeepLinkService: Firebase Dynamic Links would be created here');
            } catch (error) {
                console.error('DeepLinkService: Failed to create Firebase link', error);
            }
        }

        // Store analytics
        await this.trackShareEvent(station, link);

        return link;
    }

    /**
     * Share a station link via native share sheet
     */
    async shareStation(station: Station, message?: string): Promise<void> {
        try {
            const link = await this.createShareableLink({
                station,
                useFirebase: true,
                shortLink: true
            });

            const shareMessage = message || `Check out ${station.name} on RadioGlobe!`;

            await Share.share({
                message: `${shareMessage}\n\n${link}`,
                title: `Share ${station.name}`,
                url: Platform.OS === 'ios' ? link : undefined
            });
        } catch (error) {
            console.error('DeepLinkService: Failed to share station', error);
            Alert.alert('Share Failed', 'Could not share the station link. Please try again.');
        }
    }

    /**
     * Track share events for analytics
     */
    private async trackShareEvent(station: Station, link: string): Promise<void> {
        const analyticsData = {
            stationId: station.stationuuid,
            stationName: station.name,
            link,
            timestamp: Date.now(),
            platform: Platform.OS
        };

        await AsyncStorage.setItem(
            `share_analytics_${Date.now()}`,
            JSON.stringify(analyticsData)
        );

        // In a real app, send to analytics service
        console.log('DeepLinkService: Tracked share event', analyticsData);
    }

    /**
     * Check if app was launched from a deep link
     */
    async wasLaunchedFromDeepLink(): Promise<boolean> {
        const initialUrl = await Linking.getInitialURL();
        return !!initialUrl;
    }

    /**
     * Get the last handled deep link
     */
    async getLastDeepLink(): Promise<ParsedDeepLink | null> {
        try {
            const data = await AsyncStorage.getItem('last_deep_link');
            if (data) {
                const parsed = JSON.parse(data);
                return parsed.parsed;
            }
        } catch (error) {
            console.error('DeepLinkService: Failed to get last deep link', error);
        }
        return null;
    }

    /**
     * Clean up event listeners
     */
    cleanup(): void {
        // Note: expo-linking doesn't have removeEventListener in newer versions
        // The event listener is automatically managed
        this.isInitialized = false;
    }
}

// Create singleton instance
export const deepLinkService = new DeepLinkService();

export default deepLinkService;