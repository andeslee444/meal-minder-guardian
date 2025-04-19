import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpoonacularAPI = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recipes by ingredients
  const fetchRecipesByIngredients = useCallback(
    async (ingredients: string[], numberOfRecipes: number = 5) => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/spoonacular/recipes-by-ingredients?ingredients=${ingredients.join(',')}&number=${numberOfRecipes}`
        );

        if (!response.ok) {
          throw new Error(`Spoonacular API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching recipes by ingredients:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch recipe details
  const fetchRecipeDetails = useCallback(async (recipeId: number) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spoonacular/recipe/${recipeId}`);

      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Randomly select a recipe from results
  const selectRandomRecipe = useCallback((recipes: any[]) => {
    if (!recipes || recipes.length === 0) {
      throw new Error('No recipes found');
    }

    const randomIndex = Math.floor(Math.random() * recipes.length);
    return recipes[randomIndex];
  }, []);

  return {
    isLoading,
    fetchRecipesByIngredients,
    fetchRecipeDetails,
    selectRandomRecipe,
  };
};
