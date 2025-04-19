import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/recipe';
import { useOpenAICacheManager } from '@/hooks/useOpenAICacheManager';
import { useOpenAIRateLimit } from '@/hooks/useOpenAIRateLimit';
import { handleRecipeAPIError } from '@/utils/errorHandling';

export const useOpenAIAPI = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Import the cache manager and rate limiter hooks
  const { generateCacheKey, getCachedResponse, setCachedResponse } = useOpenAICacheManager();
  const { checkRateLimits, trackRequest } = useOpenAIRateLimit();

  const fetchRecipesFromOpenAI = useCallback(
    async (
      ingredients: any[],
      dietaryRestrictions: string[] = [],
      mealType: string = 'any',
      numRecipes: number = 1,
      cacheKey: string,
      existingRecipes: string[] = [],
      partialRecipes: boolean = false
    ) => {
      setIsProcessing(true);

      try {
        // Check rate limits before proceeding
        await checkRateLimits();

        // Track the request for rate limiting
        trackRequest();

        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            ingredients,
            dietary: dietaryRestrictions,
            mealType,
            numRecipes,
            partialRecipes,
            cacheKey,
            existingRecipes,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (data.error) {
          console.error('Recipe generation error:', data.error);
          throw new Error(data.error);
        }

        // Store the result in the client-side cache
        setCachedResponse(cacheKey, data);

        return data;
      } catch (error) {
        // Use our new error handling utility
        const parsedError = handleRecipeAPIError(error, false, 'openai');

        // Rethrow to allow fallback mechanism to work
        throw parsedError;
      } finally {
        setIsProcessing(false);
      }
    },
    [checkRateLimits, setCachedResponse, trackRequest]
  );

  const fetchFullRecipeDetails = useCallback(
    async (recipeId: string, cacheKey: string): Promise<Recipe | null> => {
      setIsProcessing(true);

      try {
        // Check rate limits before proceeding
        await checkRateLimits();

        // Track the request for rate limiting
        trackRequest();

        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            recipeId,
            cacheKey,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (data.error) {
          console.error('Recipe details generation error:', data.error);
          throw new Error(data.error);
        }

        // Cache the response
        setCachedResponse(cacheKey, data);

        return data.recipe;
      } catch (error) {
        // Use our new error handling utility
        const parsedError = handleRecipeAPIError(error, false, 'openai');

        // For full recipe details we don't have a fallback, so just return null
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [checkRateLimits, setCachedResponse, trackRequest]
  );

  return {
    isProcessing,
    fetchRecipesFromOpenAI,
    fetchFullRecipeDetails,
    generateCacheKey,
    getCachedResponse,
  };
};
