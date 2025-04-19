import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useOpenAIRateLimit } from '@/hooks/useOpenAIRateLimit';

/**
 * Hook to handle recipe generation requests to OpenAI
 */
export const useOpenAIRecipeRequest = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);

  const { dailyRequestCount, resetDailyCount, checkRateLimits, trackRequest } =
    useOpenAIRateLimit();

  // Make a request to OpenAI for recipe generation
  const makeOpenAIRequest = useCallback(
    async (
      ingredients: any[],
      filterMode: RecipeFilterMode,
      partialRecipe: boolean,
      shouldGenerateMultiple: boolean,
      numRecipes: number,
      cacheKey: string,
      existingRecipes: string[] = [],
      processResponseCallback: (data: any) => Recipe | null,
      progressCallback?: (progress: {
        isGenerating: boolean;
        current: number;
        total: number;
        percentage: number;
        stage: string;
      }) => void
    ): Promise<Recipe | null> => {
      setIsGenerating(true);
      if (shouldGenerateMultiple) {
        setGeneratingMultiple(true);
      }

      try {
        // Check rate limits before proceeding
        await checkRateLimits();

        // Update tracking for rate limiting
        trackRequest();

        console.log(`Making OpenAI API request for recipes with filter mode: ${filterMode}`);

        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            ingredients,
            dietary: [],
            mealType: 'any',
            numRecipes,
            partialRecipes: partialRecipe,
            cacheKey,
            existingRecipes,
            filterMode,
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

        // Update progress if available
        if (data.progress) {
          const { current, total, percentage, stage } = data.progress;
          if (progressCallback) {
            progressCallback({
              isGenerating: true,
              current,
              total,
              percentage,
              stage,
            });
          }
        }

        return processResponseCallback(data);
      } catch (error) {
        console.error('Error generating recipe with OpenAI:', error);
        throw error;
      } finally {
        setIsGenerating(false);
        setGeneratingMultiple(false);
      }
    },
    [checkRateLimits, trackRequest]
  );

  // Request full recipe details for a partial recipe
  const makeFullRecipeDetailsRequest = useCallback(
    async (
      recipeId: string,
      cacheKey: string,
      filterMode: RecipeFilterMode = 'hybrid'
    ): Promise<Recipe | null> => {
      setIsGenerating(true);

      try {
        // Check rate limits before proceeding
        await checkRateLimits();

        // Update tracking for rate limiting
        trackRequest();

        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            recipeId,
            cacheKey,
            filterMode, // Add filter mode to the request
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

        return data.recipe;
      } catch (error) {
        console.error('Error generating full recipe details:', error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [checkRateLimits, trackRequest]
  );

  return {
    isGenerating,
    generatingMultiple,
    makeOpenAIRequest,
    makeFullRecipeDetailsRequest,
    dailyRequestCount,
    resetDailyCount,
  };
};
