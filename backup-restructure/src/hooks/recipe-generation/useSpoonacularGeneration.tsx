import { useCallback } from 'react';
import { useSpoonacular } from '@/hooks/useSpoonacular';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

/**
 * Hook for Spoonacular recipe generation
 */
export const useSpoonacularGeneration = () => {
  const { isLoading, getRecipesByIngredients, getRecipeInformation } = useSpoonacular();

  /**
   * Generate a recipe using Spoonacular API
   */
  const generateWithSpoonacular = useCallback(
    async (inventory: any[], filterMode: RecipeFilterMode): Promise<Recipe | null> => {
      try {
        if (!inventory || inventory.length === 0) {
          throw new Error('No ingredients available for recipe generation');
        }

        // Extract ingredient names
        const ingredientNames = inventory.map(item => item.name);

        // Get recipes from Spoonacular
        const recipes = await getRecipesByIngredients(ingredientNames);

        if (!recipes || recipes.length === 0) {
          throw new Error('No recipes found matching your ingredients');
        }

        // Get a random recipe from the results
        const randomIndex = Math.floor(Math.random() * Math.min(5, recipes.length));
        const recipeResult = recipes[randomIndex];

        // Get detailed information
        const recipeDetails = await getRecipeInformation(recipeResult.id);

        if (!recipeDetails) {
          throw new Error('Failed to get recipe details');
        }

        // Convert to our app's recipe format
        const recipe: Recipe = {
          id: `spoonacular-${recipeDetails.id}`,
          title: recipeDetails.title,
          ingredients: recipeDetails.extendedIngredients.map(ing => ({
            name: ing.name,
            quantity: ing.amount.toString(),
            unit: ing.unit,
          })),
          instructions: recipeDetails.analyzedInstructions?.[0]?.steps.map(step => step.step) || [],
          image: recipeDetails.image,
          servings: recipeDetails.servings,
          prepTime: recipeDetails.preparationMinutes || 0,
          cookTime: recipeDetails.cookingMinutes || 0,
          tags: recipeDetails.diets || [],
        };

        return recipe;
      } catch (error) {
        console.error('Error generating recipe with Spoonacular:', error);
        throw error;
      }
    },
    [getRecipesByIngredients, getRecipeInformation]
  );

  return {
    generateWithSpoonacular,
    isSpoonacularLoading: isLoading,
  };
};
