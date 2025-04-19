import { useState, useCallback } from 'react';
import dalleService from '@/services/dalleService';
import { Recipe } from '@/types/recipe';

/**
 * Hook for generating images using DALL-E
 */
export function useDalleImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate an image using DALL-E with a custom prompt
   */
  const generateImage = useCallback(async (prompt: string): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`[DalleHook] Generating image with prompt: ${prompt}`);
      const url = await dalleService.generateImage(prompt);
      setGeneratedUrl(url);
      return url;
    } catch (err) {
      console.error('[DalleHook] Error generating image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Generate an image for a specific recipe
   */
  const generateForRecipe = useCallback(async (recipe: Recipe): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`[DalleHook] Generating image for recipe: ${recipe.title}`);
      const url = await dalleService.generateRecipeImage(recipe);
      setGeneratedUrl(url);
      return url;
    } catch (err) {
      console.error('[DalleHook] Error generating recipe image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Test the DALL-E service with a debug request
   */
  const testService = useCallback(async (): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('[DalleHook] Testing DALL-E service');
      const url = await dalleService.testDalleService();
      setGeneratedUrl(url);
      return url;
    } catch (err) {
      console.error('[DalleHook] Error testing service:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generatedUrl,
    error,
    generateImage,
    generateForRecipe,
    testService,
  };
}

export default useDalleImageGeneration;
