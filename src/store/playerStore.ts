import { create } from 'zustand';
import { Station } from '../api/radioBrowser';

export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
export type StreamQuality = 'low' | 'medium' | 'high' | 'adaptive';

export interface SleepTimerState {
  isActive: boolean;
  duration: number; // in minutes
  remainingSeconds: number;
  isFading: boolean;
  withNatureSounds: boolean;
}

interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  networkType: NetworkType;
  streamQuality: StreamQuality;
  isEcoMode: boolean;
  availableStreams: string[]; // Alternative stream URLs for current station
  sleepTimer: SleepTimerState;
  setCurrentStation: (station: Station | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setVolume: (volume: number) => void;
  setNetworkType: (type: NetworkType) => void;
  setStreamQuality: (quality: StreamQuality) => void;
  setIsEcoMode: (eco: boolean) => void;
  setAvailableStreams: (streams: string[]) => void;
  setSleepTimerState: (state: SleepTimerState) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  volume: 1.0,
  networkType: 'unknown',
  streamQuality: 'adaptive',
  isEcoMode: false,
  availableStreams: [],
  sleepTimer: {
    isActive: false,
    duration: 0,
    remainingSeconds: 0,
    isFading: false,
    withNatureSounds: false,
  },
  setCurrentStation: (station) => set({ currentStation: station }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setVolume: (volume) => set({ volume }),
  setNetworkType: (type) => set({ networkType: type }),
  setStreamQuality: (quality) => set({ streamQuality: quality }),
  setIsEcoMode: (eco) => set({ isEcoMode: eco }),
  setAvailableStreams: (streams) => set({ availableStreams: streams }),
  setSleepTimerState: (state) => set({ sleepTimer: state }),
}));
