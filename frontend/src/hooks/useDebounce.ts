import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay.
 * Returns the debounced value that updates only after the delay has passed without changes.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // If delay is 0 or negative, update immediately
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup the timeout if value or delay changes before it fires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
