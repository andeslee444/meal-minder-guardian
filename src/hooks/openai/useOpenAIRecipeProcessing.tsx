import { useCallback } from 'react';
import { Recipe } from '@/types/recipe';
import { addStatusMessage } from '@/components/ui/status-indicator';

export const useOpenAIRecipeProcessing = () => {
  // Validate recipe data from API
  const validateRecipeData = useCallback((data: any): boolean => {
    if (!data) return false;

    if (Array.isArray(data.recipes)) {
      return data.recipes.length > 0 && data.recipes.every((r: any) => r && r.title);
    } else if (data.recipe) {
      return !!data.recipe.title;
    }

    return false;
  }, []);

  // Process multiple recipes from API response
  const processMultipleRecipes = useCallback(
    (data: any, addRecipe: (recipe: Recipe) => boolean) => {
      if (!validateRecipeData(data) || !Array.isArray(data.recipes)) {
        console.error('Invalid recipe data for multiple recipes:', data);
        return { addedCount: 0, firstRecipe: null };
      }

      let addedCount = 0;
      let firstRecipe: Recipe | null = null;

      console.log(`Processing ${data.recipes.length} recipes from OpenAI`);

      // Process each recipe individually
      data.recipes.forEach((recipe: Recipe, index: number) => {
        if (recipe && recipe.title) {
          console.log(`Adding recipe ${index + 1}/${data.recipes.length}: ${recipe.title}`);
          const wasAdded = addRecipe(recipe);
          if (wasAdded) {
            addedCount++;
            if (!firstRecipe) firstRecipe = recipe;
          }
        }
      });

      // Show status message
      if (addedCount > 0) {
        addStatusMessage(
          'success',
          `${addedCount} new recipes have been created and saved!`,
          'AI Generator'
        );
      } else {
        addStatusMessage(
          'info',
          'No new recipes were added. Try with different ingredients.',
          'AI Generator'
        );
      }

      return { addedCount, firstRecipe };
    },
    [validateRecipeData]
  );

  // Process a single recipe from API response
  const processSingleRecipe = useCallback(
    (data: any, addRecipe: (recipe: Recipe) => boolean): Recipe | null => {
      if (!validateRecipeData(data) || !data.recipe) {
        console.error('Invalid recipe data for single recipe:', data);
        return null;
      }

      const recipe = data.recipe;
      console.log('Processing single recipe:', recipe.title);
      const wasAdded = addRecipe(recipe);

      // Show status message
      if (wasAdded) {
        addStatusMessage(
          'success',
          `"${recipe.title}" has been created and saved to your recipes!`,
          'AI Generator'
        );
      } else {
        addStatusMessage(
          'info',
          `"${recipe.title}" is already in your recipes. Try again for a different recipe.`,
          'AI Generator'
        );
      }

      return recipe;
    },
    [validateRecipeData]
  );

  return {
    validateRecipeData,
    processMultipleRecipes,
    processSingleRecipe,
  };
};
