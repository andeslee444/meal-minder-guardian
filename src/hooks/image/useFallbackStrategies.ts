import { useState, useEffect, useCallback, useRef } from 'react';
import { Recipe } from '@/types/recipe';
import dalleService from '@/services/dalleService';

// Cache to track recipes we've already requested images for
const imageRequestCache = new Set<string>();

// Cache for DALL-E failures to avoid retrying the same prompts
const dalleFailedCache = new Set<string>();

// Clear any existing caches for problematic recipes
const clearCacheForRecipe = (recipeTitle: string) => {
  // Force regeneration for specific problematic recipes
  if (
    recipeTitle.includes('Hearty Stew with Fresh Produce') ||
    recipeTitle.includes('stew') ||
    recipeTitle.includes('Stew')
  ) {
    console.log(`[Fallback] Clearing cache for problematic recipe: ${recipeTitle}`);

    // Remove from caches
    for (const cacheKey of imageRequestCache) {
      if (cacheKey.includes(recipeTitle)) {
        imageRequestCache.delete(cacheKey);
      }
    }

    for (const cacheKey of dalleFailedCache) {
      if (cacheKey.includes(recipeTitle)) {
        dalleFailedCache.delete(cacheKey);
      }
    }

    // Clear localStorage cache for this recipe
    try {
      const cacheKeys = Object.keys(localStorage);
      for (const key of cacheKeys) {
        if (key.includes('dalle-cache') && key.includes(recipeTitle)) {
          console.log(`[Fallback] Clearing localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('[Fallback] Error clearing localStorage:', e);
    }
  }
};

// For tracking requests in the current session
const currentSessionRequests = new Set<string>();

/**
 * Hook to manage fallback strategies when recipe images fail to load
 */
export function useFallbackStrategies(recipe: Recipe | null) {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track which strategies we've tried
  const strategiesTriedRef = useRef<string[]>([]);

  // Reset when recipe changes
  useEffect(() => {
    setFallbackUrl(null);
    setError(null);
    strategiesTriedRef.current = [];

    // Clear session cache when component remounts
    if (recipe?.id && !currentSessionRequests.has(recipe.id)) {
      currentSessionRequests.add(recipe.id);
    }

    // Clear cache for specific recipes
    if (recipe?.title) {
      clearCacheForRecipe(recipe.title);
    }

    // Check if we already have a stored DALL-E image in localStorage
    if (recipe) {
      const storedImageUrl = localStorage.getItem(
        `dalle-cache:recipe:${recipe.id || recipe.title}`
      );
      if (storedImageUrl) {
        console.log(`[Fallback] Found stored DALL-E image for ${recipe.title}`);
        setFallbackUrl(storedImageUrl);
        // Mark as already tried DALL-E
        if (!strategiesTriedRef.current.includes('dalle')) {
          strategiesTriedRef.current.push('dalle');
        }
      }
    }
  }, [recipe?.id, recipe?.title]);

  /**
   * Try the next fallback strategy when an image fails to load
   */
  const tryNextFallback = useCallback(async () => {
    if (!recipe) {
      console.log('[Fallback] No recipe provided');
      setFallbackUrl('https://picsum.photos/seed/fallback/800/600');
      return;
    }

    // Generate a cache key for this recipe
    const cacheKey = `${recipe.id}:${recipe.title}`;

    // If we've already tried all strategies, don't retry
    if (
      strategiesTriedRef.current.includes('dalle') &&
      strategiesTriedRef.current.includes('unsplash') &&
      strategiesTriedRef.current.includes('placeholder')
    ) {
      console.log(`[Fallback] All strategies exhausted for ${recipe.title}`);
      return;
    }

    // Start loading
    setIsLoadingFallback(true);
    setError(null);

    try {
      // For stew recipes, clear the failed cache to allow retrying
      if (recipe.title && (recipe.title.includes('stew') || recipe.title.includes('Stew'))) {
        console.log(`[Fallback] Forcing DALL-E generation for stew recipe: ${recipe.title}`);
        dalleFailedCache.delete(cacheKey);
        imageRequestCache.delete(`dalle:${cacheKey}`);
      }

      // Always try DALL-E first for the best quality images
      if (!strategiesTriedRef.current.includes('dalle')) {
        console.log(`[Fallback] Trying DALL-E for ${recipe.title}`);
        strategiesTriedRef.current.push('dalle');

        // Don't add to cache if it's a stew recipe - we want to retry these
        if (!(recipe.title && (recipe.title.includes('stew') || recipe.title.includes('Stew')))) {
          // Add to cache to prevent duplicate requests
          imageRequestCache.add(`dalle:${cacheKey}`);
        }

        try {
          // Create a specific and detailed prompt for better DALL-E results
          const titlePrompt = recipe.title || 'food dish';
          const ingredients = recipe.ingredients?.map(i => i.name).join(', ') || '';
          const ingredientsPrompt = ingredients ? ` with ${ingredients}` : '';

          console.log(`[Fallback] Generating DALL-E image for: ${titlePrompt}`);

          // Generate recipe image
          const dalleUrl = await dalleService.generateRecipeImage(recipe);

          if (dalleUrl) {
            console.log(`[Fallback] DALL-E image generated for ${recipe.title}`);
            setFallbackUrl(dalleUrl);
            // Also update the recipe in storage with the new image URL
            try {
              // This is optional and can be removed if causing issues
              const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
              const updatedRecipes = existingRecipes.map((r: any) => {
                if (r.id === recipe.id || r.title === recipe.title) {
                  return { ...r, image: dalleUrl };
                }
                return r;
              });
              localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
              console.log(`[Fallback] Updated recipe storage with DALL-E image`);
            } catch (storageErr) {
              console.error(`[Fallback] Storage update error:`, storageErr);
              // Non-critical error, continue
            }
            setIsLoadingFallback(false);
            return;
          } else {
            // Only mark as failed if it's not a stew recipe
            if (
              !(recipe.title && (recipe.title.includes('stew') || recipe.title.includes('Stew')))
            ) {
              // Mark this recipe as failed for DALL-E to avoid future retries
              dalleFailedCache.add(cacheKey);
            }
            console.log(`[Fallback] DALL-E failed for ${recipe.title}`);
          }
        } catch (err) {
          // Only mark as failed if it's not a stew recipe
          if (!(recipe.title && (recipe.title.includes('stew') || recipe.title.includes('Stew')))) {
            // Mark this recipe as failed for DALL-E to avoid future retries
            dalleFailedCache.add(cacheKey);
          }
          console.error(`[Fallback] DALL-E error:`, err);
          // Continue to next strategy
        }
      }

      // Try Unsplash if DALL-E failed and not tried already
      if (!strategiesTriedRef.current.includes('unsplash')) {
        console.log(`[Fallback] Trying Unsplash for ${recipe.title}`);
        strategiesTriedRef.current.push('unsplash');

        try {
          // Make sure we have a valid recipe title
          if (recipe.title && typeof recipe.title === 'string') {
            // Create a clean search term from the recipe title
            const searchTerm = recipe.title.replace(/[^\w\s]/gi, '');
            // Add a cache-busting parameter to prevent getting the same image
            const cacheBuster = Date.now().toString().slice(-4);
            const unsplashUrl = `https://source.unsplash.com/featured/?food,${encodeURIComponent(searchTerm)}&cb=${cacheBuster}`;

            setFallbackUrl(unsplashUrl);
            setIsLoadingFallback(false);
            return;
          } else {
            console.log(`[Fallback] Invalid recipe title for Unsplash: ${recipe.title}`);
          }
        } catch (err) {
          console.error(`[Fallback] Unsplash error:`, err);
          // Continue to next strategy
        }
      }

      // Fall back to placeholder as last resort
      if (!strategiesTriedRef.current.includes('placeholder')) {
        console.log(`[Fallback] Using placeholder for ${recipe.title}`);
        strategiesTriedRef.current.push('placeholder');

        try {
          // Generate a consistent placeholder based on recipe ID
          // Make sure we have a valid ID
          if (recipe.id && typeof recipe.id === 'string') {
            // Extract numbers from ID or create a random seed
            const idNum = recipe.id.match(/\d+/g);
            const placeholderId = idNum
              ? idNum.join('').slice(0, 6)
              : Math.floor(Math.random() * 1000).toString();
            const placeholderUrl = `https://picsum.photos/seed/${placeholderId}/800/600`;

            setFallbackUrl(placeholderUrl);
            setIsLoadingFallback(false);
            return;
          } else {
            // Use a default placeholder if ID is invalid
            setFallbackUrl('https://picsum.photos/seed/fallback/800/600');
            setIsLoadingFallback(false);
            return;
          }
        } catch (err) {
          console.error(`[Fallback] Placeholder error:`, err);
          // Use a fully static fallback as absolute last resort
          setFallbackUrl('https://picsum.photos/seed/fallback/800/600');
          setIsLoadingFallback(false);
          return;
        }
      }
    } catch (err) {
      console.error(`[Fallback] Error:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Use a static fallback when all else fails
      setFallbackUrl('https://picsum.photos/seed/fallback/800/600');
    } finally {
      setIsLoadingFallback(false);
    }
  }, [recipe]);

  return {
    fallbackUrl,
    isLoadingFallback,
    error,
    tryNextFallback,
  };
}

// Add default export
export default useFallbackStrategies;
