import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { usePlayerStore, NetworkType } from '../store/playerStore';

/**
 * Network monitoring service for audio quality auto-switch
 */
class NetworkMonitorService {
    private unsubscribe: (() => void) | null = null;
    private isMonitoring = false;

    /**
     * Start monitoring network changes
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            this.handleNetworkChange(state);
        });

        this.isMonitoring = true;
        console.log('Network monitoring started');
    }

    /**
     * Stop monitoring network changes
     */
    stopMonitoring() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.isMonitoring = false;
        console.log('Network monitoring stopped');
    }

    /**
     * Handle network state changes
     */
    private handleNetworkChange(state: NetInfoState) {
        const networkType = this.mapNetworkType(state.type);
        const isConnected = state.isConnected;

        console.log(`Network changed: ${networkType}, connected: ${isConnected}`);

        // Update player store
        const { setNetworkType, setIsEcoMode } = usePlayerStore.getState();

        setNetworkType(networkType);

        // Enable eco mode on cellular, disable on wifi/ethernet
        if (networkType === 'cellular' && isConnected) {
            setIsEcoMode(true);
            console.log('Eco mode enabled (cellular network)');
        } else if ((networkType === 'wifi' || networkType === 'ethernet') && isConnected) {
            setIsEcoMode(false);
            console.log('Eco mode disabled (wifi/ethernet network)');
        }
    }

    /**
     * Map NetInfo type to our NetworkType
     */
    private mapNetworkType(netInfoType: string): NetworkType {
        switch (netInfoType) {
            case 'wifi':
                return 'wifi';
            case 'cellular':
                return 'cellular';
            case 'ethernet':
                return 'ethernet';
            case 'none':
                return 'none';
            default:
                return 'unknown';
        }
    }

    /**
     * Get current network type
     */
    async getCurrentNetworkType(): Promise<NetworkType> {
        const state = await NetInfo.fetch();
        return this.mapNetworkType(state.type);
    }

    /**
     * Check if we should use eco mode based on current network
     */
    async shouldUseEcoMode(): Promise<boolean> {
        const networkType = await this.getCurrentNetworkType();
        return networkType === 'cellular';
    }

    /**
     * Get recommended bitrate based on network type
     */
    getRecommendedBitrate(networkType: NetworkType): number {
        switch (networkType) {
            case 'cellular':
                return 64000; // 64 kbps for cellular
            case 'wifi':
                return 192000; // 192 kbps for wifi
            case 'ethernet':
                return 320000; // 320 kbps for ethernet
            default:
                return 128000; // 128 kbps for unknown
        }
    }
}

export const networkMonitorService = new NetworkMonitorService();

/**
 * React hook for network monitoring
 */
export const useNetworkMonitor = () => {
    useEffect(() => {
        // Start monitoring when component mounts
        networkMonitorService.startMonitoring();

        // Clean up when component unmounts
        return () => {
            networkMonitorService.stopMonitoring();
        };
    }, []);
};