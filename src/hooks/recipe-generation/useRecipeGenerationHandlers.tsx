import { useCallback } from 'react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useRecipeGenerator } from './useRecipeGenerator';

export const useRecipeGenerationHandlers = (
  apiLimitReached: boolean | undefined,
  filterMode: RecipeFilterMode
) => {
  const {
    isGenerating,
    isBackgroundGeneration,
    isSpoonacularLoading,
    generateRecipe,
    generatingMultiple,
    generationProgress,
    generateBackgroundRecipes,
    handleError,
  } = useRecipeGenerator();

  // Handle first-time recipe generation
  const handleGenerateRecipe = useCallback(async () => {
    if (isGenerating || apiLimitReached) return Promise.resolve(null);

    try {
      console.log('handleGenerateRecipe: Starting recipe generation');
      const result = await generateRecipe(filterMode);
      console.log('handleGenerateRecipe: Recipe generation completed', result);
      return result;
    } catch (error) {
      console.error('handleGenerateRecipe: Error during recipe generation:', error);
      handleError(error as Error);
      return Promise.resolve(null);
    }
  }, [generateRecipe, isGenerating, apiLimitReached, filterMode, handleError]);

  // Handle generating more recipes after some already exist
  const handleGenerateMoreRecipes = useCallback(async () => {
    if (isGenerating || apiLimitReached) return Promise.resolve(null);

    try {
      console.log('handleGenerateMoreRecipes: Starting background recipe generation');
      const result = await generateBackgroundRecipes(6, filterMode);
      console.log('handleGenerateMoreRecipes: Background recipe generation completed', result);
      return result;
    } catch (error) {
      console.error('handleGenerateMoreRecipes: Error during background recipe generation:', error);
      handleError(error as Error);
      return Promise.resolve(null);
    }
  }, [generateBackgroundRecipes, isGenerating, apiLimitReached, filterMode, handleError]);

  return {
    isGenerating,
    isBackgroundGeneration,
    isSpoonacularLoading,
    generatingMultiple,
    generationProgress,
    handleGenerateRecipe,
    handleGenerateMoreRecipes,
  };
};
