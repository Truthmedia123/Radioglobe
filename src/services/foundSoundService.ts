/**
 * FoundSoundService
 * 
 * Manages audio clipping functionality - allows users to capture the last 30 seconds
 * of audio they just heard and share it as an audio snippet with station credit.
 * 
 * Note: Due to platform limitations, this implementation uses microphone recording
 * to capture audio from speakers (user holds phone near speaker).
 * In production, this would use a background audio buffer.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Station } from '../api/radioBrowser';

export interface AudioClip {
    id: string;
    title: string;
    description: string;
    audioUri: string;
    stationId: string;
    stationName: string;
    duration: number; // in seconds
    createdAt: number;
    tags: string[];
    isFavorite: boolean;
}

export interface RecordingState {
    isRecording: boolean;
    recordingDuration: number;
    recordingUri: string | null;
    error: string | null;
}

class FoundSoundService {
    private static instance: FoundSoundService;
    private recording: Audio.Recording | null = null;
    private recordingState: RecordingState = {
        isRecording: false,
        recordingDuration: 0,
        recordingUri: null,
        error: null
    };
    private recordingInterval: NodeJS.Timeout | null = null;
    private clips: AudioClip[] = [];
    private readonly CLIPS_STORAGE_KEY = 'foundSound_clips';
    private readonly MAX_CLIP_DURATION = 30; // seconds

    private constructor() {
        this.loadClipsFromStorage();
    }

    static getInstance(): FoundSoundService {
        if (!FoundSoundService.instance) {
            FoundSoundService.instance = new FoundSoundService();
        }
        return FoundSoundService.instance;
    }

    /**
     * Initialize audio recording permissions
     */
    async init(): Promise<boolean> {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                console.error('FoundSoundService: Audio recording permission denied');
                return false;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            return true;
        } catch (error) {
            console.error('FoundSoundService: Failed to initialize', error);
            return false;
        }
    }

    /**
     * Start recording a new clip
     */
    async startRecording(): Promise<boolean> {
        try {
            if (this.recordingState.isRecording) {
                console.error('FoundSoundService: Already recording');
                return false;
            }

            // Create recording instance
            this.recording = new Audio.Recording();

            const recordingOptions: Audio.RecordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                    audioEncoder: Audio.AndroidAudioEncoder.AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {},
            };

            await this.recording.prepareToRecordAsync(recordingOptions);

            await this.recording.startAsync();

            // Update state
            this.recordingState = {
                isRecording: true,
                recordingDuration: 0,
                recordingUri: null,
                error: null
            };

            // Start duration timer
            this.recordingInterval = setInterval(() => {
                this.recordingState.recordingDuration += 1;

                // Auto-stop at max duration
                if (this.recordingState.recordingDuration >= this.MAX_CLIP_DURATION) {
                    this.stopRecording();
                }
            }, 1000);

            return true;
        } catch (error) {
            console.error('FoundSoundService: Failed to start recording', error);
            this.recordingState.error = 'Failed to start recording';
            return false;
        }
    }

    /**
     * Stop recording and save the clip
     */
    async stopRecording(): Promise<AudioClip | null> {
        try {
            if (!this.recording || !this.recordingState.isRecording) {
                console.error('FoundSoundService: Not recording');
                return null;
            }

            // Stop recording
            await this.recording.stopAndUnloadAsync();

            // Get recording URI
            const uri = this.recording.getURI();

            // Clear interval
            if (this.recordingInterval) {
                clearInterval(this.recordingInterval);
                this.recordingInterval = null;
            }

            // Update state
            this.recordingState = {
                isRecording: false,
                recordingDuration: this.recordingState.recordingDuration,
                recordingUri: uri,
                error: null
            };

            // Create a mock clip (in real implementation, we'd associate with current station)
            const clip: AudioClip = {
                id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: `Audio Clip ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                description: 'Recorded from speaker',
                audioUri: uri || '',
                stationId: 'unknown',
                stationName: 'Unknown Station',
                duration: this.recordingState.recordingDuration,
                createdAt: Date.now(),
                tags: ['recorded', 'clip'],
                isFavorite: false
            };

            // Add to clips
            this.clips.unshift(clip);
            await this.saveClipsToStorage();

            // Reset recording
            this.recording = null;

            return clip;
        } catch (error) {
            console.error('FoundSoundService: Failed to stop recording', error);
            this.recordingState.error = 'Failed to stop recording';
            return null;
        }
    }

    /**
     * Create a clip from the current station (simulated)
     */
    async createClipFromCurrentStation(station: Station, title?: string): Promise<AudioClip> {
        try {
            // In a real implementation, this would capture from an audio buffer
            // For now, we'll create a simulated clip
            const clip: AudioClip = {
                id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: title || `Clip from ${station.name}`,
                description: `Recorded from ${station.name}`,
                audioUri: `file:///simulated/audio/clip_${Date.now()}.m4a`,
                stationId: station.stationuuid,
                stationName: station.name,
                duration: 30,
                createdAt: Date.now(),
                tags: station.tags ? station.tags.split(',').map(t => t.trim()) : ['radio'],
                isFavorite: false
            };

            this.clips.unshift(clip);
            await this.saveClipsToStorage();

            return clip;
        } catch (error) {
            console.error('FoundSoundService: Failed to create clip', error);
            throw error;
        }
    }

    /**
     * Share an audio clip
     */
    async shareClip(clip: AudioClip, message?: string): Promise<boolean> {
        try {
            if (!(await Sharing.isAvailableAsync())) {
                console.error('FoundSoundService: Sharing not available');
                return false;
            }

            const shareMessage = message || `Check out this audio clip from ${clip.stationName} on RadioGlobe!`;

            // For simulated clips, we can't share actual files
            if (clip.audioUri.startsWith('file:///simulated/')) {
                console.log('FoundSoundService: Simulated clip - would share real file in production');
                return false;
            }

            await Sharing.shareAsync(clip.audioUri, {
                mimeType: 'audio/m4a',
                dialogTitle: 'Share Audio Clip',
                UTI: 'public.audio' // iOS only
            });

            return true;
        } catch (error) {
            console.error('FoundSoundService: Failed to share clip', error);
            return false;
        }
    }

    /**
     * Get all clips
     */
    async getClips(): Promise<AudioClip[]> {
        return [...this.clips];
    }

    /**
     * Get clip by ID
     */
    async getClip(id: string): Promise<AudioClip | null> {
        return this.clips.find(clip => clip.id === id) || null;
    }

    /**
     * Delete a clip
     */
    async deleteClip(id: string): Promise<boolean> {
        try {
            const initialLength = this.clips.length;
            this.clips = this.clips.filter(clip => clip.id !== id);

            if (this.clips.length < initialLength) {
                await this.saveClipsToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('FoundSoundService: Failed to delete clip', error);
            return false;
        }
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<boolean> {
        try {
            const clip = this.clips.find(clip => clip.id === id);
            if (!clip) return false;

            clip.isFavorite = !clip.isFavorite;
            await this.saveClipsToStorage();
            return true;
        } catch (error) {
            console.error('FoundSoundService: Failed to toggle favorite', error);
            return false;
        }
    }

    /**
     * Get current recording state
     */
    getRecordingState(): RecordingState {
        return { ...this.recordingState };
    }

    /**
     * Cancel current recording
     */
    async cancelRecording(): Promise<void> {
        try {
            if (this.recording && this.recordingState.isRecording) {
                await this.recording.stopAndUnloadAsync();
            }

            if (this.recordingInterval) {
                clearInterval(this.recordingInterval);
                this.recordingInterval = null;
            }

            this.recordingState = {
                isRecording: false,
                recordingDuration: 0,
                recordingUri: null,
                error: null
            };

            this.recording = null;
        } catch (error) {
            console.error('FoundSoundService: Failed to cancel recording', error);
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.cancelRecording();
    }

    /**
     * Load clips from AsyncStorage
     */
    private async loadClipsFromStorage(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(this.CLIPS_STORAGE_KEY);
            if (stored) {
                this.clips = JSON.parse(stored);
            }
        } catch (error) {
            console.error('FoundSoundService: Failed to load clips from storage', error);
            this.clips = [];
        }
    }

    /**
     * Save clips to AsyncStorage
     */
    private async saveClipsToStorage(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.CLIPS_STORAGE_KEY, JSON.stringify(this.clips));
        } catch (error) {
            console.error('FoundSoundService: Failed to save clips to storage', error);
        }
    }
}

export const foundSoundService = FoundSoundService.getInstance();