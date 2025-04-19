import { useCallback } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

/**
 * Hook for updating progress state consistently with real values
 */
export const useProgressUpdater = (
  setIsGenerating: (isGenerating: boolean) => void,
  setGenerationProgress: (progress: RecipeGenerationProgress) => void,
  simulateProgressAnimation: (total: number) => void,
  cleanupAnimation: () => void,
  progressAnimationRef: React.MutableRefObject<number | null>
) => {
  // Update progress consistently with animation
  const updateProgress = useCallback(
    (current: number, total: number, message?: string) => {
      // If current and total are 0, this is a reset call
      if (current === 0 && total === 0) {
        cleanupAnimation();
        setIsGenerating(false);

        // Reset the progress state
        setGenerationProgress({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
          statusMessage: '',
          stage: '',
        });

        return {
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
        };
      }

      // Calculate percentage (handle case when total is 0)
      const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

      const progressData: RecipeGenerationProgress = {
        isGenerating: true,
        current,
        total,
        percentage,
        statusMessage: message,
        stage: message,
      };

      console.log('Updating progress:', progressData);

      // Pass the RecipeGenerationProgress object directly
      setGenerationProgress(progressData);

      // Ensure isGenerating is set to true when we have progress
      if (current < total) {
        setIsGenerating(true);

        // If this is the start of generation (near 0%), setup smooth progress animation
        if (percentage < 5 && !progressAnimationRef.current) {
          simulateProgressAnimation(total);
        }
      } else if (current >= total) {
        // Clean up animation when complete
        cleanupAnimation();

        // Keep progress visible for a short time after completion
        setTimeout(() => {
          setIsGenerating(false);

          // Reset the progress state after showing completion
          setGenerationProgress({
            isGenerating: false,
            current: 0,
            total: 0,
            percentage: 0,
            statusMessage: '',
            stage: '',
          });
        }, 1500);
      }

      return progressData;
    },
    [
      setIsGenerating,
      setGenerationProgress,
      simulateProgressAnimation,
      cleanupAnimation,
      progressAnimationRef,
    ]
  );

  return { updateProgress };
};
