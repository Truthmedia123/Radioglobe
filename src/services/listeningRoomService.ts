/**
 * ListeningRoomService
 * 
 * Manages public listening rooms where users can listen to stations together in sync.
 * Uses Firebase Realtime Database for real-time updates.
 * 
 * For development, provides mock implementation when Firebase is not configured.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Station } from '../api/radioBrowser';

export interface ListeningRoom {
    id: string;
    name: string;
    hostId: string;
    hostName: string;
    stationId: string;
    stationName: string;
    stationUrl: string;
    listenerCount: number;
    createdAt: number;
    lastUpdated: number;
}

export interface RoomParticipant {
    userId: string;
    userName: string;
    joinedAt: number;
    isHost: boolean;
}

export interface ListeningRoomState {
    currentRoom: ListeningRoom | null;
    isHost: boolean;
    participants: RoomParticipant[];
    isSynced: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

class ListeningRoomService {
    private static instance: ListeningRoomService;
    private firebaseInitialized = false;
    private mockRooms: ListeningRoom[] = [];
    private currentRoomState: ListeningRoomState = {
        currentRoom: null,
        isHost: false,
        participants: [],
        isSynced: false,
        connectionStatus: 'disconnected'
    };

    // Mock data for development
    private generateMockRooms(): ListeningRoom[] {
        return [
            {
                id: 'room1',
                name: 'Late Night Jazz',
                hostId: 'user1',
                hostName: 'Alex',
                stationId: 'jazz88',
                stationName: 'Smooth Jazz 88.1',
                stationUrl: 'https://stream.jazzradio.com/smoothjazz',
                listenerCount: 3,
                createdAt: Date.now() - 3600000,
                lastUpdated: Date.now() - 300000
            },
            {
                id: 'room2',
                name: 'Indie Rock Party',
                hostId: 'user2',
                hostName: 'Jamie',
                stationId: 'indie101',
                stationName: 'Indie 101.5',
                stationUrl: 'https://stream.indierock.com/main',
                listenerCount: 7,
                createdAt: Date.now() - 7200000,
                lastUpdated: Date.now() - 120000
            },
            {
                id: 'room3',
                name: 'Classical Study',
                hostId: 'user3',
                hostName: 'Taylor',
                stationId: 'classical92',
                stationName: 'Classical 92.3',
                stationUrl: 'https://stream.classical.com/concert',
                listenerCount: 2,
                createdAt: Date.now() - 1800000,
                lastUpdated: Date.now() - 60000
            }
        ];
    }

    private constructor() {
        this.mockRooms = this.generateMockRooms();
    }

    static getInstance(): ListeningRoomService {
        if (!ListeningRoomService.instance) {
            ListeningRoomService.instance = new ListeningRoomService();
        }
        return ListeningRoomService.instance;
    }

    /**
     * Initialize Firebase connection
     */
    async init(): Promise<boolean> {
        try {
            // Check if Firebase is configured
            if (Platform.OS !== 'web') {
                // In a real implementation, we would initialize Firebase here
                // For now, we'll simulate successful initialization
                console.log('ListeningRoomService: Initializing (mock mode)');
                this.firebaseInitialized = true;
                return true;
            }
            return false;
        } catch (error) {
            console.error('ListeningRoomService: Failed to initialize', error);
            return false;
        }
    }

    /**
     * Create a new listening room
     */
    async createRoom(roomName: string, station: Station): Promise<ListeningRoom | null> {
        try {
            const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const hostId = `user_${Math.random().toString(36).substr(2, 9)}`;

            const newRoom: ListeningRoom = {
                id: roomId,
                name: roomName,
                hostId,
                hostName: 'You',
                stationId: station.stationuuid,
                stationName: station.name,
                stationUrl: station.url,
                listenerCount: 1,
                createdAt: Date.now(),
                lastUpdated: Date.now()
            };

            if (this.firebaseInitialized) {
                // In real implementation, write to Firebase Realtime Database
                // await firebase.database().ref(`rooms/${roomId}`).set(newRoom);
                console.log('ListeningRoomService: Would create room in Firebase', roomId);
            }

            // Add to mock rooms for development
            this.mockRooms.push(newRoom);

            // Set as current room
            this.currentRoomState = {
                currentRoom: newRoom,
                isHost: true,
                participants: [{
                    userId: hostId,
                    userName: 'You',
                    joinedAt: Date.now(),
                    isHost: true
                }],
                isSynced: true,
                connectionStatus: 'connected'
            };

            // Save to local storage
            await AsyncStorage.setItem('listeningRoom_currentRoom', JSON.stringify(newRoom));

            return newRoom;
        } catch (error) {
            console.error('ListeningRoomService: Failed to create room', error);
            return null;
        }
    }

    /**
     * Join an existing room
     */
    async joinRoom(roomId: string): Promise<ListeningRoom | null> {
        try {
            const room = this.mockRooms.find(r => r.id === roomId);
            if (!room) {
                console.error('ListeningRoomService: Room not found', roomId);
                return null;
            }

            // Update listener count
            room.listenerCount += 1;
            room.lastUpdated = Date.now();

            // Set as current room
            this.currentRoomState = {
                currentRoom: room,
                isHost: false,
                participants: [
                    {
                        userId: room.hostId,
                        userName: room.hostName,
                        joinedAt: room.createdAt,
                        isHost: true
                    },
                    {
                        userId: `guest_${Math.random().toString(36).substr(2, 9)}`,
                        userName: 'Guest',
                        joinedAt: Date.now(),
                        isHost: false
                    }
                ],
                isSynced: true,
                connectionStatus: 'connected'
            };

            // Save to local storage
            await AsyncStorage.setItem('listeningRoom_currentRoom', JSON.stringify(room));

            return room;
        } catch (error) {
            console.error('ListeningRoomService: Failed to join room', error);
            return null;
        }
    }

    /**
     * Leave current room
     */
    async leaveRoom(): Promise<void> {
        try {
            const { currentRoom } = this.currentRoomState;
            if (currentRoom) {
                // Update listener count
                const room = this.mockRooms.find(r => r.id === currentRoom.id);
                if (room && room.listenerCount > 0) {
                    room.listenerCount -= 1;
                    room.lastUpdated = Date.now();
                }

                // If host leaves, close the room
                if (this.currentRoomState.isHost) {
                    this.mockRooms = this.mockRooms.filter(r => r.id !== currentRoom.id);
                }
            }

            // Clear current room
            this.currentRoomState = {
                currentRoom: null,
                isHost: false,
                participants: [],
                isSynced: false,
                connectionStatus: 'disconnected'
            };

            // Clear local storage
            await AsyncStorage.removeItem('listeningRoom_currentRoom');
        } catch (error) {
            console.error('ListeningRoomService: Failed to leave room', error);
        }
    }

    /**
     * Change station in current room (host only)
     */
    async setStation(station: Station): Promise<boolean> {
        try {
            const { currentRoom, isHost } = this.currentRoomState;
            if (!currentRoom || !isHost) {
                console.error('ListeningRoomService: Not host or no room');
                return false;
            }

            // Update room station
            currentRoom.stationId = station.stationuuid;
            currentRoom.stationName = station.name;
            currentRoom.stationUrl = station.url;
            currentRoom.lastUpdated = Date.now();

            // Update in mock rooms
            const roomIndex = this.mockRooms.findIndex(r => r.id === currentRoom.id);
            if (roomIndex !== -1) {
                this.mockRooms[roomIndex] = currentRoom;
            }

            // In real implementation, update Firebase
            if (this.firebaseInitialized) {
                // await firebase.database().ref(`rooms/${currentRoom.id}`).update({
                //   stationId: station.id,
                //   stationName: station.name,
                //   stationUrl: station.url,
                //   lastUpdated: Date.now()
                // });
                console.log('ListeningRoomService: Would update station in Firebase');
            }

            return true;
        } catch (error) {
            console.error('ListeningRoomService: Failed to set station', error);
            return false;
        }
    }

    /**
     * Get all available rooms
     */
    async getAvailableRooms(): Promise<ListeningRoom[]> {
        try {
            // In real implementation, fetch from Firebase
            // For now, return mock rooms
            return [...this.mockRooms];
        } catch (error) {
            console.error('ListeningRoomService: Failed to get rooms', error);
            return [];
        }
    }

    /**
     * Get current room state
     */
    getCurrentRoomState(): ListeningRoomState {
        return { ...this.currentRoomState };
    }

    /**
     * Check if user is in a room
     */
    isInRoom(): boolean {
        return this.currentRoomState.currentRoom !== null;
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        await this.leaveRoom();
        this.mockRooms = [];
    }
}

export const listeningRoomService = ListeningRoomService.getInstance();