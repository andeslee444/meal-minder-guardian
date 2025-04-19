import { useState, useCallback } from 'react';
import { Recipe, RecipeService, GenerateRecipeRequest } from '../services/recipeService';
import { useToast } from '@/components/ui/use-toast';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedRecipes = await RecipeService.getRecipes();
      setRecipes(loadedRecipes);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recipes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateRecipes = useCallback(
    async (request: GenerateRecipeRequest) => {
      try {
        setIsLoading(true);
        const newRecipes = await RecipeService.generateRecipes(request);
        setRecipes(prevRecipes => [...newRecipes, ...prevRecipes]);
        return newRecipes;
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to generate recipes. Please try again.',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const saveRecipe = useCallback(
    async (recipe: Recipe) => {
      try {
        setIsLoading(true);
        await RecipeService.saveRecipe(recipe);
        setRecipes(prevRecipes => [recipe, ...prevRecipes]);
        toast({
          title: 'Success',
          description: 'Recipe saved successfully!',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save recipe. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    recipes,
    isLoading,
    loadRecipes,
    generateRecipes,
    saveRecipe,
  };
}
