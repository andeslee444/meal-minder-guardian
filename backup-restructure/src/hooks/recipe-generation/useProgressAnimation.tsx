import { useRef, useCallback, useEffect } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

/**
 * Hook for managing smooth progress animation during recipe generation
 */
export const useProgressAnimation = (
  isGenerating: boolean,
  setGenerationProgress: (progress: RecipeGenerationProgress) => void
) => {
  const progressAnimationRef = useRef<number | null>(null);

  // Cleanup function to cancel any running animation
  const cleanupAnimation = useCallback(() => {
    if (progressAnimationRef.current) {
      clearInterval(progressAnimationRef.current);
      progressAnimationRef.current = null;

      // Reset progress state when cleaning up
      setGenerationProgress({
        isGenerating: false,
        current: 0,
        total: 0,
        percentage: 0,
        statusMessage: '',
        stage: '',
      });
    }
  }, [setGenerationProgress]);

  // Create a smooth progress animation for better UX
  const simulateProgressAnimation = useCallback(
    (total: number) => {
      // First clean up any existing animation
      cleanupAnimation();

      let current = 0;
      const step = Math.max(1, Math.floor(total / 20)); // Ensure minimum step of 1

      // Set up interval to increment progress
      progressAnimationRef.current = window.setInterval(() => {
        current += step;

        // Create a new progress object with updated values
        const newProgress: RecipeGenerationProgress = {
          isGenerating: true,
          current: Math.min(current, total - 1), // Never reach 100% automatically
          total,
          percentage: Math.min((current / total) * 100, 95), // Cap at 95%
          statusMessage: 'Generating recipe...',
          stage: 'Generating recipe...',
        };

        // Pass the RecipeGenerationProgress object directly instead of a function
        setGenerationProgress(newProgress);

        // Stop at 95% - the actual completion will be triggered elsewhere
        if (current >= total * 0.95) {
          cleanupAnimation();
        }
      }, 500) as unknown as number;

      return progressAnimationRef.current;
    },
    [cleanupAnimation, setGenerationProgress]
  );

  // Clean up animation when component unmounts or isGenerating changes
  useEffect(() => {
    if (!isGenerating) {
      cleanupAnimation();
    }

    // Cleanup on unmount
    return () => {
      cleanupAnimation();
    };
  }, [isGenerating, cleanupAnimation]);

  return {
    simulateProgressAnimation,
    cleanupAnimation,
    progressAnimationRef,
  };
};
