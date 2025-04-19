import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { handleRecipeAPIError } from '@/utils/errorHandling';

export const useRecipeGenerationExecutor = (
  generateWithOpenAI: (
    addUniqueRecipe: (recipe: Recipe) => boolean,
    existingRecipes: string[]
  ) => Promise<Recipe | null>,
  generateWithSpoonacularOrFallback: (
    inventory: any[],
    addUniqueRecipe: (recipe: Recipe) => boolean,
    cacheMultipleRecipes: (recipes: Recipe[]) => number,
    filterMode: RecipeFilterMode,
    silent: boolean,
    existingRecipes: string[]
  ) => Promise<Recipe | null>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  // Helper to determine if error is retryable
  const shouldRetry = useCallback((error: any): boolean => {
    if (!error) return false;
    return (
      error.retryable === true ||
      (error.message &&
        (error.message.includes('timeout') ||
          error.message.includes('network') ||
          error.message.includes('connection')))
    );
  }, []);

  // Execute recipe generation with proper error handling
  const executeRecipeGeneration = useCallback(
    async (
      filterMode: RecipeFilterMode,
      inventory: any[],
      addUniqueRecipe: (recipe: Recipe) => boolean,
      cacheMultipleRecipes: (recipes: Recipe[]) => number,
      silent: boolean,
      existingRecipes: string[],
      hasRetriesLeft: () => boolean,
      incrementRetryCount: (silent: boolean) => void
    ): Promise<Recipe | null> => {
      try {
        // For preference-based mode, we'll use OpenAI directly
        if (filterMode === 'preference') {
          return await generateWithOpenAI(addUniqueRecipe, existingRecipes);
        }

        // For other modes (strict, hybrid), try Spoonacular first, then fall back to OpenAI
        try {
          return await generateWithSpoonacularOrFallback(
            inventory,
            addUniqueRecipe,
            cacheMultipleRecipes,
            filterMode,
            silent,
            existingRecipes
          );
        } catch (error) {
          // Process error to convert to standard format
          const apiError = handleRecipeAPIError(error, silent);
          console.error('Error generating recipe:', apiError);

          // If we have retries left and this error is retryable, retry after a delay
          if (hasRetriesLeft() && shouldRetry(apiError)) {
            incrementRetryCount(silent);

            // Set user-friendly error message if not silent
            if (!silent) {
              toast({
                title: 'Recipe Generation Issue',
                description: 'We encountered a problem. Retrying...',
                variant: 'default', // Using default to be less alarming for retries
              });
            }

            // Wait for 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Make recursive call to retry
            return executeRecipeGeneration(
              filterMode,
              inventory,
              addUniqueRecipe,
              cacheMultipleRecipes,
              silent,
              existingRecipes,
              hasRetriesLeft,
              incrementRetryCount
            );
          }

          throw apiError;
        }
      } catch (error) {
        console.error('Final error in recipe generation:', error);

        if (!silent) {
          toast({
            title: 'Recipe Generation Failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred',
            variant: 'destructive',
          });
        }

        return null;
      }
    },
    [generateWithOpenAI, generateWithSpoonacularOrFallback, shouldRetry, toast]
  );

  return {
    executeRecipeGeneration,
    shouldRetry,
  };
};
