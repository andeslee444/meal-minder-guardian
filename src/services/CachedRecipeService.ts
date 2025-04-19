import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { supabase } from '@/lib/supabase';
import { RecipeGenerationUtils } from './generation/RecipeGenerationUtils';
import { getClient, withPerformanceTracking, handleSupabaseError } from '@/lib/admin-utils';
import { SupabaseClient, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Cache settings
const MAX_CACHE_AGE_DAYS = 30; // Remove recipes older than 30 days
const MAX_CACHE_SIZE = 200; // Max number of recipes to keep in cache
const MIN_USAGE_COUNT = 3; // Usage threshold for retention during cleanup

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

      // Call the database function to find matching recipes - use standard client since this is a read operation
      const { data, error } = await withPerformanceTracking<PostgrestResponse<any>>('Find matching cached recipes', async () => 
        supabase.rpc('find_matching_cached_recipes', {
          input_ingredients: ingredientNames,
          filter_mode: filterMode,
          limit_count: limit,
        })
      );

      if (error) {
        handleSupabaseError(error, 'finding matching cached recipes');
        return { recipes: [], matchPercentages: {} };
      }

      if (!data || data.length === 0) {
        console.log('No matching cached recipes found');
        return { recipes: [], matchPercentages: {} };
      }

      console.log(`Found ${data.length} matching cached recipes`);

      // Create a map of recipe IDs to match percentages
      const matchPercentages = data.reduce(
        (acc: Record<string, number>, item: any) => ({
          ...acc,
          [item.id]: item.match_percentage,
        }),
        {}
      );

      // Convert database format to application format
      const recipes = data.map((item: any) => {
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

      // Use admin client to bypass RLS for cache operations
      const client = getClient(true);
      
      // Insert into cache - using any for PostgrestSingleResponse to avoid type errors
      const { error } = await withPerformanceTracking<any>('Save recipe to cache', async () => 
        client.from('cached_recipes').insert([dbRecipe])
      );

      if (error) {
        handleSupabaseError(error, 'saving recipe to cache');
        return false;
      }

      console.log(`Recipe "${recipe.title}" saved to cache`);
      
      // Trigger cache maintenance occasionally (1/10 chance)
      if (Math.random() < 0.1) {
        // Run cache maintenance in the background
        this.performCacheMaintenance().catch(err => 
          console.error('Cache maintenance error:', err)
        );
      }
      
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
      // Use admin client for updating usage stats
      const client = getClient(true);
      
      // Call the RPC function directly to increment the usage count
      const { error } = await withPerformanceTracking<any>('Increment usage count', async () => 
        client.rpc('increment_usage_count', { recipe_id: recipeId })
      );

      if (error) {
        handleSupabaseError(error, 'incrementing usage count');
      }
    } catch (error) {
      console.error('Error in incrementUsageCount:', error);
    }
  }
  
  /**
   * Perform cache maintenance to keep the cache size manageable
   * - Remove old recipes that haven't been used
   * - Keep popular recipes longer
   * - Ensure cache doesn't grow too large
   */
  private static async performCacheMaintenance(): Promise<void> {
    try {
      console.log('Performing cache maintenance...');
      const client = getClient(true);
      
      await withPerformanceTracking('Cache maintenance', async () => {
        // Step 1: Delete old recipes with low usage
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - MAX_CACHE_AGE_DAYS);
        const oldDateString = oldDate.toISOString();
        
        const { error: oldRecipesError } = await client
          .from('cached_recipes')
          .delete()
          .lt('created_at', oldDateString)
          .lt('usage_count', MIN_USAGE_COUNT);
          
        if (oldRecipesError) {
          handleSupabaseError(oldRecipesError, 'deleting old cache entries');
          return;
        }
        
        // Step 2: Get total count to see if we need to perform size-based cleanup
        const { count, error: countError } = await client
          .from('cached_recipes')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          handleSupabaseError(countError, 'counting cache entries');
          return;
        }
        
        // Step 3: If cache is too large, remove least used recipes
        if (count && count > MAX_CACHE_SIZE) {
          const excessCount = count - MAX_CACHE_SIZE;
          console.log(`Cache too large (${count} > ${MAX_CACHE_SIZE}), removing ${excessCount} entries`);
          
          // Get the IDs of the least used recipes we want to delete
          const { data: recipesToDelete, error: selectError } = await client
            .from('cached_recipes')
            .select('id')
            .order('usage_count', { ascending: true })
            .order('created_at', { ascending: true })
            .limit(excessCount);
            
          if (selectError) {
            handleSupabaseError(selectError, 'selecting recipes for cache cleanup');
            return;
          }
          
          if (recipesToDelete && recipesToDelete.length > 0) {
            // Delete the selected recipes
            const ids = recipesToDelete.map(r => r.id);
            const { error: deleteError } = await client
              .from('cached_recipes')
              .delete()
              .in('id', ids);
              
            if (deleteError) {
              handleSupabaseError(deleteError, 'deleting excess cache entries');
              return;
            }
            
            console.log(`Removed ${recipesToDelete.length} least used recipes from cache`);
          }
        }
      });
    } catch (error) {
      console.error('Error during cache maintenance:', error);
    }
  }
}
