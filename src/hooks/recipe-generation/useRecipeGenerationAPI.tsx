import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useOpenAIRecipeGeneration } from '@/hooks/openai/useOpenAIRecipeGeneration';
import { useSpoonacularRecipeGeneration } from '@/hooks/useSpoonacularRecipeGeneration';
import { shouldUseFallbackForError } from '@/utils/errorHandling';
import { addStatusMessage } from '@/components/ui/status-indicator';

// PERFORMANCE: Add client-side recipe cache
const recipeGenerationCache = new Map<string, { recipes: Recipe[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Hook for API integration with recipe generation services
 */
export const useRecipeGenerationAPI = (
  addRecipe: (recipe: Recipe) => void,
  addMultipleRecipes: (recipes: Recipe[]) => void,
  existingRecipeTitles: string[] = [],
  updateProgress: (current: number, total: number, message?: string) => void
) => {
  const { toast } = useToast();

  // API providers
  const {
    isGenerating: isGeneratingOpenAI,
    generatingMultiple: generatingMultipleOpenAI,
    generateRecipeWithOpenAI,
    setProgressCallback: setOpenAIProgressCallback,
  } = useOpenAIRecipeGeneration();

  const {
    isGenerating: isGeneratingSpoonacular,
    isLoading,
    generatingMultiple: generatingMultipleSpoonacular,
    generateRecipesWithSpoonacular,
    setProgressCallback: setSpoonacularProgressCallback,
  } = useSpoonacularRecipeGeneration();

  // Register progress callbacks
  const setupProgressCallbacks = useCallback(() => {
    setOpenAIProgressCallback(progress => {
      if (progress) {
        updateProgress(progress.current, progress.total, progress.statusMessage);
      }
    });

    setSpoonacularProgressCallback(progress => {
      if (progress) {
        updateProgress(progress.current, progress.total, progress.statusMessage);
      }
    });
  }, [setOpenAIProgressCallback, setSpoonacularProgressCallback, updateProgress]);

  /**
   * Generate cache key for recipe generation
   */
  const generateCacheKey = useCallback((inventory: any[], filterMode: RecipeFilterMode): string => {
    if (!inventory || inventory.length === 0) return '';

    const ingredientIds = inventory
      .filter(item => item.id)
      .map(item => item.id)
      .sort()
      .join(',');

    return `${ingredientIds}_${filterMode}`;
  }, []);

  /**
   * Generate with OpenAI directly
   */
  const generateWithOpenAI = useCallback(
    async (inventory: any[], filterMode: RecipeFilterMode = 'hybrid'): Promise<Recipe | null> => {
      try {
        updateProgress(0, 6, 'Preparing to generate recipes with OpenAI...');

        // PERFORMANCE: Check client-side cache first
        const cacheKey = generateCacheKey(inventory, filterMode);
        const now = Date.now();
        const cachedData = recipeGenerationCache.get(cacheKey);

        if (cachedData && now - cachedData.timestamp < CACHE_TTL && cachedData.recipes.length > 0) {
          // Show different progress for cached results
          updateProgress(1, 6, 'Using previously generated recipes...');

          // Simulate processing time for better UX
          await new Promise(resolve => setTimeout(resolve, 500));
          updateProgress(3, 6, 'Retrieving recipes from cache...');

          await new Promise(resolve => setTimeout(resolve, 300));
          updateProgress(5, 6, 'Finalizing recipes...');

          // Add recipes in batches for better performance
          const recipesToAdd = cachedData.recipes.slice(0, 6);

          // Process in small batches of 2 recipes with slight delays
          for (let i = 0; i < recipesToAdd.length; i += 2) {
            const batch = recipesToAdd.slice(i, i + 2);
            addMultipleRecipes(batch);
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          updateProgress(6, 6, 'Recipes loaded from cache');

          // Return first recipe
          return recipesToAdd[0] || null;
        }

        // Generate new recipes if not in cache
        const result = await generateRecipeWithOpenAI(
          inventory,
          (recipe: Recipe) => {
            addRecipe(recipe);
            return true;
          },
          filterMode,
          false,
          existingRecipeTitles
        );

        // PERFORMANCE: Cache successful results
        if (result && cacheKey) {
          const newCacheEntry = {
            recipes: [result],
            timestamp: now,
          };
          recipeGenerationCache.set(cacheKey, newCacheEntry);
        }

        return result;
      } catch (error) {
        console.error('Error directly generating with OpenAI:', error);
        throw error;
      }
    },
    [
      generateRecipeWithOpenAI,
      addRecipe,
      addMultipleRecipes,
      existingRecipeTitles,
      updateProgress,
      generateCacheKey,
    ]
  );

  /**
   * Generate recipes using Spoonacular as fallback
   */
  const generateWithSpoonacular = useCallback(
    async (ingredientNames: string[], filterMode: RecipeFilterMode): Promise<Recipe | null> => {
      try {
        updateProgress(0, 6, 'Trying alternative recipe service...');

        return await generateRecipesWithSpoonacular(
          ingredientNames,
          (recipe: Recipe) => {
            addRecipe(recipe);
            return true;
          },
          (recipes: Recipe[]) => {
            if (recipes.length > 0) {
              let addedCount = 0;

              // PERFORMANCE: Process recipes in small batches to avoid UI freezing
              const processBatch = (index: number) => {
                if (index >= recipes.length) {
                  return addedCount;
                }

                const batch = recipes.slice(index, index + 3);
                addMultipleRecipes(batch);
                addedCount += batch.length;

                // Process next batch
                setTimeout(() => processBatch(index + 3), 50); // Reduced delay for faster processing
              };

              processBatch(0);
              return recipes.length;
            }
            return 0;
          },
          filterMode
        );
      } catch (error) {
        console.error('Error generating with Spoonacular:', error);
        throw error;
      }
    },
    [generateRecipesWithSpoonacular, addRecipe, addMultipleRecipes, updateProgress]
  );

  /**
   * Try primary provider with fallback
   */
  const generateWithFallback = useCallback(
    async (inventory: any[], filterMode: RecipeFilterMode): Promise<Recipe | null> => {
      try {
        updateProgress(0, 6, 'Preparing to generate recipes...');

        // Try with OpenAI first
        return await generateWithOpenAI(inventory, filterMode);
      } catch (error) {
        console.error(
          'Error generating recipe with OpenAI, checking if fallback is appropriate:',
          error
        );

        // Check if we should use fallback
        if (shouldUseFallbackForError(error)) {
          toast({
            title: 'Switching to alternative recipe service',
            description: "We'll try a different service to generate your recipes.",
          });

          const ingredientNames = inventory.map(item => item.name);
          return await generateWithSpoonacular(ingredientNames, filterMode);
        }

        // If not a fallback-able error, rethrow
        throw error;
      }
    },
    [generateWithOpenAI, generateWithSpoonacular, toast, updateProgress]
  );

  return {
    isGeneratingOpenAI,
    isGeneratingSpoonacular,
    isSpoonacularLoading: isLoading,
    generatingMultipleOpenAI,
    generatingMultipleSpoonacular,
    generateWithOpenAI,
    generateWithSpoonacular,
    generateWithFallback,
    setupProgressCallbacks,
  };
};
