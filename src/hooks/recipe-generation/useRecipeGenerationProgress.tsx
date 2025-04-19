/**
 * This hook is deprecated. Use useRecipeGenerationStatus instead.
 * @deprecated
 */
import { useState, useCallback } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

export const useRecipeGenerationProgress = () => {
  const [progressCallback, setProgressCallback] = useState<
    ((progress: RecipeGenerationProgress) => void) | null
  >(null);

  // Create a progress update object
  const createProgressUpdate = useCallback(
    (current: number, total: number, isGenerating: boolean = true): RecipeGenerationProgress => {
      return {
        isGenerating,
        current,
        total,
        percentage: total > 0 ? (current / total) * 100 : 0,
      };
    },
    []
  );

  // Update progress with a callback
  const updateProgress = useCallback(
    (progress: RecipeGenerationProgress) => {
      if (progressCallback) {
        progressCallback(progress);
      }
    },
    [progressCallback]
  );

  return {
    setProgressCallback,
    createProgressUpdate,
    updateProgress,
  };
};
