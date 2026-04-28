# Radio App - Comprehensive Code Improvement Plan

## Executive Summary

This document provides a line-by-line analysis and improvement recommendations for the Radio App codebase (11,940+ lines of TypeScript/TSX code). The app is an Expo-based React Native radio streaming application with advanced features including audio playback, station discovery, recording, alarms, EQ controls, and social listening rooms.

---

## 1. CRITICAL ISSUES (Priority: High)

### 1.1 Memory Leak in Event Listeners (streamRecovery.ts)

**Location:** `/workspace/src/services/streamRecovery.ts` Lines 15-16, 197-198

**Current Code:**
```typescript
constructor() {
    audioService.on(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStream.bind(this));
    audioService.on(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackError.bind(this));
}

cleanup() {
    audioService.removeListener(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStream.bind(this));
    audioService.removeListener(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackError.bind(this));
}
```

**Issue:** Using `.bind(this)` creates a new function reference each time, so `removeListener` won't match the original listener. This causes memory leaks.

**Fix:**
```typescript
class StreamRecoveryService {
    private isRecovering = false;
    private recoveryAttempts = 0;
    private maxRecoveryAttempts = 3;
    
    // Bind once in constructor or use arrow properties
    private handleDeadStreamBound: (data: { url: string }) => Promise<void>;
    private handlePlaybackErrorBound: (data: { error: any; url: string }) => Promise<void>;

    constructor() {
        this.handleDeadStreamBound = this.handleDeadStream.bind(this);
        this.handlePlaybackErrorBound = this.handlePlaybackError.bind(this);
        
        audioService.on(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStreamBound);
        audioService.on(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackErrorBound);
    }

    cleanup() {
        audioService.removeListener(AUDIO_EVENTS.DEAD_STREAM, this.handleDeadStreamBound);
        audioService.removeListener(AUDIO_EVENTS.PLAYBACK_ERROR, this.handlePlaybackErrorBound);
    }
}
```

**Impact:** Prevents memory leaks, especially important for long-running apps.

---

### 1.2 Missing Error Handling in Async Operations

**Location:** Multiple files

#### 1.2.1 App.tsx Lines 40-80

**Current Code:**
```typescript
useEffect(() => {
    audioService.init();
    
    carPlayService.init().then(success => {
      if (success) {
        console.log('CarPlay/Android Auto service initialized');
      }
    });
    
    castService.init().then(success => {
      if (success) {
        console.log('Chromecast/Cast service initialized');
      }
    });
    // ... more init calls without error handling
}, []);
```

**Issue:** No `.catch()` handlers for rejected promises. Failed initializations silently fail.

**Fix:**
```typescript
useEffect(() => {
    const initializeServices = async () => {
        try {
            await audioService.init();
            
            const carPlaySuccess = await carPlayService.init();
            if (carPlaySuccess) {
                console.log('CarPlay/Android Auto service initialized');
            }
            
            const castSuccess = await castService.init();
            if (castSuccess) {
                console.log('Chromecast/Cast service initialized');
            }
            
            // ... other initializations
        } catch (error) {
            console.error('Service initialization failed:', error);
            // Optionally report to error tracking service
        }
    };
    
    initializeServices();
}, []);
```

**Impact:** Improves reliability and debugging capability.

---

### 1.3 Race Condition in Audio Playback

**Location:** `/workspace/src/services/audioService.ts` Lines 42-90

**Current Code:**
```typescript
async play(url: string, shouldPreBuffer = true) {
    try {
        if (this.sound) {
            await this.stop();
        }

        usePlayerStore.getState().setIsLoading(true);
        this.currentUrl = url;

        if (shouldPreBuffer) {
            const { sound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false },
                this.onPlaybackStatusUpdate
            );

            this.sound = sound;
            await new Promise(resolve => setTimeout(resolve, 500));
            await sound.playAsync();
        }
        // ...
    } catch (error) {
        console.error('Error playing audio', error);
        usePlayerStore.getState().setIsLoading(false);
        usePlayerStore.getState().setIsPlaying(false);
        this.emit(AUDIO_EVENTS.PLAYBACK_ERROR, { error, url });
    }
}
```

**Issue:** 
1. Rapid calls to `play()` can cause race conditions
2. No cancellation token for aborted play requests
3. Hard-coded 500ms buffer wait is not adaptive

**Fix:**
```typescript
private currentPlayRequest: AbortController | null = null;

async play(url: string, shouldPreBuffer = true) {
    // Cancel any ongoing play request
    if (this.currentPlayRequest) {
        this.currentPlayRequest.abort();
    }
    
    this.currentPlayRequest = new AbortController();
    const signal = this.currentPlayRequest.signal;

    try {
        if (this.sound) {
            await this.stop();
        }

        usePlayerStore.getState().setIsLoading(true);
        this.currentUrl = url;

        if (shouldPreBuffer) {
            const { sound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false },
                this.onPlaybackStatusUpdate
            );

            if (signal.aborted) return;

            this.sound = sound;
            
            // Adaptive buffering based on network type
            const bufferTime = this.getAdaptiveBufferTime();
            await this.waitForBuffer(sound, bufferTime, signal);
            
            if (signal.aborted) return;
            
            await sound.playAsync();
        }
        // ...
    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error playing audio', error);
        usePlayerStore.getState().setIsLoading(false);
        usePlayerStore.getState().setIsPlaying(false);
        this.emit(AUDIO_EVENTS.PLAYBACK_ERROR, { error, url });
    } finally {
        if (this.currentPlayRequest === signal) {
            this.currentPlayRequest = null;
        }
    }
}

private getAdaptiveBufferTime(): number {
    const { networkType } = usePlayerStore.getState();
    switch (networkType) {
        case 'wifi': return 300;
        case 'ethernet': return 200;
        case 'cellular': return 800;
        default: return 500;
    }
}

private async waitForBuffer(
    sound: Audio.Sound, 
    ms: number, 
    signal: AbortSignal
): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });
}
```

**Impact:** Prevents audio glitches and resource conflicts during rapid station changes.

---

### 1.4 Direct State Mutation in Zustand Store

**Location:** `/workspace/src/services/audioService.ts` Lines 48, 76-77, 128, 136, 148, 157, 283, 296

**Current Code:**
```typescript
usePlayerStore.getState().setIsLoading(true);
usePlayerStore.getState().setIsPlaying(true);
```

**Issue:** While this works, it's better practice to use the store actions directly for consistency and testability.

**Fix:**
```typescript
// In audioService.ts
import { usePlayerStore } from '../store/playerStore';

// Get actions once at module level or in constructor
const playerActions = {
    setIsLoading: usePlayerStore.getState().setIsLoading,
    setIsPlaying: usePlayerStore.getState().setIsPlaying,
    setCurrentStation: usePlayerStore.getState().setCurrentStation,
    setVolume: usePlayerStore.getState().setVolume,
};

// Then use:
playerActions.setIsLoading(true);
```

**Better Fix:** Use Zustand's bound selectors pattern or subscribe to state changes properly.

---

### 1.5 Unmounted Component State Updates

**Location:** `/workspace/src/screens/PlayerScreen.tsx` Lines 75-80, 128-136

**Current Code:**
```typescript
const loadStations = async () => {
    setLoadingStations(true);
    const data = await fetchTopStations(10);
    setStations(data);
    setLoadingStations(false);
};

// In handleFoundSoundPress:
setTimeout(async () => {
    const clip = await foundSoundService.stopRecording();
    if (clip) {
        soundClipCaptured();
        console.log('Found Sound clip recorded:', clip);
    }
    setIsRecordingClip(false);
}, 30000);
```

**Issue:** If component unmounts before async operations complete, state updates will cause warnings.

**Fix:**
```typescript
const PlayerScreen: React.FC = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [loadingStations, setLoadingStations] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadStations = async () => {
        setLoadingStations(true);
        try {
            const data = await fetchTopStations(10);
            if (isMounted.current) {
                setStations(data);
                setLoadingStations(false);
            }
        } catch (error) {
            if (isMounted.current) {
                setLoadingStations(false);
            }
        }
    };

    // For timeouts, use AbortController or clear on unmount
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        if (isRecordingClip) {
            timeoutId = setTimeout(async () => {
                const clip = await foundSoundService.stopRecording();
                if (clip && isMounted.current) {
                    soundClipCaptured();
                    setIsRecordingClip(false);
                }
            }, 30000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isRecordingClip]);
};
```

**Impact:** Eliminates React warnings and potential memory leaks.

---

## 2. ARCHITECTURE ISSUES (Priority: Medium-High)

### 2.1 Service Initialization Order Not Guaranteed

**Location:** `/workspace/App.tsx` Lines 35-94

**Issue:** Multiple services are initialized in parallel without dependency management. Some services may depend on others being ready first.

**Current Pattern:**
```typescript
useEffect(() => {
    audioService.init();
    carPlayService.init().then(...);
    castService.init().then(...);
    deepLinkService.init().then(...);
    listeningRoomService.init().then(...);
    // All started simultaneously
}, []);
```

**Recommended Fix:**
```typescript
useEffect(() => {
    const initializeApp = async () => {
        try {
            // Phase 1: Core services
            await audioService.init();
            await performanceService.init();
            
            // Phase 2: Dependent services
            await Promise.all([
                carPlayService.init(),
                castService.init(),
                deepLinkService.init(),
            ]);
            
            // Phase 3: Feature services
            await Promise.all([
                listeningRoomService.init(),
                foundSoundService.init(),
                adAwareService.init(),
            ]);
            
            console.log('All services initialized successfully');
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    };
    
    initializeApp();
}, []);
```

**Impact:** Ensures proper initialization order and error handling.

---

### 2.2 Tight Coupling Between Services and UI

**Location:** Multiple service files directly update UI state

**Example:** `/workspace/src/services/audioService.ts` Line 48
```typescript
usePlayerStore.getState().setIsLoading(true);
```

**Issue:** Services should emit events, not directly manipulate state. This makes testing difficult.

**Recommended Architecture:**
```typescript
// audioService.ts
class AudioService extends EventEmitter {
    async play(url: string) {
        this.emit('playback_started', { url });
        // ... playback logic
        this.emit('playback_ready', { url });
    }
}

// In a store or container
audioService.on('playback_started', () => {
    usePlayerStore.getState().setIsLoading(true);
});

audioService.on('playback_ready', () => {
    usePlayerStore.getState().setIsLoading(false);
    usePlayerStore.getState().setIsPlaying(true);
});
```

**Impact:** Improves testability and separation of concerns.

---

### 2.3 Missing Service Registry/Manager

**Issue:** Services are imported and initialized ad-hoc across the app. No central service lifecycle management.

**Recommended Solution:**
```typescript
// src/services/serviceManager.ts
interface Service {
    init(): Promise<boolean>;
    cleanup(): Promise<void>;
    name: string;
}

class ServiceManager {
    private services: Map<string, Service> = new Map();
    private initialized: Set<string> = new Set();

    register(name: string, service: Service): void {
        this.services.set(name, service);
    }

    async initialize(name: string): Promise<boolean> {
        const service = this.services.get(name);
        if (!service) {
            console.error(`Service ${name} not registered`);
            return false;
        }

        try {
            const success = await service.init();
            if (success) {
                this.initialized.add(name);
            }
            return success;
        } catch (error) {
            console.error(`Failed to initialize ${name}:`, error);
            return false;
        }
    }

    async initializeAll(): Promise<void> {
        const results = await Promise.allSettled(
            Array.from(this.services.keys()).map(name => this.initialize(name))
        );
        
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            console.warn(`${failures.length} services failed to initialize`);
        }
    }

    async cleanup(name?: string): Promise<void> {
        if (name) {
            const service = this.services.get(name);
            if (service && this.initialized.has(name)) {
                await service.cleanup();
                this.initialized.delete(name);
            }
        } else {
            // Cleanup all in reverse order
            const names = Array.from(this.initialized).reverse();
            await Promise.all(names.map(n => this.cleanup(n)));
        }
    }
}

export const serviceManager = new ServiceManager();
```

**Usage in App.tsx:**
```typescript
useEffect(() => {
    // Register services
    serviceManager.register('audio', audioService);
    serviceManager.register('carPlay', carPlayService);
    // ...
    
    // Initialize all
    serviceManager.initializeAll();
    
    return () => {
        serviceManager.cleanup();
    };
}, []);
```

**Impact:** Centralized service lifecycle management, easier testing and maintenance.

---

### 2.4 Inconsistent Error Handling Strategy

**Location:** Throughout codebase

**Observation:** Different services use different error handling patterns:
- Some use try-catch with console.error
- Some emit error events
- Some return boolean success flags
- Some throw errors

**Recommended Standard:**
```typescript
// Define standard error types
class RadioAppError extends Error {
    constructor(
        message: string,
        public code: string,
        public severity: 'low' | 'medium' | 'high' | 'critical',
        public recoverable: boolean = true
    ) {
        super(message);
        this.name = 'RadioAppError';
    }
}

// Usage in services
class AudioService {
    async play(url: string) {
        try {
            // ... logic
        } catch (error) {
            const appError = new RadioAppError(
                'Failed to play audio stream',
                'AUDIO_PLAY_FAILED',
                'high',
                true
            );
            
            // Log with context
            console.error(appError, { url, context: this.getContext() });
            
            // Emit for error tracking
            this.emit('error', appError);
            
            // Re-throw if not recoverable
            if (!appError.recoverable) {
                throw appError;
            }
        }
    }
}
```

**Impact:** Consistent error handling, better monitoring and debugging.

---

## 3. CODE QUALITY ISSUES (Priority: Medium)

### 3.1 Magic Numbers

**Location:** Multiple files

#### Examples:

**audioService.ts Line 187:**
```typescript
if (this.silentCounter >= 5) { // 5 seconds of silence
```

**audioService.ts Line 209:**
```typescript
}, 1000); // Check every second
```

**audioService.ts Line 258:**
```typescript
}, 500); // Check buffer every 500ms
```

**PlayerScreen.tsx Line 91:**
```typescript
setTimeout(() => {
    audioService.play(station.url_resolved);
}, 100); // Why 100ms?
```

**Fix:**
```typescript
// constants/timeouts.ts
export const AUDIO_CONSTANTS = {
    DEAD_STREAM_THRESHOLD_SECONDS: 5,
    DEAD_STREAM_CHECK_INTERVAL_MS: 1000,
    BUFFER_CHECK_INTERVAL_MS: 500,
    STATION_CHANGE_DELAY_MS: 100,
    BUFFER_BUILDUP_TIME_MS: 500,
    LOW_BUFFER_THRESHOLD_PERCENT: 10,
    REBUFFER_PAUSE_MS: 500,
} as const;

// Usage
if (this.silentCounter >= AUDIO_CONSTANTS.DEAD_STREAM_THRESHOLD_SECONDS) {
```

**Impact:** Improves maintainability and allows easy tuning.

---

### 3.2 Console Logging in Production

**Location:** Throughout codebase

**Examples:**
- `App.tsx` Lines 42, 48, 54, 64, 71, 78, 83-85, 90-91
- `audioService.ts` Lines 36, 83, 85, 102, 117, 119, etc.
- Nearly every service file

**Issue:** Console logs should be stripped or minimized in production builds.

**Fix:**
```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private level: LogLevel = __DEV__ ? 'debug' : 'warn';
    
    private log(level: LogLevel, message: string, data?: any) {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        if (levels.indexOf(level) < levels.indexOf(this.level)) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}][${level.toUpperCase()}]`;
        
        switch (level) {
            case 'debug':
                console.debug(prefix, message, data ?? '');
                break;
            case 'info':
                console.info(prefix, message, data ?? '');
                break;
            case 'warn':
                console.warn(prefix, message, data ?? '');
                break;
            case 'error':
                console.error(prefix, message, data ?? '');
                break;
        }
    }

    debug(message: string, data?: any) {
        this.log('debug', message, data);
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, error?: any) {
        this.log('error', message, error);
    }
}

export const logger = new Logger();

// Usage
logger.info('AudioService initialized');
logger.error('Failed to play audio', error);
```

**Impact:** Reduces production log noise while maintaining debug capability.

---

### 3.3 Type Safety Issues

#### 3.3.1 Any Types

**Location:** Multiple files

**audioService.ts Line 281:**
```typescript
private onPlaybackStatusUpdate = (status: any) => {
```

**streamRecovery.ts Line 62:**
```typescript
private async handlePlaybackError(data: { error: any; url: string }) {
```

**Fix:**
```typescript
// types/audio.ts
export interface PlaybackStatus {
    isLoaded: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    playableDurationMillis: number;
    durationMillis: number;
    error?: string;
}

export interface BufferInfo {
    positionMillis: number;
    playableDurationMillis: number;
    durationMillis: number;
    isBuffering: boolean;
}

// Usage
private onPlaybackStatusUpdate = (status: PlaybackStatus) => {
```

---

#### 3.3.2 Missing Null Checks

**PlayerScreen.tsx Lines 62-63:**
```typescript
const stationTime = useStationTime(currentStation?.countrycode);
```

**Issue:** Optional chaining is good, but downstream code may not handle undefined properly.

**Fix:**
```typescript
const stationTime = useStationTime(currentStation?.countrycode);

// Later in JSX
{currentStation && (
    <View style={styles.timeZoneSection}>
        <ClockFace timeInfo={stationTime} size={100} showDigital={false} />
        {/* stationTime could still have undefined properties */}
    </View>
)}
```

**Better:** Ensure hooks always return valid default values:
```typescript
export const useStationTime = (countrycode?: string): StationTimeInfo => {
    // Always return a valid object even if countrycode is undefined
    if (!countrycode) {
        return {
            timeString: '--:--',
            timeZone: 'Unknown',
            isUnknown: true,
            // ... other required fields
        };
    }
    // ... rest of logic
};
```

---

### 3.4 Duplicate Code

#### 3.4.1 Similar Search Functions

**radioBrowser.ts Lines 41-111:**
```typescript
export const searchStations = async (query: string, limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        name: query,
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations', error);
    return [];
  }
};

export const searchStationsByTags = async (tags: string[], limit: number = 20): Promise<Station[]> => {
  try {
    const response = await axios.get<Station[]>(`${RADIO_BROWSER_API_BASE}/stations/search`, {
      params: {
        tagList: tags.join(','),
        limit,
        hidebroken: true,
        order: 'clickcount',
        reverse: true,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search stations by tags', error);
    return [];
  }
};
```

**Fix:**
```typescript
// Create a generic search function
interface SearchParams {
    name?: string;
    tagList?: string;
    language?: string;
    countrycode?: string;
    limit?: number;
}

const searchStationsGeneric = async (params: SearchParams): Promise<Station[]> => {
    try {
        const response = await axios.get<Station[]>(
            `${RADIO_BROWSER_API_BASE}/stations/search`,
            {
                params: {
                    ...params,
                    limit: params.limit ?? 20,
                    hidebroken: true,
                    order: 'clickcount',
                    reverse: true,
                }
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Failed to search stations', error);
        return [];
    }
};

export const searchStations = (query: string, limit?: number) =>
    searchStationsGeneric({ name: query, limit });

export const searchStationsByTags = (tags: string[], limit?: number) =>
    searchStationsGeneric({ tagList: tags.join(','), limit });

export const searchStationsByLanguage = (language: string, limit?: number) =>
    searchStationsGeneric({ language, limit });

export const searchStationsByCountry = (countrycode: string, limit?: number) =>
    searchStationsGeneric({ countrycode, limit });
```

**Impact:** Reduces code duplication, easier to maintain.

---

### 3.5 Long Functions

**Location:** Several files

**PlayerScreen.tsx:** The component is 672 lines with many handlers.

**Recommendation:** Break into smaller custom hooks:
```typescript
// hooks/usePlayerControls.ts
export const usePlayerControls = () => {
    const { currentStation, isPlaying, setCurrentStation } = usePlayerStore();
    
    const handlePlayPause = useCallback(async () => {
        if (isPlaying) {
            await audioService.pause();
        } else if (currentStation) {
            await audioService.resume();
        }
    }, [isPlaying, currentStation]);

    const handlePlayStation = useCallback(async (station: Station) => {
        if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
            await audioService.pause();
        } else {
            setCurrentStation(station);
            stationChange();
            setTimeout(() => {
                audioService.play(station.url_resolved);
            }, 100);
        }
    }, [currentStation, isPlaying, setCurrentStation]);

    return {
        handlePlayPause,
        handlePlayStation,
    };
};

// hooks/useWeekFeatures.ts
export const useWeekFeatures = () => {
    const [isRecordingClip, setIsRecordingClip] = useState(false);
    const [adBreakActive, setAdBreakActive] = useState(false);
    
    const handleFoundSoundPress = useCallback(async () => {
        // ... implementation
    }, []);

    const handleAdBreakPress = useCallback(() => {
        // ... implementation
    }, []);

    return {
        isRecordingClip,
        adBreakActive,
        handleFoundSoundPress,
        handleAdBreakPress,
    };
};
```

**Impact:** Improves readability and testability.

---

## 4. PERFORMANCE ISSUES (Priority: Medium)

### 4.1 Inefficient Interval Timers

**Location:** `audioService.ts` Lines 174-209, 218-258

**Issue:** Two separate intervals running concurrently, both calling `getStatusAsync()` which is potentially expensive.

**Current:**
```typescript
private startDeadStreamWatchdog() {
    this.deadStreamWatchdog = setInterval(async () => {
        const status = await this.sound.getStatusAsync();
        // ... check dead stream
    }, 1000);
}

private startBufferWatchdog() {
    this.bufferWatchdog = setInterval(async () => {
        const status = await this.sound.getStatusAsync();
        // ... check buffer
    }, 500);
}
```

**Optimized:**
```typescript
private startWatchdogs() {
    this.stopWatchdogs();

    this.watchdogInterval = setInterval(async () => {
        if (!this.sound) return;

        try {
            const status = await this.sound.getStatusAsync();
            
            // Check dead stream (every 5th iteration = 5 seconds)
            if (this.watchdogCounter % 5 === 0) {
                this.checkDeadStream(status);
            }
            
            // Check buffer (every iteration = 1 second)
            this.checkBuffer(status);
            
            this.watchdogCounter++;
        } catch (error) {
            logger.error('Watchdog error', error);
        }
    }, 1000);
}

private checkDeadStream(status: PlaybackStatus) {
    if (status.isLoaded && !status.isPlaying && !status.isBuffering) {
        const { isPlaying } = usePlayerStore.getState();
        if (isPlaying) {
            this.silentCounter++;
            if (this.silentCounter >= AUDIO_CONSTANTS.DEAD_STREAM_THRESHOLD_SECONDS) {
                logger.warn('Dead stream detected');
                this.emit(AUDIO_EVENTS.DEAD_STREAM, { url: this.currentUrl });
                this.silentCounter = 0;
            }
        }
    } else {
        this.silentCounter = 0;
    }
}

private checkBuffer(status: PlaybackStatus) {
    if (status.isLoaded && status.durationMillis && status.playableDurationMillis) {
        const bufferPercent = (status.playableDurationMillis / status.durationMillis) * 100;
        
        this.emit(AUDIO_EVENTS.BUFFER_UPDATE, {
            positionMillis: status.positionMillis,
            playableDurationMillis: status.playableDurationMillis,
            durationMillis: status.durationMillis,
            isBuffering: status.isBuffering,
        });

        if (bufferPercent < AUDIO_CONSTANTS.LOW_BUFFER_THRESHOLD_PERCENT && 
            !status.isBuffering && 
            status.isPlaying) {
            logger.warn('Low buffer detected, rebuffering');
            this.rebuffer();
        }
    }
}
```

**Impact:** Reduces CPU usage and API calls by 50%.

---

### 4.2 Unnecessary Re-renders

**Location:** `PlayerScreen.tsx`

**Issue:** Multiple state variables causing frequent re-renders.

**Current:**
```typescript
const [isRecordingClip, setIsRecordingClip] = useState(false);
const [adBreakActive, setAdBreakActive] = useState(false);
const [listeningRooms, setListeningRooms] = useState<any[]>([]);
const [isDevConnectVisible, setIsDevConnectVisible] = useState(false);
```

**Optimization:**
```typescript
// Combine related state
interface WeekFeaturesState {
    isRecordingClip: boolean;
    adBreakActive: boolean;
    listeningRooms: ListeningRoom[];
}

const [weekFeatures, setWeekFeatures] = useState<WeekFeaturesState>({
    isRecordingClip: false,
    adBreakActive: false,
    listeningRooms: [],
});

// Or use Zustand for feature state too
const useWeekFeaturesStore = create(() => ({
    isRecordingClip: false,
    adBreakActive: false,
    listeningRooms: [],
    // actions...
}));
```

**Also:** Use `React.memo` for child components:
```typescript
const StationItem = React.memo(({ 
    station, 
    isActive, 
    isPlaying, 
    isLoading, 
    onPlay 
}: StationItemProps) => {
    // ... render
});
```

**Impact:** Reduces unnecessary renders, improves UI responsiveness.

---

### 4.3 Image Loading Without Optimization

**Location:** Components that display station favicons (not shown in sampled files but likely present)

**Recommendation:**
```typescript
// Use expo-image for better performance
import { Image } from 'expo-image';

<Image
    source={{ uri: station.favicon }}
    style={styles.stationIcon}
    placeholder={{ blurhash: station.blurhash }} // if available
    contentFit="contain"
    recyclingKey={station.stationuuid}
/>
```

**Impact:** Faster image loading, better caching.

---

## 5. SECURITY ISSUES (Priority: Medium-High)

### 5.1 No Input Validation for API Responses

**Location:** `radioBrowser.ts`

**Issue:** API responses are used directly without validation.

**Fix:**
```typescript
import { z } from 'zod';

const StationSchema = z.object({
    stationuuid: z.string().uuid(),
    name: z.string().min(1),
    url: z.string().url(),
    url_resolved: z.string().url(),
    homepage: z.string().url().optional(),
    favicon: z.string().url().optional(),
    tags: z.string(),
    country: z.string(),
    countrycode: z.string().length(2),
    state: z.string().optional(),
    language: z.string(),
    votes: z.number().int().nonnegative(),
    // ... other fields
});

type Station = z.infer<typeof StationSchema>;

export const fetchTopStations = async (limit: number = 20): Promise<Station[]> => {
    try {
        const response = await axios.get(`${RADIO_BROWSER_API_BASE}/stations/topclick/${limit}`);
        
        // Validate response
        const validatedData = z.array(StationSchema).parse(response.data);
        return validatedData;
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('API response validation failed', error.errors);
        } else {
            logger.error('Failed to fetch top stations', error);
        }
        return [];
    }
};
```

**Impact:** Prevents crashes from malformed API responses.

---

### 5.2 Deep Link Security

**Location:** `deepLinkService.ts` (not fully reviewed but mentioned in imports)

**Recommendation:**
```typescript
// Validate and sanitize deep link parameters
const validateDeepLink = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        
        // Only allow expected hosts
        const allowedHosts = ['radioworld.app', 'www.radioworld.app'];
        if (!allowedHosts.includes(parsed.hostname)) {
            return false;
        }
        
        // Validate path and params
        const allowedPaths = ['/station', '/share', '/room'];
        if (!allowedPaths.includes(parsed.pathname)) {
            return false;
        }
        
        return true;
    } catch {
        return false;
    }
};
```

**Impact:** Prevents malicious deep links.

---

## 6. TESTING GAPS (Priority: Medium)

### 6.1 No Unit Tests

**Observation:** No test files found in the codebase.

**Recommendation:** Add Jest + React Native Testing Library setup:

```typescript
// __tests__/audioService.test.ts
import { audioService } from '../src/services/audioService';
import { usePlayerStore } from '../src/store/playerStore';

describe('AudioService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        audioService.cleanup();
    });

    describe('play', () => {
        it('should set loading state to true', async () => {
            const mockSound = { /* mock */ };
            jest.spyOn(Audio.Sound, 'createAsync').mockResolvedValue({ sound: mockSound } as any);
            
            await audioService.play('https://test.stream/url');
            
            expect(usePlayerStore.getState().isLoading).toBe(true);
        });

        it('should emit error event on failure', async () => {
            const errorHandler = jest.fn();
            audioService.on(AUDIO_EVENTS.PLAYBACK_ERROR, errorHandler);
            
            jest.spyOn(Audio.Sound, 'createAsync').mockRejectedValue(new Error('Test error'));
            
            await audioService.play('invalid-url');
            
            expect(errorHandler).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.any(Error) })
            );
        });
    });
});
```

**Impact:** Ensures code reliability and prevents regressions.

---

### 6.2 No Integration Tests

**Recommendation:** Add Detox or similar for E2E testing:
```typescript
// e2e/playerFlow.test.js
describe('Player Flow', () => {
    it('should play a station when tapped', async () => {
        await element(by.text('BBC Radio 1')).tap();
        await expect(element(by.text('PAUSE'))).toBeVisible();
    });
});
```

---

## 7. DOCUMENTATION GAPS (Priority: Low-Medium)

### 7.1 Missing JSDoc Comments

**Location:** Most functions lack documentation.

**Fix:**
```typescript
/**
 * Play an audio stream from the given URL
 * 
 * @param url - The stream URL to play
 * @param shouldPreBuffer - Whether to pre-buffer before playing (default: true)
 * @returns Promise that resolves when playback starts
 * 
 * @throws {RadioAppError} With code 'AUDIO_PLAY_FAILED' if playback cannot start
 * 
 * @example
 * ```typescript
 * await audioService.play('https://stream.example.com/live');
 * ```
 */
async play(url: string, shouldPreBuffer = true): Promise<void> {
    // ...
}
```

---

### 7.2 No README for Services

**Recommendation:** Create `src/services/README.md`:
```markdown
# Services Architecture

## Core Services
- **audioService**: Handles all audio playback, buffering, and stream management
- **networkMonitor**: Monitors network connectivity and type changes

## Feature Services
- **alarmService**: Manages alarm scheduling and triggering
- **recordingService**: Handles scheduled and manual recordings
- **sleepTimerService**: Implements sleep timer with fade-out

## Integration Services
- **carPlayService**: CarPlay/Android Auto integration
- **castService**: Chromecast support
- **deepLinkService**: Handle deep links

## Service Lifecycle
All services follow the pattern:
1. `init()`: Initialize service resources
2. `cleanup()`: Release resources

Use `serviceManager` for coordinated initialization.
```

---

## 8. ACCESSIBILITY ISSUES (Priority: Medium)

### 8.1 Incomplete Accessibility Labels

**Location:** `PlayerScreen.tsx` Lines 208-214

**Current:**
```typescript
<TouchableOpacity
    style={styles.devButton}
    onPress={handleDevConnectPress}
    accessibilityLabel="Developer connection"
>
    <Text style={styles.devIcon}>⚙️</Text>
</TouchableOpacity>
```

**Issue:** Many buttons lack proper accessibility labels.

**Fix:**
```typescript
<TouchableOpacity
    style={styles.playButton}
    onPress={handlePlayPause}
    disabled={!currentStation}
    accessibilityLabel={isPlaying ? 'Pause playback' : 'Start playback'}
    accessibilityRole="button"
    accessibilityState={{ disabled: !currentStation }}
>
    <Text style={styles.playButtonText}>
        {isPlaying ? 'PAUSE' : 'PLAY'}
    </Text>
</TouchableOpacity>
```

**Also:** Use the existing `accessibilityService` consistently throughout.

---

## 9. DEPENDENCY MANAGEMENT (Priority: Low)

### 9.1 Outdated Dependencies

**package.json Analysis:**
- Most dependencies are up-to-date
- Consider adding:
  - `zod` for runtime validation
  - `react-query` or `tanstack-query` for API caching
  - `eslint-plugin-react-hooks` for linting

### 9.2 Missing Dev Dependencies

**Recommendation:**
```json
{
  "devDependencies": {
    "@types/react": "~19.1.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0",
    "typescript": "~5.9.2"
  }
}
```

---

## 10. RECOMMENDED REFACTORING ROADMAP

### Phase 1: Critical Fixes (Week 1-2)
1. Fix memory leaks in event listeners
2. Add proper error handling to all async operations
3. Fix race conditions in audio playback
4. Add mounted checks for async state updates

### Phase 2: Architecture Improvements (Week 3-4)
1. Implement service manager
2. Decouple services from UI state
3. Standardize error handling
4. Add logging utility

### Phase 3: Code Quality (Week 5-6)
1. Extract constants for magic numbers
2. Reduce code duplication
3. Break down large components
4. Add type definitions

### Phase 4: Performance (Week 7-8)
1. Optimize watchdog timers
2. Add memoization
3. Implement image optimization
4. Profile and optimize re-renders

### Phase 5: Testing & Documentation (Week 9-10)
1. Set up testing infrastructure
2. Write unit tests for core services
3. Add integration tests
4. Document all public APIs

---

## SUMMARY STATISTICS

| Category | Issues Found | Priority |
|----------|-------------|----------|
| Critical Bugs | 5 | High |
| Architecture | 4 | Medium-High |
| Code Quality | 5 | Medium |
| Performance | 3 | Medium |
| Security | 2 | Medium-High |
| Testing | 2 | Medium |
| Documentation | 2 | Low-Medium |
| Accessibility | 1 | Medium |
| Dependencies | 2 | Low |
| **Total** | **26** | |

---

## CONCLUSION

The Radio App codebase demonstrates solid functionality with many advanced features. However, there are significant opportunities for improvement in:

1. **Memory management** - Event listener leaks must be fixed immediately
2. **Error handling** - Inconsistent patterns need standardization
3. **Architecture** - Service coupling and lifecycle management need refactoring
4. **Testing** - Complete absence of tests is a major risk
5. **Performance** - Timer optimizations and render reductions needed

Implementing these improvements will result in a more stable, maintainable, and performant application.
