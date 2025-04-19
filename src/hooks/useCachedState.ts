import { useState, useEffect } from 'react';

/**
 * Custom hook that combines React state with localStorage caching
 * @param key The key to use for localStorage
 * @param initialValue The initial value to use if no cached value exists
 * @returns A stateful value and a function to update it
 */
export function useCachedState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get the initial value from localStorage or use the provided initialValue
  const getInitialValue = (): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [value, setValue] = useState<T>(getInitialValue);

  // Update localStorage when state changes
  useEffect(() => {
    try {
      // Only store the value if it's not null or undefined
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        // Remove the item if the value is null/undefined
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }, [value, key]);

  return [value, setValue];
}
