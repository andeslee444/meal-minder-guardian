import { useState, useCallback } from 'react';

export const useRecipeGenerationRetry = (maxRetries: number = 2) => {
  const [retryCount, setRetryCount] = useState(0);
  const [retryExhausted, setRetryExhausted] = useState(false);

  // Increment retry count and check if we've exhausted retries
  const incrementRetryCount = useCallback(
    (silent: boolean = false) => {
      setRetryCount(prevCount => {
        const newCount = prevCount + 1;
        const exhausted = newCount >= maxRetries;

        // Update exhaust state
        setRetryExhausted(exhausted);

        if (!silent && exhausted) {
          console.warn(`Recipe generation retry limit (${maxRetries}) reached`);
        }

        return newCount;
      });
    },
    [maxRetries]
  );

  // Reset retry count
  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setRetryExhausted(false);
  }, []);

  // Check if we have retries left
  const hasRetriesLeft = useCallback(() => {
    return retryCount < maxRetries;
  }, [retryCount, maxRetries]);

  return {
    retryCount,
    retryExhausted,
    incrementRetryCount,
    resetRetryCount,
    hasRetriesLeft,
  };
};
