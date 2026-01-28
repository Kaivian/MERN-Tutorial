// src/hooks/generals/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * Custom hook to delay updating a value (debounce pattern)
 * @param value The value to be debounced
 * @param delay Delay time in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if the value changes (e.g. user keeps typing)
    // or when the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
