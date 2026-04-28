import { audioService, AUDIO_EVENTS } from './audioService';
import { usePlayerStore } from '../store/playerStore';
import { searchStationsByTags, Station } from '../api/radioBrowser';

/**
 * Service for handling dead stream recovery and auto-skip
 */
class StreamRecoveryService {
    private isRecovering = false;
    private recoveryAttempts = 0;
    private maxRecoveryAttempts = 3;

    constructor() {
        // Listen for dead stream events
        audioService.on(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStream.bind(this));
        audioService.on(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackError.bind(this));
    }

    /**
     * Handle dead stream event
     */
    private async handleDeadStream(data: { url: string }) {
        if (this.isRecovering) return;

        console.log('Handling dead stream:', data.url);
        this.isRecovering = true;

        // Get current station info
        const { currentStation, availableStreams } = usePlayerStore.getState();

        if (!currentStation) {
            console.log('No current station, cannot recover');
            this.isRecovering = false;
            return;
        }

        // Try alternative streams first
        if (availableStreams.length > 1) {
            const currentIndex = availableStreams.indexOf(data.url);
            if (currentIndex !== -1 && currentIndex + 1 < availableStreams.length) {
                const nextStream = availableStreams[currentIndex + 1];
                console.log(`Trying alternative stream: ${nextStream}`);

                try {
                    await audioService.hotSwapStream(nextStream);
                    this.recoveryAttempts = 0;
                    this.isRecovering = false;
                    return;
                } catch (error) {
                    console.error('Failed to switch to alternative stream:', error);
                }
            }
        }

        // If no alternative streams or they failed, try to find a similar station
        await this.findAndPlaySimilarStation(currentStation);
    }

    /**
     * Handle playback error
     */
    private async handlePlaybackError(data: { error: any; url: string }) {
        console.log('Playback error, attempting recovery:', data.error);

        // Wait a moment before attempting recovery
        setTimeout(async () => {
            const { isPlaying } = usePlayerStore.getState();
            if (isPlaying && !this.isRecovering) {
                await this.handleDeadStream({ url: data.url });
            }
        }, 2000);
    }

    /**
     * Find and play a similar station based on tags/genre
     */
    private async findAndPlaySimilarStation(currentStation: Station) {
        this.recoveryAttempts++;

        if (this.recoveryAttempts > this.maxRecoveryAttempts) {
            console.log('Max recovery attempts reached, giving up');
            this.resetRecovery();
            return;
        }

        console.log(`Finding similar station (attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);

        // Show searching UI
        usePlayerStore.getState().setIsLoading(true);

        try {
            // Get tags from current station
            const tags = currentStation.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];

            let similarStations: Station[] = [];

            // Try to find stations with similar tags
            if (tags.length > 0) {
                similarStations = await searchStationsByTags(tags.slice(0, 3), 5);
            }

            // If no stations found by tags, try by country
            if (similarStations.length === 0 && currentStation.countrycode) {
                // Note: We don't have searchStationsByCountry in our API yet, so we'll use a mock
                similarStations = await this.mockFindStationsByCountry(currentStation.countrycode);
            }

            // Filter out the current station
            similarStations = similarStations.filter(
                station => station.stationuuid !== currentStation.stationuuid
            );

            if (similarStations.length > 0) {
                // Pick a random similar station
                const randomStation = similarStations[Math.floor(Math.random() * similarStations.length)];

                console.log(`Found similar station: ${randomStation.name}`);

                // Update player store
                usePlayerStore.getState().setCurrentStation(randomStation);

                // Play the new station
                await audioService.play(randomStation.url_resolved);

                // Show success message
                this.showRecoveryMessage(`Switched to: ${randomStation.name}`);

                this.resetRecovery();
            } else {
                console.log('No similar stations found');
                this.showRecoveryMessage('No alternative stations found');
                this.resetRecovery();
            }
        } catch (error) {
            console.error('Error finding similar station:', error);
            this.showRecoveryMessage('Recovery failed');
            this.resetRecovery();
        }
    }

    /**
     * Mock function to find stations by country (since we don't have this API yet)
     */
    private async mockFindStationsByCountry(countrycode: string): Promise<Station[]> {
        // In a real implementation, this would call the Radio Browser API
        // For now, return mock stations
        return [
            {
                stationuuid: 'mock1',
                name: `${countrycode.toUpperCase()} Radio 1`,
                url_resolved: 'https://stream.mock1.com/stream',
                countrycode,
                tags: 'pop,rock',
            },
            {
                stationuuid: 'mock2',
                name: `${countrycode.toUpperCase()} Hits`,
                url_resolved: 'https://stream.mock2.com/stream',
                countrycode,
                tags: 'hits,top40',
            },
        ] as Station[];
    }

    /**
     * Show recovery message (would be implemented as a toast or UI notification)
     */
    private showRecoveryMessage(message: string) {
        console.log(`Recovery: ${message}`);
        // In a real app, you would show this in the UI
        // For now, we'll just log it
    }

    /**
     * Reset recovery state
     */
    private resetRecovery() {
        this.isRecovering = false;
        this.recoveryAttempts = 0;
        usePlayerStore.getState().setIsLoading(false);
    }

    /**
     * Manually trigger stream recovery
     */
    async manualRecovery() {
        const { currentStation } = usePlayerStore.getState();
        if (currentStation) {
            await this.findAndPlaySimilarStation(currentStation);
        }
    }

    /**
     * Clean up event listeners
     */
    cleanup() {
        audioService.removeListener(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStream.bind(this));
        audioService.removeListener(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackError.bind(this));
    }
}

export const streamRecoveryService = new StreamRecoveryService();