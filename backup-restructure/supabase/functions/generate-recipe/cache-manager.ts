/**
 * Module for managing recipe cache in the recipe generation API
 */

// Simple in-memory cache for partial recipes with 30-minute TTL
const partialRecipesCache = new Map();

/**
 * Gets a cached recipe result for a given key
 * @param cacheKey The cache key to look up
 * @returns The cached data or null if not found
 */
export function getCachedRecipe(cacheKey: string): any | null {
  if (!cacheKey) return null;

  if (partialRecipesCache.has(cacheKey)) {
    console.log('Using cached recipe result for key:', cacheKey);
    return partialRecipesCache.get(cacheKey);
  }

  return null;
}

/**
 * Adds a recipe result to the cache with a 30-minute TTL
 * @param cacheKey The cache key to store the data under
 * @param data The recipe data to cache
 */
export function cacheRecipeResult(cacheKey: string, data: any): void {
  if (!cacheKey) return;

  partialRecipesCache.set(cacheKey, data);

  // Automatically expire cache entries after 30 minutes
  setTimeout(
    () => {
      partialRecipesCache.delete(cacheKey);
    },
    30 * 60 * 1000
  );
}
