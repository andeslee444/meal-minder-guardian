import { useState, useCallback } from 'react';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useOpenAIProgress } from './useOpenAIProgress';
import { useLocalStorage } from '../useLocalStorage';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface OpenAIRecipeRequestProps {
  onProgressUpdate?: (progress: RecipeGenerationProgress) => void;
}

export const useOpenAIRecipeRequest = ({ onProgressUpdate }: OpenAIRecipeRequestProps = {}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const { createProgressUpdate, updateStage } = useOpenAIProgress();
  const [dailyRequestCount, setDailyRequestCount] = useLocalStorage<number>(
    'openai_daily_requests',
    0
  );

  const resetDailyCount = useCallback(() => {
    setDailyRequestCount(0);
  }, [setDailyRequestCount]);

  // Check if we need to reset the daily counter (it's a new day)
  const checkDailyReset = useCallback(() => {
    const lastResetStr = localStorage.getItem('openai_last_reset');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!lastResetStr || parseInt(lastResetStr) < today) {
      localStorage.setItem('openai_last_reset', today.toString());
      resetDailyCount();
    }
  }, [resetDailyCount]);

  // Make a request to OpenAI for recipe generation
  const makeOpenAIRequest = useCallback(
    async (
      ingredientsToUse: any[],
      filterMode: RecipeFilterMode,
      partialRecipe: boolean,
      shouldGenerateMultiple: boolean,
      numRecipes: number,
      cacheKey: string,
      recipeTitlesToAvoid: string[],
      processResult: (data: any) => Recipe | null
    ) => {
      try {
        console.log('[Test] Starting OpenAI recipe generation request');
        console.log('[Test] Ingredients:', ingredientsToUse);
        console.log('[Test] Filter mode:', filterMode);
        console.log('[Test] Number of recipes:', numRecipes);

        checkDailyReset();

        if (dailyRequestCount >= 10) {
          throw new Error("You've reached the daily limit for AI recipe generation.");
        }

        // Update state
        setIsGenerating(true);
        setGeneratingMultiple(shouldGenerateMultiple);

        // Update progress for start of generation
        const initialProgress = createProgressUpdate(0, 100, true);
        if (onProgressUpdate) onProgressUpdate(initialProgress);

        // Simulate thinking progress for a better user experience
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 5;
          if (currentProgress >= 95) {
            clearInterval(progressInterval);
            currentProgress = 95;
          }

          if (onProgressUpdate) {
            const progressUpdate = createProgressUpdate(currentProgress, 100, true);
            onProgressUpdate(progressUpdate);
          }
        }, 500);

        // Prepare ingredient list for the prompt
        const ingredientList = ingredientsToUse
          .map(item => {
            return typeof item === 'string'
              ? item
              : `${item.name} (${item.quantity || '1'} ${item.unit || 'unit'})`;
          })
          .join(', ');

        // Set up the request
        const payload = {
          ingredients: ingredientList,
          filterMode,
          existingRecipes: recipeTitlesToAvoid,
          generateMultiple: shouldGenerateMultiple,
          numberOfRecipes: numRecipes,
          partialRecipe,
          cacheKey,
        };

        console.log('[Test] Making OpenAI request with payload:', payload);

        // Make the request to the Edge Function
        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: payload,
        });

        console.log('[Test] Received response from Edge Function:', { data, error });

        if (error) {
          console.error('[Test] Edge Function error:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (data.error) {
          console.error('[Test] Recipe generation error:', data.error);
          throw new Error(data.error);
        }

        // Process the response
        const result = processResult(data);

        if (!result) {
          throw new Error('Failed to process recipe response');
        }

        console.log('[Test] Successfully generated recipe:', result);

        // Clear progress interval and update final progress
        clearInterval(progressInterval);
        if (onProgressUpdate) {
          onProgressUpdate(createProgressUpdate(100, 100, false));
        }

        return result;
      } catch (error) {
        console.error('[Test] Error in recipe generation:', error);
        throw error;
      } finally {
        setIsGenerating(false);
        setGeneratingMultiple(false);
      }
    },
    [dailyRequestCount, onProgressUpdate]
  );

  // Request for full recipe details
  const makeFullRecipeDetailsRequest = useCallback(
    async (recipeId: string, cacheKey: string): Promise<Recipe | null> => {
      try {
        // Set up the request
        const payload = {
          recipeId,
          cacheKey,
          action: 'generate-details',
        };

        // Make the request to the Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: payload,
        });

        // Handle errors
        if (error) {
          console.error('Error from generate-recipe function:', error);
          throw new Error(error.message || 'Error generating recipe details');
        }

        if (!data || !data.recipe) {
          throw new Error('No data returned from recipe details generation');
        }

        return data.recipe as Recipe;
      } catch (error) {
        console.error('Error in makeFullRecipeDetailsRequest:', error);
        throw error;
      }
    },
    []
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
