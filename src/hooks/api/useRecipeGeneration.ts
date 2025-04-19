import { useState, useCallback } from 'react';
import {
  findRecipesByIngredients,
  getRecipeInformation,
  type RecipeByIngredientsResponseItem,
  type Recipe,
} from '@/api/endpoints/spoonacular';
import { useToast } from '@/hooks/ui/useToast';

interface UseRecipeGenerationOptions {
  limit?: number;
  enableCache?: boolean;
}

interface UseRecipeGenerationResult {
  loading: boolean;
  recipes: RecipeByIngredientsResponseItem[];
  detailedRecipe: Recipe | null;
  error: Error | null;
  generateRecipes: (ingredients: string[]) => Promise<RecipeByIngredientsResponseItem[]>;
  getRecipeDetails: (recipeId: number) => Promise<Recipe | null>;
  clearRecipes: () => void;
  clearDetailedRecipe: () => void;
}

/**
 * React hook for generating recipes from ingredients
 */
export function useRecipeGeneration({
  limit = 5,
  enableCache = true,
}: UseRecipeGenerationOptions = {}): UseRecipeGenerationResult {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeByIngredientsResponseItem[]>([]);
  const [detailedRecipe, setDetailedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Generate recipes based on a list of ingredients
   */
  const generateRecipes = useCallback(
    async (ingredients: string[]): Promise<RecipeByIngredientsResponseItem[]> => {
      if (!ingredients.length) {
        setError(new Error('Please provide at least one ingredient'));
        toast({
          title: 'No ingredients provided',
          description: 'Please enter at least one ingredient to generate recipes.',
          variant: 'destructive',
        });
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const response = await findRecipesByIngredients({
          ingredients: ingredients.join(','),
          number: limit,
          ranking: 1,
          ignorePantry: true,
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to generate recipes');
        }

        if (!response.data || !response.data.length) {
          toast({
            title: 'No recipes found',
            description: 'Try different ingredients or less specific combinations.',
            variant: 'default',
          });
          setRecipes([]);
          return [];
        }

        toast({
          title: 'Recipes found!',
          description: `Found ${response.data.length} recipes with your ingredients.`,
          variant: 'default',
        });

        setRecipes(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));

        toast({
          title: 'Error generating recipes',
          description: errorMessage,
          variant: 'destructive',
        });

        return [];
      } finally {
        setLoading(false);
      }
    },
    [limit, toast]
  );

  /**
   * Get detailed information for a specific recipe
   */
  const getRecipeDetails = useCallback(
    async (recipeId: number): Promise<Recipe | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await getRecipeInformation({
          id: recipeId,
          includeNutrition: false,
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to get recipe details');
        }

        if (!response.data) {
          throw new Error('Recipe not found');
        }

        setDetailedRecipe(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));

        toast({
          title: 'Error getting recipe details',
          description: errorMessage,
          variant: 'destructive',
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  /**
   * Clear the current recipes list
   */
  const clearRecipes = useCallback(() => {
    setRecipes([]);
  }, []);

  /**
   * Clear the current detailed recipe
   */
  const clearDetailedRecipe = useCallback(() => {
    setDetailedRecipe(null);
  }, []);

  return {
    loading,
    recipes,
    detailedRecipe,
    error,
    generateRecipes,
    getRecipeDetails,
    clearRecipes,
    clearDetailedRecipe,
  };
}
