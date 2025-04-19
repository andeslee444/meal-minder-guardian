import { useState, useCallback } from 'react';
import { RecipeGenerationError, RecipeGenerationProgress } from '@/types/recipe';

/**
 * Hook for managing generation errors
 */
export const useErrorHandler = (
  setIsGenerating: (isGenerating: boolean) => void,
  cleanupAnimation: () => void,
  setGenerationProgress: (progress: RecipeGenerationProgress) => void
) => {
  const [generationError, setGenerationError] = useState<RecipeGenerationError | null>(null);

  // Handle error consistently
  const handleError = useCallback(
    (error: Error | RecipeGenerationError | string) => {
      // Clean up any running animation
      cleanupAnimation();

      let errorObj: RecipeGenerationError;

      if (typeof error === 'string') {
        errorObj = { message: error, recoverable: false };
      } else if (error instanceof Error) {
        errorObj = {
          message: error.message,
          recoverable: false,
          error,
        };
      } else {
        errorObj = error as RecipeGenerationError;
      }

      console.log('Handling error:', errorObj);
      setGenerationError(errorObj);

      // Reset progress state immediately
      setGenerationProgress({
        isGenerating: false,
        current: 0,
        total: 0,
        percentage: 0,
        statusMessage: '',
        stage: '',
      });

      // Automatically clear generation state after a brief delay
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);

      return errorObj;
    },
    [cleanupAnimation, setIsGenerating, setGenerationProgress]
  );

  // Clear the error state
  const clearError = useCallback(() => {
    setGenerationError(null);
  }, []);

  return {
    generationError,
    setGenerationError,
    handleError,
    clearError,
  };
};
