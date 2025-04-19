import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility service for recipe generation operations
 */
export class RecipeGenerationUtils {
  /**
   * Generate a cache key for recipe generation requests
   */
  public static generateCacheKey(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    numRecipes: number
  ): string {
    // Sort ingredients to ensure consistent keys
    const sortedIngredients = ingredients
      .map(ing => (typeof ing === 'string' ? ing : ing.name))
      .sort()
      .join(',');

    return `${sortedIngredients}_${filterMode}_${numRecipes}`;
  }

  /**
   * Convert a recipe to database format for caching
   */
  public static convertToDatabaseFormat(recipe: Recipe): any {
    // Ensure recipe has required fields
    const validRecipe = {
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      prepTime: recipe.prepTime || '15 mins',
      cookTime: recipe.cookTime || '30 mins',
      servings: recipe.servings || 4,
      image:
        recipe.image ||
        `https://source.unsplash.com/featured/?recipe,food,cooking/${encodeURIComponent(recipe.title || 'Recipe')}`,
    };

    // Extract ingredient names for efficient matching
    const ingredientNames = validRecipe.ingredients.map(ing => ing.name.toLowerCase());

    return {
      id: validRecipe.id || uuidv4(),
      title: validRecipe.title,
      ingredients: JSON.stringify(validRecipe.ingredients),
      instructions: validRecipe.instructions,
      prep_time: validRecipe.prepTime,
      cook_time: validRecipe.cookTime,
      servings: validRecipe.servings,
      image: validRecipe.image,
      tags: validRecipe.tags || [],
      inventory_ingredients: ingredientNames,
      filter_mode: 'hybrid', // Default to hybrid
      usage_count: 0,
    };
  }

  /**
   * Convert multiple recipes to database format
   */
  public static convertMultipleToDatabaseFormat(recipes: Recipe[]): any[] {
    return recipes.map(recipe => this.convertToDatabaseFormat(recipe));
  }

  /**
   * Convert database recipe to application format
   */
  public static convertFromDatabaseFormat(dbRecipe: any): Recipe {
    let ingredients;
    try {
      ingredients =
        typeof dbRecipe.ingredients === 'string'
          ? JSON.parse(dbRecipe.ingredients)
          : dbRecipe.ingredients;
    } catch (e) {
      console.error('Error parsing ingredients:', e);
      ingredients = [];
    }

    // Ensure all required fields are present
    return {
      id: dbRecipe.id,
      title: dbRecipe.title || 'New Recipe',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(dbRecipe.instructions) ? dbRecipe.instructions : [],
      prepTime: dbRecipe.prep_time || '15 mins',
      cookTime: dbRecipe.cook_time || '30 mins',
      servings: dbRecipe.servings || 4,
      image:
        dbRecipe.image ||
        `https://source.unsplash.com/featured/?recipe,food,cooking/${encodeURIComponent(dbRecipe.title || 'Recipe')}`,
      tags: Array.isArray(dbRecipe.tags) ? dbRecipe.tags : [],
    };
  }

  /**
   * Convert multiple database recipes to application format
   */
  public static convertMultipleFromDatabaseFormat(dbRecipes: any[]): Recipe[] {
    return dbRecipes.map(dbRecipe => this.convertFromDatabaseFormat(dbRecipe));
  }
}
