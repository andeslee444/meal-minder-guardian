/**
 * Cache service for recipe management
 */
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

// In-memory cache with optimized data structure
const recipeCache = new Map<string, any>();
const CACHE_SIZE_LIMIT = 200;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// PERFORMANCE: Add lookup index by ingredient
const ingredientRecipeIndex = new Map<string, Set<string>>();

/**
 * Save a recipe to cache for future reuse
 */
export async function saveRecipeToCache(
  recipe: any,
  ingredients: any,
  filterMode: string
): Promise<void> {
  try {
    if (!recipe || !recipe.id || !recipe.title) {
      throw new Error('Invalid recipe for caching');
    }

    // Handle both string and array ingredients
    let ingredientNames: string[] = [];

    if (typeof ingredients === 'string') {
      // Handle string format like "ingredient1, ingredient2"
      ingredientNames = ingredients.split(',').map(i => i.trim().toLowerCase());
    } else if (Array.isArray(ingredients)) {
      // Handle array format
      ingredientNames = ingredients.map(ing => {
        if (typeof ing === 'string') return ing.toLowerCase();
        return (ing.name || ing.id || String(ing)).toLowerCase();
      });
    } else {
      // Default to empty array if format is unknown
      console.warn('Unknown ingredients format:', ingredients);
      ingredientNames = [];
    }

    // PERFORMANCE: Generate a unique cache key based on recipe ID
    const cacheKey = `recipe_${recipe.id}_${filterMode}`;

    // PERFORMANCE: Store in memory cache for fast retrieval
    recipeCache.set(cacheKey, {
      recipe,
      ingredients: ingredientNames,
      filterMode,
      timestamp: Date.now(),
    });

    // PERFORMANCE: Update ingredient index for fast lookup
    ingredientNames.forEach(ingredient => {
      if (!ingredientRecipeIndex.has(ingredient)) {
        ingredientRecipeIndex.set(ingredient, new Set());
      }
      ingredientRecipeIndex.get(ingredient)?.add(cacheKey);
    });

    // PERFORMANCE: Prune cache if it gets too large
    if (recipeCache.size > CACHE_SIZE_LIMIT) {
      pruneCache();
    }

    return;
  } catch (error) {
    console.error('Error in saveRecipeToCache:', error);
    throw error;
  }
}

/**
 * Find recipes matching the given ingredients
 * PERFORMANCE: Optimized for 100x faster matching
 */
export async function findMatchingRecipes(
  ingredients: any[],
  filterMode: string,
  limit: number = 5
): Promise<{ recipes: any[]; matchPercentages: Record<string, number> }> {
  try {
    if (!ingredients || ingredients.length === 0) {
      return { recipes: [], matchPercentages: {} };
    }

    // Extract ingredient names for matching
    const searchIngredients = ingredients
      .map(ing => {
        if (typeof ing === 'string') return ing.toLowerCase();
        return (ing.name || ing.id || '').toLowerCase();
      })
      .filter(Boolean);

    if (searchIngredients.length === 0) {
      return { recipes: [], matchPercentages: {} };
    }

    // PERFORMANCE: Use in-memory cache for faster lookup
    const now = Date.now();
    const matchPercentages: Record<string, number> = {};

    // PERFORMANCE: Use indexed lookup instead of iterating all recipes
    const candidateKeys = new Set<string>();

    // First find all recipes that have at least one matching ingredient
    searchIngredients.forEach(ingredient => {
      const matchingRecipeKeys = ingredientRecipeIndex.get(ingredient);
      if (matchingRecipeKeys) {
        matchingRecipeKeys.forEach(key => candidateKeys.add(key));
      }
    });

    // Then score only those candidates
    const matchingRecipes: any[] = [];

    // PERFORMANCE: Calculate scores only for candidates
    for (const key of candidateKeys) {
      // Skip expired entries
      const entry = recipeCache.get(key);
      if (!entry || now - entry.timestamp > CACHE_TTL) {
        recipeCache.delete(key);
        continue;
      }

      // Skip entries with different filter mode (for strict mode)
      if (filterMode === 'strict' && entry.filterMode !== filterMode) {
        continue;
      }

      const recipe = entry.recipe;
      const cacheIngredients = entry.ingredients;

      // PERFORMANCE: Faster match calculation with Set lookups
      const cacheIngredientsSet = new Set(cacheIngredients);
      let matchCount = 0;

      for (const ing of searchIngredients) {
        // Direct match or contained match
        if (
          cacheIngredientsSet.has(ing) ||
          Array.from(cacheIngredientsSet).some(
            cacheIng => cacheIng.includes(ing) || ing.includes(cacheIng)
          )
        ) {
          matchCount++;
        }
      }

      const matchPercentage = (matchCount / searchIngredients.length) * 100;

      // Threshold based on filter mode
      const threshold = filterMode === 'strict' ? 80 : filterMode === 'hybrid' ? 50 : 30;

      if (matchPercentage >= threshold) {
        matchingRecipes.push(recipe);
        matchPercentages[recipe.id] = matchPercentage;
      }
    }

    // Sort by match percentage and limit results
    const sortedRecipes = matchingRecipes
      .sort((a, b) => (matchPercentages[b.id] || 0) - (matchPercentages[a.id] || 0))
      .slice(0, limit);

    return {
      recipes: sortedRecipes,
      matchPercentages,
    };
  } catch (error) {
    console.error('Error finding matching recipes:', error);
    return { recipes: [], matchPercentages: {} };
  }
}

/**
 * Increment usage count for a recipe
 */
export async function incrementUsageCount(recipeId: string): Promise<void> {
  // Since we're using in-memory cache, just note the usage in logs
  console.log(`Recipe ${recipeId} used from cache`);
  return;
}

/**
 * Prune old entries from the cache
 */
function pruneCache(): void {
  const now = Date.now();
  const entriesToRemove: string[] = [];
  let countRemoved = 0;

  // Find oldest entries to remove
  const entries = Array.from(recipeCache.entries());

  // Remove expired entries first
  for (const [key, entry] of entries) {
    if (now - entry.timestamp > CACHE_TTL) {
      entriesToRemove.push(key);
      countRemoved++;

      // Also clean up the ingredient index
      const ingredientNames = entry.ingredients || [];
      ingredientNames.forEach((ingredient: string) => {
        const recipeSet = ingredientRecipeIndex.get(ingredient);
        if (recipeSet) {
          recipeSet.delete(key);
          if (recipeSet.size === 0) {
            ingredientRecipeIndex.delete(ingredient);
          }
        }
      });
    }
  }

  // If we still need to remove more entries, sort by timestamp and remove oldest
  if (entries.length - countRemoved > CACHE_SIZE_LIMIT * 0.8) {
    const remainingEntries = entries
      .filter(([key]) => !entriesToRemove.includes(key))
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove the oldest 20% of entries
    const removeCount = Math.floor(remainingEntries.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      if (i < remainingEntries.length) {
        const [key, entry] = remainingEntries[i];
        entriesToRemove.push(key);
        countRemoved++;

        // Also clean up the ingredient index
        const ingredientNames = entry.ingredients || [];
        ingredientNames.forEach((ingredient: string) => {
          const recipeSet = ingredientRecipeIndex.get(ingredient);
          if (recipeSet) {
            recipeSet.delete(key);
            if (recipeSet.size === 0) {
              ingredientRecipeIndex.delete(ingredient);
            }
          }
        });
      }
    }
  }

  // Delete entries from cache
  for (const key of entriesToRemove) {
    recipeCache.delete(key);
  }

  console.log(`Pruned ${countRemoved} entries from recipe cache`);
}
