import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/types/recipe';
import { addStatusMessage } from '@/components/ui/status-indicator';

export const useOpenAIRecipeProcessor = () => {
  const { toast } = useToast();

  // Validate that recipe data is in the expected format
  const validateRecipeData = useCallback((data: any): boolean => {
    if (!data) return false;

    if (Array.isArray(data.recipes)) {
      return data.recipes.length > 0 && data.recipes.every((r: any) => r && r.title);
    } else if (data.recipe) {
      return !!data.recipe.title;
    }

    return false;
  }, []);

  // Process recipe results (either single or multiple recipes)
  const processRecipeResults = useCallback(
    (
      data: any,
      shouldGenerateMultiple: boolean,
      addRecipe: (recipe: Recipe) => boolean
    ): Recipe | null => {
      if (!validateRecipeData(data)) {
        console.error('Invalid recipe data:', data);
        toast({
          title: 'Recipe Generation Failed',
          description: 'The AI model returned an invalid recipe format. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      if (shouldGenerateMultiple && Array.isArray(data.recipes)) {
        // Process multiple recipes
        let addedCount = 0;
        let firstRecipe: Recipe | null = null;

        data.recipes.forEach((recipe: Recipe) => {
          if (recipe && recipe.title) {
            const wasAdded = addRecipe(recipe);
            if (wasAdded) {
              addedCount++;
              if (!firstRecipe) firstRecipe = recipe;
            }
          }
        });

        if (addedCount > 0) {
          addStatusMessage(
            'success',
            `${addedCount} new recipes have been created and saved!`,
            'AI Generator'
          );
        } else {
          addStatusMessage(
            'info',
            'No new recipes were added. Try again with different ingredients.',
            'AI Generator'
          );
        }

        return firstRecipe;
      } else if (data.recipe) {
        // Process a single recipe
        const wasAdded = addRecipe(data.recipe);

        if (wasAdded) {
          addStatusMessage(
            'success',
            `"${data.recipe.title}" has been created and saved to your recipes!`,
            'AI Generator'
          );
        } else {
          addStatusMessage(
            'info',
            `"${data.recipe.title}" is already in your recipes. Try again for a different recipe.`,
            'AI Generator'
          );
        }

        return data.recipe;
      }

      return null;
    },
    [validateRecipeData, toast]
  );

  // Process a cached response with simulated loading for a better UX
  const processCachedResponse = useCallback(
    async (
      cachedResponse: any,
      shouldGenerateMultiple: boolean,
      numRecipes: number,
      addRecipe: (recipe: Recipe) => boolean,
      updateProgress: (current: number, total: number) => void
    ): Promise<Recipe | null> => {
      console.log('Using cached recipe data with simulated loading');

      if (!validateRecipeData(cachedResponse)) {
        console.error('Invalid cached recipe data', cachedResponse);
        return null;
      }

      // Simulate loading with progress updates for better UX
      updateProgress(0, numRecipes);

      // Add a small artificial delay to show progress for cached responses
      const simulationDelay = shouldGenerateMultiple ? 1500 : 800;
      await new Promise(resolve => setTimeout(resolve, simulationDelay));

      // Update progress to completion
      updateProgress(numRecipes, numRecipes);

      // Process recipe data from cache
      if (shouldGenerateMultiple && Array.isArray(cachedResponse.recipes)) {
        let addedCount = 0;
        let firstRecipe: Recipe | null = null;

        cachedResponse.recipes.forEach((recipe: Recipe) => {
          if (recipe && recipe.title) {
            const wasAdded = addRecipe(recipe);
            if (wasAdded) {
              addedCount++;
              if (!firstRecipe) firstRecipe = recipe;
            }
          }
        });

        if (addedCount > 0) {
          addStatusMessage(
            'success',
            `${addedCount} new recipes have been created and saved! (from cache)`,
            'AI Generator'
          );
        }

        return firstRecipe;
      } else if (cachedResponse.recipe) {
        const wasAdded = addRecipe(cachedResponse.recipe);

        if (wasAdded) {
          addStatusMessage(
            'success',
            `"${cachedResponse.recipe.title}" has been created and saved to your recipes! (from cache)`,
            'AI Generator'
          );
        }

        return cachedResponse.recipe;
      }

      return null;
    },
    [validateRecipeData]
  );

  return {
    validateRecipeData,
    processRecipeResults,
    processCachedResponse,
  };
};
