import { audioService } from './audioService';

export interface EQPreset {
    id: string;
    name: string;
    description: string;
    bass: number; // -10 to +10 dB
    treble: number; // -10 to +10 dB
    balance: number; // -1.0 (left) to +1.0 (right)
}

export interface EQState {
    enabled: boolean;
    bass: number; // -10 to +10 dB
    treble: number; // -10 to +10 dB
    balance: number; // -1.0 (left) to +1.0 (right)
    presetId?: string;
    volume: number; // 0.0 to 1.0 (master volume)
}

export const DEFAULT_PRESETS: EQPreset[] = [
    {
        id: 'flat',
        name: 'Flat',
        description: 'Neutral sound',
        bass: 0,
        treble: 0,
        balance: 0,
    },
    {
        id: 'pop',
        name: 'Pop',
        description: 'Enhanced bass and treble',
        bass: 4,
        treble: 3,
        balance: 0,
    },
    {
        id: 'jazz',
        name: 'Jazz',
        description: 'Warm, balanced sound',
        bass: 2,
        treble: 1,
        balance: 0,
    },
    {
        id: 'classical',
        name: 'Classical',
        description: 'Clear highs, natural balance',
        bass: -1,
        treble: 2,
        balance: 0,
    },
    {
        id: 'rock',
        name: 'Rock',
        description: 'Aggressive bass and mids',
        bass: 5,
        treble: 2,
        balance: 0,
    },
    {
        id: 'bass_boost',
        name: 'Bass Boost',
        description: 'Heavy bass emphasis',
        bass: 8,
        treble: 0,
        balance: 0,
    },
    {
        id: 'vocal',
        name: 'Vocal',
        description: 'Enhanced vocal clarity',
        bass: -2,
        treble: 4,
        balance: 0,
    },
];

class EQService {
    private state: EQState = {
        enabled: false,
        bass: 0,
        treble: 0,
        balance: 0,
        volume: 1.0,
    };
    private presets: EQPreset[] = DEFAULT_PRESETS;
    private listeners: ((state: EQState) => void)[] = [];

    constructor() {
        this.loadState();
    }

    private async loadState() {
        // In a real implementation, load from AsyncStorage
        // For now, use defaults
        this.notifyListeners();
    }

    private async saveState() {
        // In a real implementation, save to AsyncStorage
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    subscribe(listener: (state: EQState) => void) {
        this.listeners.push(listener);
        listener(this.state); // Initial call
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    getState(): EQState {
        return { ...this.state };
    }

    async setEnabled(enabled: boolean): Promise<void> {
        this.state.enabled = enabled;
        await this.applyEQ();
        await this.saveState();
    }

    async setBass(value: number): Promise<void> {
        this.state.bass = Math.max(-10, Math.min(10, value));
        this.state.presetId = undefined; // Custom settings, no preset
        await this.applyEQ();
        await this.saveState();
    }

    async setTreble(value: number): Promise<void> {
        this.state.treble = Math.max(-10, Math.min(10, value));
        this.state.presetId = undefined; // Custom settings, no preset
        await this.applyEQ();
        await this.saveState();
    }

    async setBalance(value: number): Promise<void> {
        this.state.balance = Math.max(-1.0, Math.min(1.0, value));
        this.state.presetId = undefined; // Custom settings, no preset
        await this.applyEQ();
        await this.saveState();
    }

    async setVolume(value: number): Promise<void> {
        this.state.volume = Math.max(0.0, Math.min(1.0, value));
        await audioService.setVolume(value);
        await this.saveState();
    }

    async applyPreset(presetId: string): Promise<void> {
        const preset = this.presets.find(p => p.id === presetId);
        if (!preset) {
            throw new Error(`Preset ${presetId} not found`);
        }

        this.state.bass = preset.bass;
        this.state.treble = preset.treble;
        this.state.balance = preset.balance;
        this.state.presetId = presetId;
        this.state.enabled = true;

        await this.applyEQ();
        await this.saveState();
    }

    async applyEQ(): Promise<void> {
        if (!this.state.enabled) {
            // Reset to flat if EQ is disabled
            // In a real implementation, we would reset audio processing
            console.log('EQ disabled - using flat response');
            return;
        }

        // In a real implementation, this would apply actual audio processing
        // using Web Audio API or native audio processing
        // For this demo, we'll just log the EQ settings

        console.log('Applying EQ settings:', {
            bass: `${this.state.bass}dB`,
            treble: `${this.state.treble}dB`,
            balance: this.state.balance > 0 ? `Right ${this.state.balance}` :
                this.state.balance < 0 ? `Left ${-this.state.balance}` : 'Center',
            volume: `${Math.round(this.state.volume * 100)}%`,
        });

        // Apply volume through audio service
        await audioService.setVolume(this.state.volume);

        // Note: Actual bass/treble/balance adjustment would require
        // audio processing capabilities not available in Expo AV by default.
        // In a production app, you would need to use a native module
        // or Web Audio API (if on web).
    }

    getPresets(): EQPreset[] {
        return [...this.presets];
    }

    getPreset(id: string): EQPreset | undefined {
        return this.presets.find(p => p.id === id);
    }

    async createCustomPreset(name: string, description: string): Promise<EQPreset> {
        const preset: EQPreset = {
            id: `custom_${Date.now()}`,
            name,
            description,
            bass: this.state.bass,
            treble: this.state.treble,
            balance: this.state.balance,
        };

        this.presets.push(preset);
        // In real implementation, save to storage
        return preset;
    }

    async reset(): Promise<void> {
        this.state = {
            enabled: false,
            bass: 0,
            treble: 0,
            balance: 0,
            volume: 1.0,
            presetId: undefined,
        };
        await this.applyEQ();
        await this.saveState();
    }

    // Helper to convert dB to linear gain
    private dbToGain(db: number): number {
        return Math.pow(10, db / 20);
    }

    // Helper to convert linear gain to dB
    private gainToDb(gain: number): number {
        return 20 * Math.log10(gain);
    }
}

export const eqService = new EQService();