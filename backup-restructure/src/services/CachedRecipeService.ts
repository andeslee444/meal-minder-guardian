import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { supabase } from '@/lib/supabase';
import { RecipeGenerationUtils } from './generation/RecipeGenerationUtils';

/**
 * Service for managing cached recipes
 */
export class CachedRecipeService {
  /**
   * Find matching cached recipes based on ingredients and filter mode
   */
  public static async findMatchingRecipes(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    limit: number = 5
  ): Promise<{ recipes: Recipe[]; matchPercentages: Record<string, number> }> {
    try {
      if (!ingredients || ingredients.length === 0) {
        return { recipes: [], matchPercentages: {} };
      }

      // Extract ingredient names
      const ingredientNames = ingredients.map(ing =>
        typeof ing === 'string' ? ing.toLowerCase() : ing.name.toLowerCase()
      );

      console.log(
        `Searching for cached recipes with ${ingredientNames.length} ingredients and ${filterMode} mode`
      );

      // Call the database function to find matching recipes
      const { data, error } = await supabase.rpc('find_matching_cached_recipes', {
        input_ingredients: ingredientNames,
        filter_mode: filterMode,
        limit_count: limit,
      });

      if (error) {
        console.error('Error finding matching cached recipes:', error);
        return { recipes: [], matchPercentages: {} };
      }

      if (!data || data.length === 0) {
        console.log('No matching cached recipes found');
        return { recipes: [], matchPercentages: {} };
      }

      console.log(`Found ${data.length} matching cached recipes`);

      // Create a map of recipe IDs to match percentages
      const matchPercentages = data.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: item.match_percentage,
        }),
        {}
      );

      // Convert database format to application format
      const recipes = data.map(item => {
        const recipe = RecipeGenerationUtils.convertFromDatabaseFormat(item);
        return recipe;
      });

      return { recipes, matchPercentages };
    } catch (error) {
      console.error('Error in findMatchingRecipes:', error);
      return { recipes: [], matchPercentages: {} };
    }
  }

  /**
   * Save a recipe to the cache
   */
  public static async saveRecipeToCache(
    recipe: Recipe,
    ingredients: any[],
    filterMode: RecipeFilterMode
  ): Promise<boolean> {
    try {
      if (!recipe || !recipe.title) {
        console.error('Invalid recipe to cache');
        return false;
      }

      // Skip caching if no image is present
      if (!recipe.image) {
        console.log('Skipping cache for recipe without image');
        return false;
      }

      // Extract ingredient names
      const ingredientNames = ingredients.map(ing =>
        typeof ing === 'string' ? ing.toLowerCase() : ing.name.toLowerCase()
      );

      // Prepare recipe for database
      const dbRecipe = RecipeGenerationUtils.convertToDatabaseFormat(recipe);
      dbRecipe.inventory_ingredients = ingredientNames;
      dbRecipe.filter_mode = filterMode;

      // Insert into cache
      const { error } = await supabase.from('cached_recipes').insert([dbRecipe]);

      if (error) {
        console.error('Error saving recipe to cache:', error);
        return false;
      }

      console.log(`Recipe "${recipe.title}" saved to cache`);
      return true;
    } catch (error) {
      console.error('Error in saveRecipeToCache:', error);
      return false;
    }
  }

  /**
   * Increment usage count for a cached recipe
   */
  public static async incrementUsageCount(recipeId: string): Promise<void> {
    try {
      // Call the RPC function directly to increment the usage count
      const { error } = await supabase.rpc('increment_usage_count', { recipe_id: recipeId });

      if (error) {
        console.error('Error incrementing usage count:', error);
      }
    } catch (error) {
      console.error('Error in incrementUsageCount:', error);
    }
  }
}
