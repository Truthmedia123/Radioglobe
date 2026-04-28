import { Platform } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { Station } from '../api/radioBrowser';
import { audioService } from './audioService';

// Mock implementation for development
// In production, this would use react-native-google-cast
export interface CastDevice {
    id: string;
    name: string;
    type: 'chromecast' | 'google-home' | 'other';
    isConnected: boolean;
}

export interface CastState {
    isCasting: boolean;
    isDiscovering: boolean;
    devices: CastDevice[];
    currentDevice?: CastDevice;
    currentStation?: Station;
    volume: number;
}

class CastService {
    private castState: CastState = {
        isCasting: false,
        isDiscovering: false,
        devices: [],
        volume: 50,
    };

    private discoveryInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;

    /**
     * Initialize Cast service
     */
    async init(): Promise<boolean> {
        try {
            console.log('CastService initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize CastService:', error);
            return false;
        }
    }

    /**
     * Start discovering Cast devices
     */
    async startDiscovery(): Promise<CastDevice[]> {
        this.castState.isDiscovering = true;

        // Mock discovery for development
        const mockDevices: CastDevice[] = [
            { id: 'mock-1', name: 'Living Room Chromecast', type: 'chromecast', isConnected: false },
            { id: 'mock-2', name: 'Kitchen Speaker', type: 'google-home', isConnected: false },
            { id: 'mock-3', name: 'Bedroom TV', type: 'chromecast', isConnected: false },
        ];

        // Simulate discovery delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.castState.devices = mockDevices;
        this.castState.isDiscovering = false;

        console.log('Discovered Cast devices:', mockDevices.length);
        return mockDevices;
    }

    /**
     * Stop discovering Cast devices
     */
    stopDiscovery(): void {
        this.castState.isDiscovering = false;
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
    }

    /**
     * Connect to a Cast device
     */
    async connectToDevice(deviceId: string): Promise<boolean> {
        const device = this.castState.devices.find(d => d.id === deviceId);
        if (!device) {
            console.error('Device not found:', deviceId);
            return false;
        }

        try {
            console.log('Connecting to Cast device:', device.name);

            // Mock connection delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update device state
            device.isConnected = true;
            this.castState.currentDevice = device;

            console.log('Connected to Cast device:', device.name);
            return true;
        } catch (error) {
            console.error('Failed to connect to Cast device:', error);
            return false;
        }
    }

    /**
     * Disconnect from current Cast device
     */
    async disconnect(): Promise<void> {
        if (!this.castState.currentDevice) return;

        try {
            console.log('Disconnecting from Cast device:', this.castState.currentDevice.name);

            // Stop casting if active
            if (this.castState.isCasting) {
                await this.stopCasting();
            }

            // Update device state
            if (this.castState.currentDevice) {
                this.castState.currentDevice.isConnected = false;
            }

            this.castState.currentDevice = undefined;
            this.reconnectAttempts = 0;

            console.log('Disconnected from Cast device');
        } catch (error) {
            console.error('Failed to disconnect from Cast device:', error);
        }
    }

    /**
     * Start casting current station to connected device
     */
    async startCasting(station: Station): Promise<boolean> {
        if (!this.castState.currentDevice) {
            console.error('No Cast device connected');
            return false;
        }

        try {
            console.log('Starting to cast station:', station.name);

            // Stop local audio playback
            await audioService.pause();

            // Update cast state
            this.castState.isCasting = true;
            this.castState.currentStation = station;

            // In a real implementation, this would send the stream URL to the Cast device
            // For mock implementation, we'll simulate successful casting
            console.log(`Casting ${station.name} to ${this.castState.currentDevice.name}`);

            // Start monitoring for connection drops
            this.startConnectionMonitor();

            return true;
        } catch (error) {
            console.error('Failed to start casting:', error);
            return false;
        }
    }

    /**
     * Stop casting
     */
    async stopCasting(): Promise<void> {
        if (!this.castState.isCasting) return;

        try {
            console.log('Stopping casting');

            // Update cast state
            this.castState.isCasting = false;
            this.castState.currentStation = undefined;

            // Stop connection monitoring
            this.stopConnectionMonitor();

            // Resume local audio if a station was playing
            const { currentStation, isPlaying } = usePlayerStore.getState();
            if (currentStation && isPlaying) {
                await audioService.resume();
            }

            console.log('Casting stopped');
        } catch (error) {
            console.error('Failed to stop casting:', error);
        }
    }

    /**
     * Start monitoring Cast connection for drops
     */
    private startConnectionMonitor(): void {
        this.stopConnectionMonitor();

        this.discoveryInterval = setInterval(() => {
            this.checkConnection();
        }, 5000); // Check every 5 seconds
    }

    /**
     * Stop connection monitoring
     */
    private stopConnectionMonitor(): void {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
    }

    /**
     * Check if Cast connection is still active
     */
    private async checkConnection(): Promise<void> {
        if (!this.castState.isCasting || !this.castState.currentDevice) return;

        // Mock connection check - in real implementation, this would check Cast session status
        const isConnected = Math.random() > 0.1; // 90% chance of staying connected

        if (!isConnected) {
            console.warn('Cast connection dropped');
            this.reconnectAttempts++;

            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                await this.attemptReconnect();
            } else {
                console.error('Max reconnect attempts reached, stopping cast');
                await this.stopCasting();
            }
        } else {
            this.reconnectAttempts = 0; // Reset on successful connection
        }
    }

    /**
     * Attempt to reconnect dropped Cast session
     */
    private async attemptReconnect(): Promise<boolean> {
        if (!this.castState.currentDevice || !this.castState.currentStation) {
            return false;
        }

        try {
            console.log('Attempting to reconnect Cast session');

            // Simulate reconnection delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock successful reconnection
            console.log('Cast session reconnected');
            this.reconnectAttempts = 0;
            return true;
        } catch (error) {
            console.error('Failed to reconnect Cast session:', error);
            return false;
        }
    }

    /**
     * Set Cast volume
     */
    async setVolume(volume: number): Promise<void> {
        this.castState.volume = Math.max(0, Math.min(100, volume));
        console.log('Cast volume set to:', this.castState.volume);

        // In real implementation, this would send volume command to Cast device
    }

    /**
     * Get current Cast state
     */
    getCastState(): CastState {
        return { ...this.castState };
    }

    /**
     * Check if casting is active
     */
    isCasting(): boolean {
        return this.castState.isCasting;
    }

    /**
     * Get current Cast device
     */
    getCurrentDevice(): CastDevice | undefined {
        return this.castState.currentDevice;
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        this.stopDiscovery();
        this.stopConnectionMonitor();

        if (this.castState.isCasting) {
            await this.stopCasting();
        }

        if (this.castState.currentDevice) {
            await this.disconnect();
        }

        console.log('CastService cleaned up');
    }
}

// Singleton instance
export const castService = new CastService();