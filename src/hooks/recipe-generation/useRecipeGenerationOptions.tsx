import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

export const useRecipeGenerationOptions = () => {
  const { toast } = useToast();
  const { recipes } = useRecipeContext();

  // Get existing recipe titles to avoid duplicates
  const getExistingRecipeTitles = useCallback(() => {
    return recipes.map(recipe => recipe.title);
  }, [recipes]);

  // Validate that we have the necessary conditions to generate recipes
  const validateGenerationRequest = useCallback(
    (inventory: any[], filterMode: RecipeFilterMode, silent: boolean): boolean => {
      // For preference mode, we don't need inventory items
      if (filterMode === 'preference') {
        return true;
      }

      // For other modes, we need at least one ingredient
      if (!inventory || inventory.length === 0) {
        if (!silent) {
          toast({
            title: 'No Ingredients Available',
            description: 'Please add some ingredients to your inventory first.',
            variant: 'destructive',
          });
        }
        console.log('Recipe generation validation failed: No ingredients');
        return false;
      }

      return true;
    },
    [toast]
  );

  return {
    getExistingRecipeTitles,
    validateGenerationRequest,
  };
};
