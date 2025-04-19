import { useCallback } from 'react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { Recipe, RecipeGenerationError } from '@/types/recipe';

/**
 * Hook for managing background recipe generation
 */
export const useRecipeBackgroundGeneration = (
  inventory: any[],
  openAIGenerateFunction: (
    filterMode: RecipeFilterMode,
    inventory: any[]
  ) => Promise<Recipe | null>,
  addRecipe: (recipe: Recipe) => boolean,
  updateProgress: (current: number, total: number, message?: string) => void,
  existingRecipeTitles: string[],
  setIsGenerating: (state: boolean) => void,
  setIsBackgroundGeneration: (state: boolean) => void,
  clearError: () => void,
  handleError: (error: Error) => void
) => {
  /**
   * Generate recipes in the background
   */
  const generateBackgroundRecipes = useCallback(
    async (count: number = 3, filterMode: RecipeFilterMode = 'hybrid'): Promise<Recipe | null> => {
      if (!inventory || inventory.length === 0) {
        return Promise.resolve(null);
      }

      try {
        setIsGenerating(true);
        setIsBackgroundGeneration(true);
        clearError();

        updateProgress(0, 100, 'Generating recipes in the background...');

        console.log('Starting background recipe generation for', count, 'recipes');

        // Generate recipes in sequence
        const recipe = await openAIGenerateFunction(filterMode, inventory);

        updateProgress(100, 100, 'Recipe generation completed!');

        return recipe;
      } catch (error) {
        console.error('Error in background recipe generation:', error);
        const recipeError: RecipeGenerationError = {
          message:
            error instanceof Error ? error.message : 'Unknown error during recipe generation',
          recoverable: true,
          source: 'background-generation',
        };

        handleError(error instanceof Error ? error : new Error(recipeError.message));
        return null;
      } finally {
        setIsGenerating(false);
        setIsBackgroundGeneration(false);
      }
    },
    [
      inventory,
      openAIGenerateFunction,
      addRecipe,
      updateProgress,
      existingRecipeTitles,
      setIsGenerating,
      setIsBackgroundGeneration,
      clearError,
      handleError,
    ]
  );

  return {
    generateBackgroundRecipes,
  };
};
