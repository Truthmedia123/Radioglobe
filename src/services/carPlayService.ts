import { Platform } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioService } from './audioService';
import { Station } from '../api/radioBrowser';
import TrackPlayer, {
    Capability,
    Event,
    State,
    AppKilledPlaybackBehavior,
    Track
} from 'react-native-track-player';

export interface CarPlayState {
    isConnected: boolean;
    isCarPlayActive: boolean;
    isAndroidAutoActive: boolean;
    currentTrackId?: string;
    lastStation?: Station;
}

export interface CarPlayTrack {
    id: string;
    url: string;
    title: string;
    artist: string;
    album?: string;
    artwork?: string;
    duration?: number;
    station: Station;
    isLiveStream: boolean;
}

class CarPlayService {
    private isInitialized = false;
    private carPlayState: CarPlayState = {
        isConnected: false,
        isCarPlayActive: false,
        isAndroidAutoActive: false
    };
    private lastStationCache: Station | null = null;

    async init(): Promise<boolean> {
        if (this.isInitialized) return true;

        try {
            try {
                await TrackPlayer.setupPlayer();
            } catch (setupError) {
                // If player is already initialized, we can continue
                // This happens when TrackPlayer was already set up in index.ts
                if (setupError instanceof Error && setupError.message?.includes('already been initialized')) {
                    console.log('TrackPlayer already initialized, continuing CarPlayService setup');
                } else {
                    throw setupError;
                }
            }

            await TrackPlayer.updateOptions({
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                    Capability.Stop,
                ],
            });

            await this.loadLastStation();
            this.registerEventListeners();

            this.isInitialized = true;
            console.log('CarPlayService initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize CarPlayService:', error);
            return false;
        }
    }

    private async loadLastStation(): Promise<void> {
        try {
            const lastStationJson = await AsyncStorage.getItem('@last_station_carplay');
            if (lastStationJson) {
                this.lastStationCache = JSON.parse(lastStationJson);
            }
        } catch (error) {
            console.error('Failed to load last station:', error);
        }
    }

    private async saveLastStation(station: Station): Promise<void> {
        try {
            this.lastStationCache = station;
            await AsyncStorage.setItem('@last_station_carplay', JSON.stringify(station));
        } catch (error) {
            console.error('Failed to save last station:', error);
        }
    }

    private registerEventListeners(): void {
        if (!TrackPlayer || !Event) {
            console.warn('CarPlayService: Cannot register event listeners, TrackPlayer not available');
            return;
        }

        try {
            TrackPlayer.addEventListener(Event.RemotePlay, () => {
                console.log('CarPlay: Remote play');
                this.handleRemotePlay();
            });

            TrackPlayer.addEventListener(Event.RemotePause, () => {
                console.log('CarPlay: Remote pause');
                this.handleRemotePause();
            });

            TrackPlayer.addEventListener(Event.RemoteNext, () => {
                console.log('CarPlay: Remote next');
                this.handleRemoteNext();
            });

            TrackPlayer.addEventListener(Event.RemotePrevious, () => {
                console.log('CarPlay: Remote previous');
                this.handleRemotePrevious();
            });

            TrackPlayer.addEventListener(Event.RemoteStop, () => {
                console.log('CarPlay: Remote stop');
                this.handleRemoteStop();
            });

            TrackPlayer.addEventListener(Event.PlaybackState, (data: any) => {
                console.log('CarPlay: Playback state changed', data.state);
                this.updatePlaybackState(data.state);
            });
        } catch (error) {
            console.error('CarPlayService: Failed to register event listeners:', error);
        }
    }

    private async handleRemotePlay(): Promise<void> {
        const { currentStation, isPlaying, setIsPlaying } = usePlayerStore.getState();

        if (!isPlaying) {
            setIsPlaying(true);
            if (currentStation) {
                await audioService.resume();
            }
        }
    }

    private async handleRemotePause(): Promise<void> {
        const { isPlaying, setIsPlaying } = usePlayerStore.getState();

        if (isPlaying) {
            setIsPlaying(false);
            await audioService.pause();
        }
    }

    private async handleRemoteNext(): Promise<void> {
        console.log('CarPlay: Skipping to next favorite station');
        const { isPlaying } = usePlayerStore.getState();
        if (isPlaying) {
            await this.handleRemotePause();
        } else {
            await this.handleRemotePlay();
        }
    }

    private async handleRemotePrevious(): Promise<void> {
        console.log('CarPlay: Previous station');
        this.handleRemoteNext();
    }

    private async handleRemoteStop(): Promise<void> {
        console.log('CarPlay: Stop playback');
        const { setIsPlaying } = usePlayerStore.getState();
        setIsPlaying(false);
        await audioService.stop();
        await TrackPlayer.stop();
    }

    private updatePlaybackState(state: any): void {
        const { setIsPlaying } = usePlayerStore.getState();

        switch (state) {
            case State?.Playing:
                setIsPlaying(true);
                break;
            case State?.Paused:
            case State?.Stopped:
                setIsPlaying(false);
                break;
        }
    }

    async startCarPlaySession(station: Station): Promise<void> {
        if (!this.isInitialized) {
            await this.init();
        }

        await this.saveLastStation(station);

        const track: CarPlayTrack = {
            id: station.stationuuid,
            url: station.url_resolved || station.url,
            title: station.name,
            artist: station.country || 'Radio Station',
            album: 'RadioGlobe',
            artwork: station.favicon
                ? station.favicon
                : 'https://via.placeholder.com/512/FF6B35/000000?text=' + encodeURIComponent(station.name.substring(0, 1)),
            duration: 0,
            station,
            isLiveStream: true,
        };

        await TrackPlayer.reset();
        await TrackPlayer.add([track]);

        this.carPlayState = {
            ...this.carPlayState,
            isConnected: true,
            currentTrackId: station.stationuuid,
            lastStation: station
        };

        await TrackPlayer.play();

        console.log('CarPlay session started for station:', station.name);
    }

    async stopCarPlaySession(): Promise<void> {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();

            this.carPlayState = {
                ...this.carPlayState,
                isConnected: false,
                currentTrackId: undefined
            };

            console.log('CarPlay session stopped');
        } catch (error) {
            console.error('Failed to stop CarPlay session:', error);
        }
    }

    async resumeLastStation(): Promise<boolean> {
        if (!this.lastStationCache) {
            return false;
        }

        try {
            await this.startCarPlaySession(this.lastStationCache);
            return true;
        } catch (error) {
            console.error('Failed to resume last station:', error);
            return false;
        }
    }

    isCarPlayConnected(): boolean {
        return this.carPlayState.isConnected;
    }

    getCarPlayState(): CarPlayState {
        return { ...this.carPlayState };
    }

    async updateNowPlayingMetadata(metadata: {
        title?: string;
        artist?: string;
        artwork?: string;
    }): Promise<void> {
        if (!this.carPlayState.currentTrackId) return;

        try {
            const tracks = await TrackPlayer.getQueue();
            const trackIndex = tracks.findIndex((track: any) => track.id === this.carPlayState.currentTrackId);
            if (trackIndex >= 0) {
                const currentTrack = tracks[trackIndex];
                const updatedTrack = {
                    ...currentTrack,
                    ...metadata
                };
                await TrackPlayer.updateMetadataForTrack(trackIndex, updatedTrack);
            }
        } catch (error) {
            console.error('Failed to update now playing metadata:', error);
        }
    }

    async cleanup(): Promise<void> {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
            this.isInitialized = false;
            this.carPlayState = {
                isConnected: false,
                isCarPlayActive: false,
                isAndroidAutoActive: false
            };

            console.log('CarPlayService cleaned up');
        } catch (error) {
            console.error('Failed to cleanup CarPlayService:', error);
        }
    }
}

export const carPlayService = new CarPlayService();