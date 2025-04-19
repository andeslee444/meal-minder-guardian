import { useCallback, useRef } from 'react';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { v4 as uuidv4 } from 'uuid';

export const useOpenAICacheHandler = () => {
  // Use useRef to maintain cache between renders
  const recipeCache = useRef(new Map());
  const cacheTimestamps = useRef(new Map());

  // Generate a cache key based on recipe inputs
  const generateCacheKey = useCallback(
    (ingredients: any[], filterMode: string, numRecipes: number): string => {
      // For empty or less than 2 ingredients, don't cache
      if (!ingredients || ingredients.length < 2) {
        return '';
      }

      // Create a more efficient cache key by using ingredient IDs if available
      const sortedIngredients = [...ingredients]
        .map(item => item.id || item.name?.toLowerCase())
        .filter(Boolean)
        .sort()
        .join(',');

      return `${sortedIngredients}_${filterMode}_${numRecipes}`;
    },
    []
  );

  // Get cached response by key with timestamp check
  const getCachedResponse = useCallback((cacheKey: string): any | null => {
    if (!cacheKey) return null;

    const timestamp = cacheTimestamps.current.get(cacheKey);
    const now = Date.now();

    // Check if cache entry is expired (30 minutes)
    if (timestamp && now - timestamp > 30 * 60 * 1000) {
      recipeCache.current.delete(cacheKey);
      cacheTimestamps.current.delete(cacheKey);
      return null;
    }

    return recipeCache.current.get(cacheKey) || null;
  }, []);

  // Cache a response with a key
  const setCachedResponse = useCallback((cacheKey: string, data: any): void => {
    if (!cacheKey) return;

    // Store in cache with timestamp
    recipeCache.current.set(cacheKey, data);
    cacheTimestamps.current.set(cacheKey, Date.now());

    // Clean up old cache entries if cache size exceeds limit
    if (recipeCache.current.size > 100) {
      const oldestKey = Array.from(cacheTimestamps.current.entries()).sort(
        ([, a], [, b]) => a - b
      )[0]?.[0];
      if (oldestKey) {
        recipeCache.current.delete(oldestKey);
        cacheTimestamps.current.delete(oldestKey);
      }
    }
  }, []);

  // Process a cached response with progress updates
  const handleCachedResponse = useCallback(
    async (
      cachedResponse: any,
      shouldGenerateMultiple: boolean,
      numRecipes: number,
      addRecipe: (recipe: Recipe) => boolean,
      updateProgressFn: (current: number, total: number) => void
    ): Promise<Recipe | null> => {
      console.log('Using cached recipe data with simulated loading');

      // Simulate loading with progress updates for better UX
      updateProgressFn(0, numRecipes);

      // Add a small artificial delay to show progress
      const simulationDelay = shouldGenerateMultiple ? 1500 : 800;
      await new Promise(resolve => setTimeout(resolve, simulationDelay));

      // Update progress to completion
      updateProgressFn(numRecipes, numRecipes);

      // Process data
      let result: Recipe | null = null;

      if (shouldGenerateMultiple && Array.isArray(cachedResponse.recipes)) {
        let addedCount = 0;
        cachedResponse.recipes.forEach((recipe: Recipe) => {
          if (recipe && recipe.title) {
            const wasAdded = addRecipe(recipe);
            if (wasAdded) {
              addedCount++;
              if (!result) result = recipe;
            }
          }
        });

        console.log(`Added ${addedCount} cached recipes`);
      } else if (cachedResponse.recipe) {
        const wasAdded = addRecipe(cachedResponse.recipe);
        if (wasAdded) {
          result = cachedResponse.recipe;
        }
        console.log(`Added single cached recipe: ${result?.title}`);
      }

      return result;
    },
    []
  );

  return {
    generateCacheKey,
    getCachedResponse,
    setCachedResponse,
    handleCachedResponse,
  };
};
