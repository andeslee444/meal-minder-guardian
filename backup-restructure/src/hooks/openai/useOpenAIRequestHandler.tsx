import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { RecipeGenerationProgress } from '@/types/recipe';
import { useOpenAIRateLimit } from '@/hooks/useOpenAIRateLimit';
import { useOpenAIProgress } from './useOpenAIProgress';
import { logger } from '@/utils/logger';

interface OpenAIRequestProps {
  onProgressUpdate?: (progress: RecipeGenerationProgress) => void;
}

/**
 * Hook to handle recipe generation requests to OpenAI
 */
export const useOpenAIRecipeRequest = ({ onProgressUpdate }: OpenAIRequestProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const { createProgressUpdate, updateStage } = useOpenAIProgress();
  const [dailyRequestCount, setDailyRequestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 2000;
  const requestTimeout = 120000;
  const maxRetryDelay = 10000;

  // Ensure we have the rate limit hooks with proper defaults
  const { resetDailyCount, checkRateLimits, trackRequest } = useOpenAIRateLimit();

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

  // Reset state function
  const resetRequestState = useCallback(() => {
    setIsGenerating(false);
    setGeneratingMultiple(false);
    if (onProgressUpdate) {
      onProgressUpdate({
        isGenerating: false,
        current: 0,
        total: 0,
        percentage: 0,
        statusMessage: '',
        stage: '',
      });
    }
  }, [onProgressUpdate]);

  // Helper function to make a direct fetch request as a fallback
  const makeFallbackRequest = async (url: string, payload: any, headers: HeadersInit) => {
    try {
      console.log('[OpenAI Request] Attempting direct fetch fallback');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (fetchError) {
      console.error('[OpenAI Request] Direct fetch fallback failed:', fetchError);
      throw fetchError;
    }
  };

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
      processResponseCallback: (data: any) => any
    ) => {
      const startTime = performance.now();
      console.log(`[OpenAI Request] Starting request at ${new Date().toISOString()}`);

      try {
        setIsGenerating(true);
        setGeneratingMultiple(shouldGenerateMultiple);
        setIsLoading(true);
        setError(null);

        // Check daily reset & rate limits
        checkDailyReset();
        await checkRateLimits();

        // Update tracking for rate limiting
        trackRequest();

        console.log(`Making OpenAI API request for recipes with filter mode: ${filterMode}`);
        console.log('Ingredients list:', ingredientsToUse);

        // Prepare ingredient list for the prompt
        const ingredientList = ingredientsToUse.map(item => {
          return typeof item === 'string'
            ? item
            : `${item.name} (${item.quantity || '1'} ${item.unit || 'unit'})`;
        });

        // Update progress for start of generation
        const initialProgress = createProgressUpdate(0, 100, true);
        if (onProgressUpdate) onProgressUpdate(initialProgress);

        // Simulate thinking progress for a better user experience
        let currentProgress = 0;
        let progressInterval: NodeJS.Timeout | null = null;
        progressInterval = setInterval(() => {
          currentProgress += 5;
          if (currentProgress >= 95) {
            clearInterval(progressInterval!);
            currentProgress = 95;
          }

          if (onProgressUpdate) {
            const progressUpdate = createProgressUpdate(currentProgress, 100, true);
            onProgressUpdate(progressUpdate);
          }
        }, 500);

        // Set up the request
        const requestStartTime = performance.now();
        const payload = {
          ingredients: ingredientList,
          filterMode,
          existingRecipes: recipeTitlesToAvoid,
          generateMultiple: shouldGenerateMultiple,
          numberOfRecipes: numRecipes,
          partialRecipe,
          cacheKey,
        };

        console.log('Making OpenAI request with payload:', payload);

        // Set up timeout with exponential backoff retry
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

        let lastError: Error | null = null;
        let currentRetry = 0;

        while (currentRetry <= maxRetries) {
          try {
            // Make API call
            const apiStartTime = performance.now();

            // Try multiple approaches in sequence to handle CORS and other issues
            let data, error;

            try {
              // 1. Try using Supabase functions client first
              console.log(
                '[OpenAI Request] Attempting to call Edge Function using Supabase client'
              );
              const result = await supabase.functions.invoke('generate-recipe', {
                body: payload,
              });
              data = result.data;
              error = result.error;
            } catch (supabaseError) {
              console.warn('[OpenAI Request] Supabase functions client failed:', supabaseError);
              console.log('[OpenAI Request] Falling back to direct fetch...');

              try {
                // 2. Try direct fetch as first fallback
                const url = 'https://ingcacsuikgwvnqjwnpw.supabase.co/functions/v1/generate-recipe';
                const headers = {
                  Authorization: `Bearer ${await supabase.auth.getSession().then(result => result.data.session?.access_token || '')}`,
                  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                };

                const result = await makeFallbackRequest(url, payload, headers);
                data = result;
                error = null;
              } catch (fetchError) {
                console.warn('[OpenAI Request] Direct fetch failed:', fetchError);
                console.log('[OpenAI Request] Falling back to localhost proxy...');

                // 3. Try local proxy as final fallback
                try {
                  const localhostUrl = '/functions/v1/generate-recipe';
                  const proxyHeaders = {
                    Authorization: `Bearer ${await supabase.auth.getSession().then(result => result.data.session?.access_token || '')}`,
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                  };

                  const result = await makeFallbackRequest(localhostUrl, payload, proxyHeaders);
                  data = result;
                  error = null;
                } catch (proxyError) {
                  // All approaches failed, throw the original error
                  console.error('[OpenAI Request] All request approaches failed');
                  throw supabaseError;
                }
              }
            }

            console.log(`[OpenAI Request] API call took ${performance.now() - apiStartTime}ms`);
            clearTimeout(timeoutId);

            if (error) {
              throw new Error(error.message || 'Failed to generate recipes');
            }

            if (!data) {
              throw new Error('No data received from recipe generation');
            }

            console.log(`[OpenAI Request] Total request time: ${performance.now() - startTime}ms`);

            // Update progress to 100% on success
            if (onProgressUpdate) {
              onProgressUpdate(createProgressUpdate(100, 100, true));
            }

            // Increment the daily request count
            trackRequest();

            // Process and return the result immediately without artificial delay
            return processResponseCallback(data);
          } catch (error) {
            lastError = error as Error;
            currentRetry++;

            if (currentRetry <= maxRetries) {
              // Calculate exponential backoff delay with jitter
              const delay = Math.min(
                retryDelay * Math.pow(2, currentRetry - 1) + Math.random() * 1000,
                maxRetryDelay
              );

              console.log(`[OpenAI Request] Retry ${currentRetry}/${maxRetries} after ${delay}ms`);

              // Update progress to show retry
              if (onProgressUpdate) {
                const progress = createProgressUpdate(Math.min(95, currentProgress + 5), 100, true);
                onProgressUpdate({
                  ...progress,
                  stage: `Retrying... (${currentRetry}/${maxRetries})`,
                });
              }

              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        // If we get here, all retries failed
        throw lastError;
      } catch (error) {
        console.error(
          `[OpenAI Request] Error occurred after ${performance.now() - startTime}ms:`,
          error
        );

        // Reset state and show error
        resetRequestState();

        // Show error message
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            toast({
              title: 'Request Timeout',
              description:
                'The recipe generation request timed out. Please try again with fewer ingredients or a simpler request.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error Generating Recipe',
              description: error.message,
              variant: 'destructive',
            });
          }
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      createProgressUpdate,
      updateStage,
      onProgressUpdate,
      resetRequestState,
      toast,
      checkRateLimits,
      trackRequest,
      checkDailyReset,
    ]
  );

  // Request for full recipe details
  const makeFullRecipeDetailsRequest = useCallback(async (recipeId: string, cacheKey: string) => {
    try {
      // Set up the request
      const payload = {
        recipeId,
        cacheKey,
        action: 'generate-details',
      };

      // Make the request to the Supabase Edge Function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: payload,
      });

      clearTimeout(timeoutId);

      // Handle errors
      if (error) {
        console.error('Error from generate-recipe function:', error);
        throw new Error(error.message || 'Error generating recipe details');
      }

      if (!data || !data.recipe) {
        throw new Error('No data returned from recipe details generation');
      }

      return data.recipe;
    } catch (error) {
      console.error('Error in makeFullRecipeDetailsRequest:', error);
      throw error;
    }
  }, []);

  return {
    isGenerating,
    generatingMultiple,
    makeOpenAIRequest,
    makeFullRecipeDetailsRequest,
    dailyRequestCount,
    resetDailyCount,
    resetState: resetRequestState,
    isLoading,
    error,
    retryCount,
    maxRetries,
    retryDelay,
  };
};
