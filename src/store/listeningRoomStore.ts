/**
 * Zustand store for managing listening room state
 */

import { create } from 'zustand';
import { ListeningRoom, ListeningRoomState } from '../services/listeningRoomService';

interface ListeningRoomStore {
    // Current room state
    currentRoom: ListeningRoom | null;
    isHost: boolean;
    participants: Array<{
        userId: string;
        userName: string;
        joinedAt: number;
        isHost: boolean;
    }>;
    isSynced: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

    // Available rooms
    availableRooms: ListeningRoom[];

    // Actions
    setCurrentRoom: (room: ListeningRoom | null, isHost?: boolean) => void;
    setParticipants: (participants: Array<{ userId: string; userName: string; joinedAt: number; isHost: boolean }>) => void;
    setIsSynced: (synced: boolean) => void;
    setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    setAvailableRooms: (rooms: ListeningRoom[]) => void;
    updateRoomStation: (stationId: string, stationName: string, stationUrl: string) => void;
    updateListenerCount: (count: number) => void;
    reset: () => void;
}

export const useListeningRoomStore = create<ListeningRoomStore>((set) => ({
    // Initial state
    currentRoom: null,
    isHost: false,
    participants: [],
    isSynced: false,
    connectionStatus: 'disconnected',
    availableRooms: [],

    // Actions
    setCurrentRoom: (room, isHost = false) => set((state) => ({
        currentRoom: room,
        isHost,
        // Reset participants when room changes
        participants: room ? state.participants.filter(p => p.userId !== 'temp') : []
    })),

    setParticipants: (participants) => set({ participants }),

    setIsSynced: (isSynced) => set({ isSynced }),

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    setAvailableRooms: (availableRooms) => set({ availableRooms }),

    updateRoomStation: (stationId, stationName, stationUrl) => set((state) => ({
        currentRoom: state.currentRoom ? {
            ...state.currentRoom,
            stationId,
            stationName,
            stationUrl,
            lastUpdated: Date.now()
        } : null
    })),

    updateListenerCount: (listenerCount) => set((state) => ({
        currentRoom: state.currentRoom ? {
            ...state.currentRoom,
            listenerCount,
            lastUpdated: Date.now()
        } : null
    })),

    reset: () => set({
        currentRoom: null,
        isHost: false,
        participants: [],
        isSynced: false,
        connectionStatus: 'disconnected',
        availableRooms: []
    })
}));