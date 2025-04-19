import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useOpenAIRecipeRequest } from '@/hooks/openai/useOpenAIRequestHandler';
import { useOpenAICacheHandler } from './useOpenAICacheHandler';
import { useOpenAIProgress } from '@/hooks/openai/useOpenAIProgress';
import { useOpenAIRecipeProcessing } from '@/hooks/openai/useOpenAIRecipeProcessing';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { addStatusMessage } from '@/components/ui/status-indicator';

export const useOpenAIRecipeGeneration = () => {
  const { toast } = useToast();
  const { recipes } = useRecipeContext();
  const [progressCallback, setProgressCallback] = useState<
    ((progress: RecipeGenerationProgress) => void) | null
  >(null);

  const { isGenerating, generatingMultiple, makeOpenAIRequest, dailyRequestCount } =
    useOpenAIRecipeRequest({
      onProgressUpdate: progress => progressCallback?.(progress),
    });

  const { generateCacheKey, getCachedResponse, setCachedResponse, handleCachedResponse } =
    useOpenAICacheHandler();

  const { validateRecipeData, processMultipleRecipes, processSingleRecipe } =
    useOpenAIRecipeProcessing();

  const { createProgressUpdate } = useOpenAIProgress();

  useEffect(() => {
    if (progressCallback) {
      progressCallback(createProgressUpdate(0, 0, false));
    }
  }, [progressCallback, createProgressUpdate]);

  const getExistingRecipeTitles = () => {
    return recipes.map(recipe => recipe.title);
  };

  const processAPIResponse = (
    data: any,
    shouldGenerateMultiple: boolean,
    addRecipe: (recipe: Recipe) => boolean
  ) => {
    console.log('Processing API response:', data);

    if (shouldGenerateMultiple && Array.isArray(data.recipes)) {
      console.log(`Processing ${data.recipes.length} recipes from API response`);
      const result = processMultipleRecipes(data, addRecipe);

      addStatusMessage(
        'success',
        `${result.addedCount} new recipes have been created and saved!`,
        'AI Generator'
      );

      return result.firstRecipe;
    } else if (data.recipe) {
      console.log('Processing single recipe from API response:', data.recipe.title);
      return processSingleRecipe(data, addRecipe);
    }

    console.warn('No valid recipes found in API response');
    return null;
  };

  const generateRecipe = async (
    ingredientsToUse: any[],
    addRecipe: (recipe: Recipe) => boolean,
    filterMode: RecipeFilterMode = 'hybrid',
    partialRecipe: boolean = false,
    existingRecipes: string[] = []
  ) => {
    try {
      // Early validation to avoid unnecessary processing
      if (filterMode !== 'preference' && (!ingredientsToUse || ingredientsToUse.length === 0)) {
        addStatusMessage(
          'error',
          'Please add some ingredients to your inventory first.',
          'AI Generator'
        );
        return null;
      }

      // Batch state updates
      const shouldGenerateMultiple = ingredientsToUse.length > 2;
      const numRecipes = shouldGenerateMultiple ? 6 : 1;

      // Get existing recipe titles only if needed
      const recipeTitlesToAvoid =
        existingRecipes.length > 0 ? existingRecipes : getExistingRecipeTitles();

      // Generate cache key and check cache
      const cacheKey = generateCacheKey(ingredientsToUse, filterMode, numRecipes);
      const cachedResponse = getCachedResponse(cacheKey);

      if (cachedResponse) {
        console.log('Using cached recipe response:', cacheKey);
        // Use a single progress update for cached responses
        if (progressCallback) {
          progressCallback({
            isGenerating: true,
            current: 1,
            total: 1,
            percentage: 100,
          });
        }

        return await handleCachedResponse(
          cachedResponse,
          shouldGenerateMultiple,
          numRecipes,
          addRecipe,
          (current: number, total: number) => {
            if (progressCallback) {
              progressCallback({
                isGenerating: true,
                current,
                total,
                percentage: (current / total) * 100,
              });
            }
          }
        );
      }

      console.log('No cache found, making new API request');

      // Make API request with progress updates
      const response = await makeOpenAIRequest(
        ingredientsToUse,
        filterMode,
        partialRecipe,
        shouldGenerateMultiple,
        numRecipes,
        cacheKey,
        recipeTitlesToAvoid,
        data => {
          if (progressCallback) {
            progressCallback({
              isGenerating: true,
              current: 1,
              total: 1,
              percentage: 100,
            });
          }
          return processAPIResponse(data, shouldGenerateMultiple, addRecipe);
        }
      );

      // Cache the response for future use
      if (response) {
        setCachedResponse(cacheKey, response);
      }

      return response;
    } catch (error) {
      console.error('Error in generateRecipe:', error);
      if (progressCallback) {
        progressCallback({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
        });
      }
      throw error;
    }
  };

  const generateFullRecipeDetails = async (recipeId: string): Promise<Recipe | null> => {
    try {
      const cacheKey = `full_recipe_${recipeId}`;
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('Using cached full recipe details');
        return cachedResponse;
      }

      const recipe = await makeOpenAIRequest(
        [],
        'hybrid',
        false,
        false,
        1,
        cacheKey,
        [],
        async data => {
          if (data.recipe) {
            setCachedResponse(cacheKey, data.recipe);
            return data.recipe;
          }
          return null;
        }
      );

      return recipe;
    } catch (error) {
      console.error('Error generating full recipe details:', error);
      toast({
        title: 'Error Loading Recipe Details',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    generateRecipe,
    isGenerating,
    generatingMultiple,
    dailyRequestCount,
    setProgressCallback,
    generateFullRecipeDetails,
  };
};
