import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';
import { handleRecipeAPIError, shouldUseFallbackForError } from '@/utils/errorHandling';
import { OpenAIGenerationService } from './generation/OpenAIGenerationService';
import { SpoonacularGenerationService } from './generation/SpoonacularGenerationService';
import { RecipeGenerationUtils } from './generation/RecipeGenerationUtils';
import { CachedRecipeService } from './CachedRecipeService';

/**
 * Main service that orchestrates recipe generation across different providers
 */
export class RecipeGenerationService {
  /**
   * Check if we have matching cached recipes
   * @param ingredients List of ingredients to use
   * @param filterMode The filtering mode
   * @param existingRecipes Array of existing recipe IDs to avoid duplication
   * @returns Array of matching recipes
   */
  public static async checkCachedRecipes(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    existingRecipes: string[] = []
  ): Promise<Recipe[]> {
    try {
      if (filterMode === 'preference' || ingredients.length === 0) {
        return [];
      }

      const { recipes } = await CachedRecipeService.findMatchingRecipes(
        ingredients,
        filterMode,
        10 // Get up to 10 matches
      );

      // Filter out existing recipes
      return recipes.filter(recipe => !existingRecipes.includes(recipe.id));
    } catch (error) {
      console.error('Error checking cached recipes:', error);
      return [];
    }
  }

  /**
   * Generate recipe using OpenAI
   * @param ingredients List of ingredients to use
   * @param filterMode The filtering mode (strict, hybrid, preference)
   * @param existingRecipes Array of existing recipe IDs to avoid duplication
   * @param onProgress Progress callback
   */
  public static async generateWithOpenAI(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    existingRecipes: string[] = [],
    onProgress?: (progress: RecipeGenerationProgress) => void
  ): Promise<Recipe | null> {
    console.log('Directly generating recipe with OpenAI:', {
      ingredientsCount: ingredients.length,
      filterMode,
      existingRecipesCount: existingRecipes.length,
    });

    try {
      return await OpenAIGenerationService.generateRecipe(
        ingredients,
        filterMode,
        existingRecipes,
        onProgress
      );
    } catch (error) {
      console.error('Error in generateWithOpenAI:', error);

      // Handle the error and return null
      handleRecipeAPIError(error, true, 'openai');
      return null;
    }
  }

  /**
   * Generate recipe using Spoonacular with fallback to OpenAI
   * @param ingredients List of ingredients to use
   * @param filterMode The filtering mode
   * @param existingRecipes Array of existing recipe IDs to avoid duplication
   * @param onProgress Progress callback
   */
  public static async generateWithSpoonacularOrFallback(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    existingRecipes: string[] = [],
    onProgress?: (progress: RecipeGenerationProgress) => void
  ): Promise<Recipe | null> {
    try {
      // First check if we have matching cached recipes
      if (filterMode !== 'preference' && ingredients.length > 0) {
        // Update progress if callback provided
        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 0,
            total: 100,
            percentage: 0,
            stage: 'Checking recipe cache',
          });
        }

        const cachedRecipes = await this.checkCachedRecipes(
          ingredients,
          filterMode,
          existingRecipes
        );

        if (cachedRecipes.length > 0) {
          // Get a random recipe from the top matches to provide variety
          const randomIndex = Math.floor(Math.random() * Math.min(3, cachedRecipes.length));
          const cachedRecipe = cachedRecipes[randomIndex];

          // Increment usage count for this recipe
          await CachedRecipeService.incrementUsageCount(cachedRecipe.id);

          // Add status message about using cached recipe
          addStatusMessage(
            'info',
            'Using a recipe from the cache that matches your ingredients',
            'Recipe Cache'
          );

          // Complete progress
          if (onProgress) {
            onProgress({
              isGenerating: true,
              current: 100,
              total: 100,
              percentage: 100,
              stage: 'Found cached recipe',
            });
          }

          console.log('Using cached recipe:', cachedRecipe.title);
          return cachedRecipe;
        }
      }

      console.log('No suitable cached recipes found, trying Spoonacular');

      // Second, try with Spoonacular
      return await this.generateWithSpoonacular(ingredients, filterMode, onProgress);
    } catch (error: any) {
      console.log('Spoonacular generation failed:', error);
      console.log('Error type:', typeof error);
      console.log('Error keys:', Object.keys(error));
      console.log('Error message:', error.message);
      console.log('Error status:', error.status);

      // Force fallback for debugging
      let shouldFallback = true;

      // Check if it's an API limit error to determine if we should fall back
      if (typeof error === 'object') {
        if (
          error.status === 402 ||
          error.code === 402 ||
          (error.message && (error.message.includes('limit') || error.message.includes('quota')))
        ) {
          shouldFallback = true;
        }
      }

      if (shouldFallback) {
        console.log('Falling back to OpenAI generation');

        addStatusMessage(
          'info',
          'Switching to AI generation due to API limits',
          'Recipe Generator'
        );

        // Fallback to OpenAI
        return await this.generateWithOpenAI(ingredients, filterMode, existingRecipes, onProgress);
      }

      // If not an API limit error, just propagate it
      console.log('Error is not suitable for fallback, propagating original error');
      throw error;
    }
  }

  /**
   * Generate recipe using Spoonacular
   * @param ingredients List of ingredients to use
   * @param filterMode The filtering mode
   * @param onProgress Progress callback
   */
  private static async generateWithSpoonacular(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    onProgress?: (progress: RecipeGenerationProgress) => void
  ): Promise<Recipe | null> {
    console.log('Generating recipe with Spoonacular:', {
      ingredientsCount: ingredients.length,
      filterMode,
    });

    try {
      return await SpoonacularGenerationService.generateRecipe(ingredients, filterMode, onProgress);
    } catch (error) {
      console.error('Error in generateWithSpoonacular:', error);

      // Format the error correctly to ensure proper fallback detection
      const limitError = {
        type: 'api_rate_limit',
        message: 'Spoonacular API daily limit reached. Switching to AI generation.',
        source: 'spoonacular',
        recoverable: true,
        retryable: false,
        status: 402,
      };

      throw limitError;
    }
  }

  /**
   * Generate a cache key for recipe generation requests
   */
  public static generateCacheKey(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    numRecipes: number
  ): string {
    return RecipeGenerationUtils.generateCacheKey(ingredients, filterMode, numRecipes);
  }
}
