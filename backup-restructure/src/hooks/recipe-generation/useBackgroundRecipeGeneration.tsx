import { useState, useCallback } from 'react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';
import { Recipe, RecipeGenerationProgress, RecipeGenerationError } from '@/types/recipe';

/**
 * Hook for managing background recipe generation
 */
export const useBackgroundRecipeGeneration = (
  inventory: any[],
  generateRecipeWithOpenAI: (
    ingredients: any[],
    addRecipe: (recipe: Recipe) => boolean,
    filterMode: RecipeFilterMode,
    partialRecipe: boolean,
    existingRecipes: string[]
  ) => Promise<Recipe | null>,
  addRecipe: (recipe: Recipe) => void,
  updateProgress: (current: number, total: number, message?: string) => void,
  existingRecipeTitles: string[] = []
) => {
  const [isBackgroundGeneration, setIsBackgroundGeneration] = useState(false);

  /**
   * Generate multiple recipes in the background
   */
  const generateBackgroundRecipes = useCallback(
    async (count: number = 6, filterMode: RecipeFilterMode = 'hybrid'): Promise<Recipe | null> => {
      if (inventory.length === 0 && filterMode !== 'preference') {
        addStatusMessage(
          'error',
          'No ingredients available. Please add some ingredients to your inventory first.',
          'Recipe Generator'
        );
        return null;
      }

      setIsBackgroundGeneration(true);

      try {
        updateProgress(0, count, 'Starting background recipe generation...');

        // Check if generateRecipeWithOpenAI is available
        if (!generateRecipeWithOpenAI) {
          throw new Error('OpenAI recipe generation function is not available');
        }

        // Always use OpenAI for background generation (more control)
        const result = await generateRecipeWithOpenAI(
          inventory,
          (recipe: Recipe) => {
            addRecipe(recipe);
            return true; // Return boolean to match expected type
          },
          filterMode,
          true, // Partial recipe mode
          existingRecipeTitles
        );

        addStatusMessage(
          'success',
          'New recipes have been generated and added to your collection!',
          'Recipe Generator'
        );

        return result;
      } catch (error) {
        console.error('Error generating background recipes:', error);

        addStatusMessage(
          'error',
          error instanceof Error ? error.message : 'An unknown error occurred',
          'Recipe Generator'
        );

        throw error;
      } finally {
        // Small delay before removing background indicator
        setTimeout(() => {
          setIsBackgroundGeneration(false);
        }, 2000);
      }
    },
    [inventory, generateRecipeWithOpenAI, addRecipe, existingRecipeTitles, updateProgress]
  );

  return {
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generateBackgroundRecipes,
  };
};
