import { useCallback } from 'react';
import { useGenerationProgressState } from './useGenerationProgressState';
import { useProgressAnimation } from './useProgressAnimation';
import { useProgressUpdater } from './useProgressUpdater';
import { useErrorHandler } from './useErrorHandler';
import { clearStatusMessages } from '@/components/ui/status';

/**
 * Hook for managing recipe generation status, progress, and errors
 * This is now a composition of more focused hooks with improved status management
 */
export const useRecipeGenerationStatus = () => {
  // State management for progress
  const {
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generationProgress,
    setGenerationProgress,
  } = useGenerationProgressState();

  // Animation handling
  const { simulateProgressAnimation, cleanupAnimation, progressAnimationRef } =
    useProgressAnimation(isGenerating, setGenerationProgress);

  // Error handling
  const { generationError, setGenerationError, handleError, clearError } = useErrorHandler(
    setIsGenerating,
    cleanupAnimation
  );

  // Progress updating
  const { updateProgress } = useProgressUpdater(
    setIsGenerating,
    setGenerationProgress,
    simulateProgressAnimation,
    cleanupAnimation,
    progressAnimationRef
  );

  // Reset all state
  const resetState = useCallback(() => {
    cleanupAnimation();
    setIsGenerating(false);
    setIsBackgroundGeneration(false);
    setGenerationError(null);
    setGenerationProgress({
      isGenerating: false,
      current: 0,
      total: 0,
      percentage: 0,
    });

    // Also clear status messages when resetting generation state
    clearStatusMessages();
  }, [
    cleanupAnimation,
    setIsGenerating,
    setIsBackgroundGeneration,
    setGenerationError,
    setGenerationProgress,
  ]);

  return {
    // Progress state
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generationProgress,
    setGenerationProgress,

    // Error state
    generationError,
    setGenerationError,

    // Actions
    updateProgress,
    handleError,
    clearError,
    resetState,
  };
};
