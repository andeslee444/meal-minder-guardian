import { useState, useCallback, useEffect } from 'react';

// Default cooldown period (15 minutes = 900000ms)
const DEFAULT_GENERATION_COOLDOWN = 900000;

export const useRecipeGenerationTiming = (cooldownPeriod = DEFAULT_GENERATION_COOLDOWN) => {
  const [lastGenerationAttempt, setLastGenerationAttempt] = useState<number>(0);

  // On mount, load the last generation timestamp from localStorage
  useEffect(() => {
    const storedTimestamp = localStorage.getItem('lastRecipeGenerationTimestamp');
    if (storedTimestamp) {
      setLastGenerationAttempt(parseInt(storedTimestamp, 10));
    }
  }, []);

  // Save the timestamp whenever it changes
  useEffect(() => {
    if (lastGenerationAttempt > 0) {
      localStorage.setItem('lastRecipeGenerationTimestamp', lastGenerationAttempt.toString());
    }
  }, [lastGenerationAttempt]);

  // Determine if we're in the cooldown period
  const inCooldownPeriod = useCallback(() => {
    const now = Date.now();
    return now - lastGenerationAttempt < cooldownPeriod;
  }, [lastGenerationAttempt, cooldownPeriod]);

  // Update the last generation attempt timestamp
  const updateGenerationTimestamp = useCallback(() => {
    setLastGenerationAttempt(Date.now());
  }, []);

  return {
    inCooldownPeriod,
    updateGenerationTimestamp,
    lastGenerationAttempt,
  };
};
