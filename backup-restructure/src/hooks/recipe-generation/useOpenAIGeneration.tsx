import { useCallback } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';

/**
 * Hook for handling OpenAI recipe generation
 */
export const useOpenAIGeneration = (
  addRecipe: (recipe: Recipe) => boolean,
  existingRecipeTitles: string[],
  updateProgress: (current: number, total: number, message?: string) => void,
  setIsGenerating: (isGenerating: boolean) => void
) => {
  /**
   * Generate a recipe using OpenAI
   */
  const generateWithOpenAI = useCallback(
    async (
      filterMode: RecipeFilterMode,
      inventory: any[] = [],
      recipeTitlesToAvoid: string[] = []
    ): Promise<Recipe | null> => {
      try {
        updateProgress(0, 100, 'Starting AI recipe generation...');
        console.log('Starting OpenAI recipe generation with mode:', filterMode);

        // Simulate OpenAI generation (this would be replaced with actual OpenAI API call)
        // In a real implementation, this would call the OpenAI API to generate recipe data
        await new Promise(resolve => setTimeout(resolve, 2000));

        updateProgress(50, 100, 'Processing AI generated recipe...');

        // Sample recipe data (would come from OpenAI in real implementation)
        const recipe: Recipe = {
          id: `ai-${Date.now()}`,
          title: `AI Generated ${filterMode} Recipe`,
          ingredients: [
            { name: 'Ingredient 1', quantity: '1', unit: 'cup' },
            { name: 'Ingredient 2', quantity: '2', unit: 'tbsp' },
          ],
          instructions: ['Step 1: Combine ingredients', 'Step 2: Cook until done'],
          prepTime: 10,
          cookTime: 20,
          servings: 4,
          tags: [filterMode],
          image: undefined,
          isFavorite: false,
        };

        updateProgress(75, 100, 'Adding recipe to collection...');

        // Add to collection if not already exists
        const wasAdded = addRecipe(recipe);

        updateProgress(100, 100, 'Recipe generation complete!');

        if (wasAdded) {
          addStatusMessage(
            'success',
            `Generated recipe "${recipe.title}" and added to your collection!`,
            'OpenAI Generator'
          );
          return recipe;
        } else {
          addStatusMessage(
            'info',
            'Generated recipe already exists in your collection. Try again for something new.',
            'OpenAI Generator'
          );
          return null;
        }
      } catch (error) {
        console.error('Error generating recipe with OpenAI:', error);

        addStatusMessage(
          'error',
          error instanceof Error ? error.message : 'An unknown error occurred',
          'OpenAI Generator'
        );

        throw error;
      }
    },
    [addRecipe, updateProgress]
  );

  return {
    generateWithOpenAI,
  };
};
