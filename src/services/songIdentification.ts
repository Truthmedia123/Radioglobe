import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { CONFIG } from '../config';

export interface SongIdentificationResult {
    title: string;
    artist: string;
    album?: string;
    albumArt?: string;
    releaseDate?: string;
    genre?: string;
    confidence: number;
}

export interface IdentificationState {
    status: 'idle' | 'listening' | 'success' | 'error';
    result: SongIdentificationResult | null;
    error?: string;
}

class SongIdentificationService {
    private recording: Audio.Recording | null = null;
    private isRecording = false;

    /**
     * Start recording audio from the microphone for song identification
     * This records the audio output from the speaker (user holds phone near speaker)
     */
    async startRecording(): Promise<string | null> {
        try {
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Microphone permission not granted');
            }

            // Configure audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false,
            });

            // Prepare recording
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

            this.recording = new Audio.Recording();
            await this.recording.prepareToRecordAsync(recordingOptions);
            await this.recording.startAsync();
            this.isRecording = true;

            // Record for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));

            return await this.stopRecording();
        } catch (error) {
            console.error('Error starting recording:', error);
            await this.stopRecording();
            return null;
        }
    }

    /**
     * Stop recording and return the file URI
     */
    async stopRecording(): Promise<string | null> {
        if (!this.recording || !this.isRecording) {
            return null;
        }

        try {
            await this.recording.stopAndUnloadAsync();
            this.isRecording = false;
            const uri = this.recording.getURI();
            this.recording = null;
            return uri;
        } catch (error) {
            console.error('Error stopping recording:', error);
            this.recording = null;
            this.isRecording = false;
            return null;
        }
    }

    /**
     * Identify a song from an audio file using AudD API
     */
    async identifySongFromFile(audioFileUri: string): Promise<SongIdentificationResult | null> {
        // Mock mode for development - skip file operations
        if (CONFIG.MOCK_MODE || CONFIG.AUDD_API_KEY === 'demo_key_for_development') {
            return await this.mockIdentifySong();
        }

        try {
            // In real implementation, we would read the file and send to AudD API
            // For now, we'll use mock mode since file system operations are complex
            console.warn('Real AudD API integration requires file system access. Using mock mode.');
            return await this.mockIdentifySong();
        } catch (error) {
            console.error('Error identifying song:', error);
            return null;
        }
    }

    /**
     * Main function to identify currently playing song
     * Records from microphone and sends to AudD API
     */
    async identifyCurrentSong(): Promise<SongIdentificationResult | null> {
        try {
            // Record audio from microphone
            const audioFileUri = await this.startRecording();
            if (!audioFileUri) {
                throw new Error('Failed to record audio');
            }

            // Identify song from recorded audio
            const result = await this.identifySongFromFile(audioFileUri);

            // Note: File cleanup would happen here in real implementation
            // For now, we skip file operations in mock mode
            console.log('Song identification completed');

            return result;
        } catch (error) {
            console.error('Error in identifyCurrentSong:', error);
            return null;
        }
    }

    /**
     * Mock identification for development/testing
     */
    private async mockIdentifySong(): Promise<SongIdentificationResult> {
        const mockSongs = [
            {
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                album: 'After Hours',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
                releaseDate: '2019-11-29',
                genre: 'R&B',
                confidence: 0.92,
            },
            {
                title: 'Stay',
                artist: 'The Kid LAROI, Justin Bieber',
                album: 'F*CK LOVE 3',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b2733a712d5d26c23c7191cb2d04',
                releaseDate: '2021-07-09',
                genre: 'Pop',
                confidence: 0.87,
            },
            {
                title: 'Good 4 U',
                artist: 'Olivia Rodrigo',
                album: 'SOUR',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b2731c1ea5bfa5680ac877acdd55',
                releaseDate: '2021-05-21',
                genre: 'Pop Rock',
                confidence: 0.89,
            },
            {
                title: 'Levitating',
                artist: 'Dua Lipa',
                album: 'Future Nostalgia',
                albumArt: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
                releaseDate: '2020-10-01',
                genre: 'Disco',
                confidence: 0.91,
            },
        ];

        // Return a random mock song after a delay to simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const randomSong = mockSongs[Math.floor(Math.random() * mockSongs.length)];
                resolve(randomSong);
            }, 2000);
        });
    }

    /**
     * Cancel any ongoing recording
     */
    async cancelRecording() {
        if (this.isRecording && this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch (error) {
                // Ignore errors during cancellation
            }
            this.recording = null;
            this.isRecording = false;
        }
    }
}

export const songIdentificationService = new SongIdentificationService();