import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alarmService, Alarm } from '../services/alarmService';

interface AlarmState {
    alarms: Alarm[];
    isLoading: boolean;
    isAlarmModalOpen: boolean;
    editingAlarm: Alarm | null;

    // Actions
    loadAlarms: () => Promise<void>;
    addAlarm: (alarmData: Omit<Alarm, 'id' | 'createdAt'>) => Promise<Alarm>;
    updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<Alarm | null>;
    deleteAlarm: (id: string) => Promise<boolean>;
    toggleAlarm: (id: string) => Promise<Alarm | null>;
    setAlarmModalOpen: (open: boolean) => void;
    setEditingAlarm: (alarm: Alarm | null) => void;
    getUpcomingAlarms: (limit?: number) => { alarm: Alarm; nextTrigger: Date }[];
    snoozeAlarm: (alarmId: string) => Promise<void>;
    dismissAlarm: (alarmId: string) => Promise<void>;
}

export const useAlarmStore = create<AlarmState>()(
    persist(
        (set, get) => ({
            alarms: [],
            isLoading: false,
            isAlarmModalOpen: false,
            editingAlarm: null,

            loadAlarms: async () => {
                set({ isLoading: true });
                try {
                    const alarms = await alarmService.loadAlarms();
                    set({ alarms, isLoading: false });
                } catch (error) {
                    console.error('Failed to load alarms:', error);
                    set({ isLoading: false });
                }
            },

            addAlarm: async (alarmData) => {
                const alarm = await alarmService.createAlarm(alarmData);
                set((state) => ({ alarms: [...state.alarms, alarm] }));
                return alarm;
            },

            updateAlarm: async (id, updates) => {
                const updated = await alarmService.updateAlarm(id, updates);
                if (updated) {
                    set((state) => ({
                        alarms: state.alarms.map((a) => (a.id === id ? updated : a)),
                    }));
                }
                return updated;
            },

            deleteAlarm: async (id) => {
                const success = await alarmService.deleteAlarm(id);
                if (success) {
                    set((state) => ({
                        alarms: state.alarms.filter((a) => a.id !== id),
                    }));
                }
                return success;
            },

            toggleAlarm: async (id) => {
                const updated = await alarmService.toggleAlarm(id);
                if (updated) {
                    set((state) => ({
                        alarms: state.alarms.map((a) => (a.id === id ? updated : a)),
                    }));
                }
                return updated;
            },

            setAlarmModalOpen: (open) => {
                set({ isAlarmModalOpen: open });
                if (!open) {
                    set({ editingAlarm: null });
                }
            },

            setEditingAlarm: (alarm) => {
                set({ editingAlarm: alarm });
            },

            getUpcomingAlarms: (limit = 5) => {
                return alarmService.getUpcomingAlarms(limit);
            },

            snoozeAlarm: async (alarmId) => {
                await alarmService.snoozeAlarm(alarmId);
            },

            dismissAlarm: async (alarmId) => {
                await alarmService.dismissAlarm(alarmId);
            },
        }),
        {
            name: 'alarm-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                alarms: state.alarms,
            }),
        }
    )
);