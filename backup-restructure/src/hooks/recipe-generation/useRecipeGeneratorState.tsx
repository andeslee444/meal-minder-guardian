import { useState, useEffect } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';
import { useOpenAIRateLimit } from '@/hooks/useOpenAIRateLimit';

/**
 * Hook for managing recipe generator UI state
 */
export const useRecipeGeneratorState = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpoonacularLoading, setIsSpoonacularLoading] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const [showRecipeGenerator, setShowRecipeGenerator] = useState(false);
  const [apiLimitReached, setApiLimitReached] = useState(false);

  // Check API limits
  const { isApiLimitReached } = useOpenAIRateLimit();

  useEffect(() => {
    setApiLimitReached(isApiLimitReached());
  }, [isApiLimitReached]);

  return {
    isGenerating,
    setIsGenerating,
    isSpoonacularLoading,
    setIsSpoonacularLoading,
    generatingMultiple,
    setGeneratingMultiple,
    showRecipeGenerator,
    setShowRecipeGenerator,
    apiLimitReached,
    setApiLimitReached,
  };
};
