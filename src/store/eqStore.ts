import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eqService, EQState, EQPreset } from '../services/eqService';

interface EQStoreState extends EQState {
    presets: EQPreset[];
    isEQModalOpen: boolean;

    // Actions
    loadEQState: () => Promise<void>;
    setEnabled: (enabled: boolean) => Promise<void>;
    setBass: (value: number) => Promise<void>;
    setTreble: (value: number) => Promise<void>;
    setBalance: (value: number) => Promise<void>;
    setVolume: (value: number) => Promise<void>;
    applyPreset: (presetId: string) => Promise<void>;
    setEQModalOpen: (open: boolean) => void;
    reset: () => Promise<void>;
    createCustomPreset: (name: string, description: string) => Promise<EQPreset>;
}

export const useEQStore = create<EQStoreState>()(
    persist(
        (set, get) => ({
            // Initial state (will be loaded from service)
            enabled: false,
            bass: 0,
            treble: 0,
            balance: 0,
            volume: 1.0,
            presetId: undefined,
            presets: eqService.getPresets(),
            isEQModalOpen: false,

            loadEQState: async () => {
                const state = eqService.getState();
                const presets = eqService.getPresets();
                set({ ...state, presets });
            },

            setEnabled: async (enabled) => {
                await eqService.setEnabled(enabled);
                const state = eqService.getState();
                set(state);
            },

            setBass: async (value) => {
                await eqService.setBass(value);
                const state = eqService.getState();
                set(state);
            },

            setTreble: async (value) => {
                await eqService.setTreble(value);
                const state = eqService.getState();
                set(state);
            },

            setBalance: async (value) => {
                await eqService.setBalance(value);
                const state = eqService.getState();
                set(state);
            },

            setVolume: async (value) => {
                await eqService.setVolume(value);
                const state = eqService.getState();
                set(state);
            },

            applyPreset: async (presetId) => {
                await eqService.applyPreset(presetId);
                const state = eqService.getState();
                set(state);
            },

            setEQModalOpen: (open) => {
                set({ isEQModalOpen: open });
            },

            reset: async () => {
                await eqService.reset();
                const state = eqService.getState();
                set(state);
            },

            createCustomPreset: async (name, description) => {
                const preset = await eqService.createCustomPreset(name, description);
                const presets = eqService.getPresets();
                set({ presets });
                return preset;
            },
        }),
        {
            name: 'eq-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                enabled: state.enabled,
                bass: state.bass,
                treble: state.treble,
                balance: state.balance,
                volume: state.volume,
                presetId: state.presetId,
            }),
        }
    )
);