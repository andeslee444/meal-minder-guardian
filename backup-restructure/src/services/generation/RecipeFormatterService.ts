import { Recipe } from '@/types/recipe';

/**
 * Service for formatting recipes from different sources to our app's Recipe type
 */
export class RecipeFormatterService {
  /**
   * Format a Spoonacular recipe to our app's Recipe type
   */
  public static formatSpoonacularRecipe(recipeDetails: any): Recipe {
    if (!recipeDetails) {
      throw new Error('Invalid recipe data from Spoonacular');
    }

    const ingredients =
      recipeDetails.extendedIngredients?.map((ingredient: any) => ({
        name: ingredient.name || 'Unknown ingredient',
        quantity: ingredient.amount?.toString() || '0',
        unit: ingredient.unit || '',
      })) || [];

    const instructions =
      recipeDetails.analyzedInstructions?.[0]?.steps.map((step: any) => step.step) || [];

    const recipe: Recipe = {
      id: crypto.randomUUID(), // Generate a unique ID for our app
      title: recipeDetails.title || 'Untitled Recipe',
      ingredients,
      instructions:
        instructions.length > 0
          ? instructions
          : [recipeDetails.instructions || 'No instructions available'],
      prepTime: recipeDetails.preparationMinutes > 0 ? recipeDetails.preparationMinutes : 15,
      cookTime: recipeDetails.cookingMinutes > 0 ? recipeDetails.cookingMinutes : 25,
      servings: recipeDetails.servings || 4,
      image: recipeDetails.image || undefined,
      tags: recipeDetails.dishTypes || [],
      isFavorite: false,
    };

    return recipe;
  }
}
