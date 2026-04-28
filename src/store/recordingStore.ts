import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduledRecording, CompletedRecording } from '../services/recordingService';
import { Station } from '../api/radioBrowser';

interface RecordingState {
    // Scheduled recordings
    scheduledRecordings: ScheduledRecording[];
    // Completed recordings
    completedRecordings: CompletedRecording[];
    // Actions
    addScheduledRecording: (recording: ScheduledRecording) => void;
    updateScheduledRecording: (id: string, updates: Partial<ScheduledRecording>) => void;
    removeScheduledRecording: (id: string) => void;
    addCompletedRecording: (recording: CompletedRecording) => void;
    removeCompletedRecording: (id: string) => void;
    // UI state
    isRecordingModalOpen: boolean;
    setRecordingModalOpen: (open: boolean) => void;
    selectedStationForRecording: Station | null;
    setSelectedStationForRecording: (station: Station | null) => void;
}

export const useRecordingStore = create<RecordingState>()(
    persist(
        (set) => ({
            scheduledRecordings: [],
            completedRecordings: [],
            isRecordingModalOpen: false,
            selectedStationForRecording: null,

            addScheduledRecording: (recording) =>
                set((state) => ({
                    scheduledRecordings: [...state.scheduledRecordings, recording],
                })),

            updateScheduledRecording: (id, updates) =>
                set((state) => ({
                    scheduledRecordings: state.scheduledRecordings.map((rec) =>
                        rec.id === id ? { ...rec, ...updates } : rec
                    ),
                })),

            removeScheduledRecording: (id) =>
                set((state) => ({
                    scheduledRecordings: state.scheduledRecordings.filter((rec) => rec.id !== id),
                })),

            addCompletedRecording: (recording) =>
                set((state) => ({
                    completedRecordings: [...state.completedRecordings, recording],
                })),

            removeCompletedRecording: (id) =>
                set((state) => ({
                    completedRecordings: state.completedRecordings.filter((rec) => rec.id !== id),
                })),

            setRecordingModalOpen: (open) =>
                set({ isRecordingModalOpen: open }),

            setSelectedStationForRecording: (station) =>
                set({ selectedStationForRecording: station }),
        }),
        {
            name: 'recording-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                scheduledRecordings: state.scheduledRecordings,
                completedRecordings: state.completedRecordings,
            }),
        }
    )
);