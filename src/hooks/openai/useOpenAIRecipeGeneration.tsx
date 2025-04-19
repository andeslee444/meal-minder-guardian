import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useOpenAIRecipeRequest } from '@/hooks/openai/useOpenAIRequestHandler';
import { useOpenAICacheHandler } from '@/hooks/recipe-generation/useOpenAICacheHandler';
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

  // Create a dummy callback function to avoid null issues
  const safeProgressCallback = (progress: RecipeGenerationProgress) => {
    if (progressCallback) {
      progressCallback(progress);
    }
  };

  // Initialize with an object that has default values for the properties we use
  const {
    isGenerating,
    generatingMultiple,
    makeOpenAIRequest,
    makeFullRecipeDetailsRequest,
    dailyRequestCount,
    resetDailyCount,
  } = useOpenAIRecipeRequest({
    onProgressUpdate: safeProgressCallback,
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
    setCachedResponse(data.cacheKey, data);

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

  const generateRecipeWithOpenAI = async (
    ingredientsToUse: any[],
    addRecipe: (recipe: Recipe) => boolean,
    filterMode: RecipeFilterMode = 'hybrid',
    partialRecipe: boolean = false,
    existingRecipes: string[] = []
  ) => {
    try {
      console.log('Starting recipe generation with:', {
        ingredientsCount: ingredientsToUse.length,
        filterMode,
        partialRecipe,
        existingRecipesCount: existingRecipes.length,
      });

      if (filterMode !== 'preference' && (!ingredientsToUse || ingredientsToUse.length === 0)) {
        addStatusMessage(
          'error',
          'Please add some ingredients to your inventory first.',
          'AI Generator'
        );
        return null;
      }

      const shouldGenerateMultiple = ingredientsToUse.length > 2;
      const numRecipes = shouldGenerateMultiple ? 6 : 1;

      const recipeTitlesToAvoid =
        existingRecipes.length > 0 ? existingRecipes : getExistingRecipeTitles();

      const cacheKey = generateCacheKey(ingredientsToUse, filterMode, numRecipes);
      const cachedResponse = getCachedResponse(cacheKey);

      if (cachedResponse) {
        console.log('Using cached recipe response:', cacheKey);
        const updateProgressFn = (current: number, total: number) => {
          if (progressCallback) {
            progressCallback({
              isGenerating: true,
              current,
              total,
              percentage: (current / total) * 100,
            });
          }
        };

        return await handleCachedResponse(
          cachedResponse,
          shouldGenerateMultiple,
          numRecipes,
          addRecipe,
          updateProgressFn
        );
      }

      console.log('No cache found, making new API request');
      return await makeOpenAIRequest(
        ingredientsToUse,
        filterMode,
        partialRecipe,
        shouldGenerateMultiple,
        numRecipes,
        cacheKey,
        recipeTitlesToAvoid,
        data => processAPIResponse(data, shouldGenerateMultiple, addRecipe)
      );
    } catch (error) {
      console.error('Error generating recipe with OpenAI:', error);

      addStatusMessage(
        'error',
        error instanceof Error ? error.message : 'An unknown error occurred',
        'AI Generator'
      );

      throw error;
    } finally {
      if (progressCallback) {
        progressCallback({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
        });
      }
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

      const recipe = await makeFullRecipeDetailsRequest(recipeId, cacheKey);

      if (recipe) {
        setCachedResponse(cacheKey, recipe);
      }

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
    generateRecipeWithOpenAI,
    generateFullRecipeDetails,
    setProgressCallback,
    isGenerating,
    generatingMultiple,
    dailyRequestCount,
    resetDailyCount,
  };
};
