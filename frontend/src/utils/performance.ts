export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): ((...args: Parameters<T>) => void) => {
  const { leading = false, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (!lastCallTime && leading) {
      lastCallTime = now;
      fn(...args);
      return;
    }

    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
      lastCallTime = 0;
    }, delay);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = false } = options;
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastCallTime;

    if (elapsed >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = leading ? now : 0;
      fn(...args);
    } else if (trailing && !timeoutId) {
      lastArgs = args;
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit - elapsed);
    }
  };
};

export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: { maxSize?: number; ttl?: number } = {},
): T => {
  const { maxSize = 100, ttl = 0 } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  const cleanCache = () => {
    if (ttl > 0) {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > ttl) {
          cache.delete(key);
        }
      }
    }
  };

  return ((...args: Parameters<T>): ReturnType<T> => {
    cleanCache();

    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      return cached.value;
    }

    const result = fn(...args) as ReturnType<T>;

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
};

export const measurePerformance = (label: string): (() => void) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;

    return () => {
      const end = performance.now();
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
      const duration = (end - start).toFixed(2);
      const memoryDiff = memoryAfter - memoryBefore;

      let style = "color: #009A44";
      if (Number(duration) > 100) style = "color: #FEDD00";
      if (Number(duration) > 500) style = "color: #EF3340";

      console.log(
        `%c[Perf] ${label}: ${duration}ms` +
          (memoryDiff
            ? ` | Memory: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
            : ""),
        style,
      );
    };
  }
  return () => {};
};

export const measureAsyncPerformance = async <T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const stop = measurePerformance(label);
  try {
    const result = await fn();
    stop();
    return result;
  } catch (error) {
    stop();
    throw error;
  }
};

export const lazyLoad = <T>(
  importFn: () => Promise<T>,
  options: { fallback?: T; retries?: number } = {},
): Promise<T> => {
  const { retries = 2 } = options;

  const attemptLoad = (attemptsLeft: number): Promise<T> => {
    return importFn().catch((error) => {
      if (attemptsLeft > 0) {
        console.warn(
          `Lazy load failed, retrying... (${attemptsLeft} attempts left)`,
        );
        return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          attemptLoad(attemptsLeft - 1),
        );
      }
      throw error;
    });
  };

  return attemptLoad(retries);
};

export const idleCallback = (
  callback: () => void,
  timeout: number = 2000,
): void => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
};

export const scheduleAnimationFrame = (callback: () => void): number => {
  return requestAnimationFrame(callback);
};

export const cancelAnimationFrameSafe = (id: number): void => {
  cancelAnimationFrame(id);
};

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Array<{
    name: string;
    duration: number;
    timestamp: number;
  }> = [];
  private enabled: boolean;

  constructor(enabled: boolean = import.meta.env.DEV) {
    this.enabled = enabled;
  }

  start(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    if (!this.enabled) return 0;
    const start = this.marks.get(name);
    if (!start) return 0;
    const duration = performance.now() - start;
    this.marks.delete(name);
    this.measures.push({ name, duration, timestamp: Date.now() });

    if (this.measures.length > 100) {
      this.measures.shift();
    }

    return duration;
  }

  getStats(): {
    avg: number;
    min: number;
    max: number;
    count: number;
    recent: Array<{ name: string; duration: number }>;
  } {
    if (this.measures.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, recent: [] };
    }

    const durations = this.measures.map((m) => m.duration);
    return {
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: this.measures.length,
      recent: this.measures
        .slice(-10)
        .map((m) => ({ name: m.name, duration: m.duration })),
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

export const perfMonitor = new PerformanceMonitor();
