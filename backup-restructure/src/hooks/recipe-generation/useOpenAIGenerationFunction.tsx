import { useCallback } from 'react';
import { useOpenAIRecipeGeneration } from '@/hooks/openai/useOpenAIRecipeGeneration';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

/**
 * Hook to provide the OpenAI generation function
 * This properly follows React's rules of hooks
 */
export const useOpenAIGenerationFunction = () => {
  // Get the function from the hook directly (not in an effect)
  const { generateRecipeWithOpenAI } = useOpenAIRecipeGeneration();

  // Create a memoized wrapper function with the correct parameter order
  const generateFunction = useCallback(
    async (
      filterMode: RecipeFilterMode,
      ingredients: any[],
      existingRecipes: string[] = []
    ): Promise<Recipe | null> => {
      try {
        console.log('OpenAI generation function called with:', {
          ingredientsCount: ingredients.length,
          filterMode,
          existingRecipesCount: existingRecipes.length,
        });

        // Ensure we're passing params in the correct order for useOpenAIRecipeGeneration
        return await generateRecipeWithOpenAI(
          ingredients,
          (recipe: Recipe) => {
            // Return true to indicate successful addition
            // The actual adding happens in the parent component
            return true;
          },
          filterMode,
          false,
          existingRecipes
        );
      } catch (error) {
        console.error('Error in OpenAI generation function:', error);
        throw error;
      }
    },
    [generateRecipeWithOpenAI]
  );

  return generateFunction;
};
