import { useEffect, useRef, useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Performance optimization service for improving app responsiveness and reducing jank
 */
export class PerformanceService {
    private static instance: PerformanceService;
    private isPerfMonitoringEnabled: boolean = __DEV__; // Enable in dev by default
    private perfMetrics: Map<string, number> = new Map();
    private frameTimeThreshold: number = 16.67; // 60fps threshold in ms

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): PerformanceService {
        if (!PerformanceService.instance) {
            PerformanceService.instance = new PerformanceService();
        }
        return PerformanceService.instance;
    }

    /**
     * Enable or disable performance monitoring
     */
    setPerfMonitoring(enabled: boolean): void {
        this.isPerfMonitoringEnabled = enabled;
    }

    /**
     * Start measuring performance for a specific operation
     */
    startMeasure(operationName: string): void {
        if (!this.isPerfMonitoringEnabled) return;
        this.perfMetrics.set(operationName, performance.now());
    }

    /**
     * End measurement and log the duration
     */
    endMeasure(operationName: string): number {
        if (!this.isPerfMonitoringEnabled) return 0;

        const startTime = this.perfMetrics.get(operationName);
        if (!startTime) return 0;

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.perfMetrics.delete(operationName);

        if (duration > this.frameTimeThreshold) {
            console.warn(`[PERF] ${operationName} took ${duration.toFixed(2)}ms (exceeds frame budget)`);
        } else if (__DEV__) {
            console.log(`[PERF] ${operationName} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Run expensive operation after interactions complete
     */
    runAfterInteractions(callback: () => void): void {
        InteractionManager.runAfterInteractions(callback);
    }

    /**
     * Debounce function to limit frequent calls
     */
    debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout | null = null;

        return (...args: Parameters<T>) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Throttle function to limit call frequency
     */
    throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean = false;

        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * Memoize expensive calculations
     */
    memoize<T extends (...args: any[]) => any>(func: T): T {
        const cache = new Map<string, ReturnType<T>>();

        return ((...args: Parameters<T>): ReturnType<T> => {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key)!;
            }
            const result = func(...args);
            cache.set(key, result);
            return result;
        }) as T;
    }

    /**
     * Optimize list rendering for large datasets
     */
    optimizeListRendering<T>(
        data: T[],
        keyExtractor: (item: T, index: number) => string,
        batchSize: number = 20
    ): { initialBatch: T[]; loadMore: () => void; hasMore: boolean } {
        const [visibleCount, setVisibleCount] = useState(batchSize);

        const loadMore = useCallback(() => {
            setVisibleCount(prev => Math.min(prev + batchSize, data.length));
        }, [data.length, batchSize]);

        return {
            initialBatch: data.slice(0, visibleCount),
            loadMore,
            hasMore: visibleCount < data.length,
        };
    }

    /**
     * Check if component should update (shallow comparison)
     */
    shouldComponentUpdate<T extends Record<string, any>>(
        prevProps: T,
        nextProps: T,
        keys: Array<keyof T> = Object.keys(prevProps) as Array<keyof T>
    ): boolean {
        for (const key of keys) {
            if (prevProps[key] !== nextProps[key]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Optimize image loading with placeholders
     */
    async preloadImages(urls: string[]): Promise<void> {
        // In a real app, you would use an image caching library
        // This is a placeholder for image preloading logic
        console.log(`[PERF] Preloading ${urls.length} images`);
    }

    /**
     * Clean up resources to prevent memory leaks
     */
    cleanup(): void {
        this.perfMetrics.clear();
    }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance();

// React hooks for performance optimization
export const usePerformance = () => {
    const service = performanceService;

    const startMeasure = useCallback((operationName: string) => {
        service.startMeasure(operationName);
    }, [service]);

    const endMeasure = useCallback((operationName: string) => {
        return service.endMeasure(operationName);
    }, [service]);

    const runAfterInteractions = useCallback((callback: () => void) => {
        service.runAfterInteractions(callback);
    }, [service]);

    const debounce = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ) => {
        return service.debounce(func, wait);
    }, [service]);

    const throttle = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ) => {
        return service.throttle(func, limit);
    }, [service]);

    const memoize = useCallback(<T extends (...args: any[]) => any>(func: T) => {
        return service.memoize(func);
    }, [service]);

    return {
        startMeasure,
        endMeasure,
        runAfterInteractions,
        debounce,
        throttle,
        memoize,
        setPerfMonitoring: service.setPerfMonitoring.bind(service),
    };
};

/**
 * Hook for optimized list rendering with virtualization
 */
export const useOptimizedList = <T>(
    data: T[],
    keyExtractor: (item: T, index: number) => string,
    batchSize: number = 20
) => {
    const [visibleCount, setVisibleCount] = useState(batchSize);

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + batchSize, data.length));
    }, [data.length, batchSize]);

    const reset = useCallback(() => {
        setVisibleCount(batchSize);
    }, [batchSize]);

    return {
        visibleData: data.slice(0, visibleCount),
        loadMore,
        reset,
        hasMore: visibleCount < data.length,
        totalCount: data.length,
        visibleCount,
    };
};

/**
 * Hook for preventing unnecessary re-renders
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: any[] = []
): T => {
    return useCallback(callback, deps);
};

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string) => {
    const renderCount = useRef(0);
    const startTime = useRef(performance.now());

    useEffect(() => {
        renderCount.current += 1;
        const renderTime = performance.now() - startTime.current;

        if (renderTime > 16.67 && __DEV__) {
            console.warn(`[RENDER] ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
        }

        startTime.current = performance.now();

        return () => {
            // Cleanup if needed
        };
    });
};