import { useCallback } from 'react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

// TTL for cache entries in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const useOpenAICacheManager = () => {
  // Generate a consistent cache key for recipe generation requests
  const generateCacheKey = useCallback(
    (ingredients: any[], filterMode: RecipeFilterMode, numRecipes: number): string => {
      // Sort ingredients to ensure consistent keys regardless of order
      const sortedIngredients = ingredients
        .map(ing => (typeof ing === 'string' ? ing : ing.name || ing.id))
        .sort()
        .join(',');

      return `openai_recipe_${sortedIngredients}_${filterMode}_${numRecipes}`;
    },
    []
  );

  // Get a cached response if it exists and is still valid
  const getCachedResponse = useCallback((cacheKey: string): any => {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      // Check if cached data is still valid based on TTL
      if (now - timestamp < CACHE_TTL) {
        console.log('Using cached recipe data:', cacheKey);
        return data;
      } else {
        console.log('Cached data expired, removing:', cacheKey);
        localStorage.removeItem(cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving cached response:', error);
      return null;
    }
  }, []);

  // Store a response in cache with current timestamp
  const setCachedResponse = useCallback((cacheKey: string, data: any): void => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data,
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('Recipe data cached:', cacheKey);
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }, []);

  // Clear all cached recipes (useful for testing or when recipes change format)
  const clearCache = useCallback((): void => {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);

    // Filter for recipe cache keys
    const recipeKeys = keys.filter(
      key => key.startsWith('openai_recipe_') || key.startsWith('full_recipe_')
    );

    // Remove all recipe cache entries
    recipeKeys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${recipeKeys.length} recipe cache entries`);
  }, []);

  return {
    generateCacheKey,
    getCachedResponse,
    setCachedResponse,
    clearCache,
  };
};
