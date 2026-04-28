import { create } from 'zustand';

interface NavigationState {
    activeTab: number; // 0: Discovery, 1: Player, 2: Archive
    setActiveTab: (index: number) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    activeTab: 1, // Start with Player as default
    setActiveTab: (index) => set({ activeTab: index }),
}));