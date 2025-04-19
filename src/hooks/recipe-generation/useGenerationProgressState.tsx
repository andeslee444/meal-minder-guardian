import { useState, useEffect } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

/**
 * Hook for managing recipe generation progress state
 */
export const useGenerationProgressState = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackgroundGeneration, setIsBackgroundGeneration] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<RecipeGenerationProgress>({
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
  });

  // Reset progress when generation stops
  useEffect(() => {
    if (!isGenerating && generationProgress.percentage > 0) {
      // Keep showing progress for a moment after completion
      const timer = setTimeout(() => {
        setGenerationProgress({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationProgress]);

  // For debugging purposes
  useEffect(() => {
    console.log('Generation progress state updated:', {
      isGenerating,
      isBackgroundGeneration,
      progress: generationProgress,
    });
  }, [isGenerating, isBackgroundGeneration, generationProgress]);

  return {
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generationProgress,
    setGenerationProgress,
  };
};
