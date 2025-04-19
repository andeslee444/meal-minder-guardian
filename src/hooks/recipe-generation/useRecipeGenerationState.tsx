import { useState, useCallback } from 'react';
import { RecipeGenerationProgress, RecipeGenerationError } from '@/types/recipe';

export const useRecipeGenerationState = () => {
  // UI State
  const [showRecipeGenerator, setShowRecipeGenerator] = useState(false);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackgroundGeneration, setIsBackgroundGeneration] = useState(false);
  const [isSpoonacularLoading, setIsSpoonacularLoading] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Changed from string to RecipeGenerationError | null
  const [generationError, setGenerationError] = useState<RecipeGenerationError | null>(null);

  // Progress tracking
  const [generationProgress, setGenerationProgress] = useState<RecipeGenerationProgress>({
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
  });

  // Function to update generation progress
  const updateProgress = useCallback((progress: RecipeGenerationProgress) => {
    setGenerationProgress(progress);
  }, []);

  // Function to increment retry count
  const incrementRetryCount = useCallback((silent: boolean = false) => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Function to check if we should retry recipe generation
  const hasRetriesLeft = useCallback(() => {
    return retryCount < 2; // Allow up to 2 retries
  }, [retryCount]);

  return {
    // UI State
    showRecipeGenerator,
    setShowRecipeGenerator,

    // Generation State
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    isSpoonacularLoading,
    setIsSpoonacularLoading,
    generatingMultiple,
    setGeneratingMultiple,
    apiLimitReached,
    setApiLimitReached,
    retryCount,
    generationError,
    setGenerationError,

    // Progress
    generationProgress,
    updateProgress,

    // Helper functions
    incrementRetryCount,
    hasRetriesLeft,
  };
};
