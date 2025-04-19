import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

/**
 * Hook for validating inventory before recipe generation
 */
export const useInventoryValidation = () => {
  const { toast } = useToast();

  /**
   * Validate that inventory has ingredients for selected filter mode
   */
  const validateInventoryForGeneration = useCallback(
    (inventory: any[], filterMode: RecipeFilterMode): boolean => {
      if (inventory.length === 0 && filterMode !== 'preference') {
        toast({
          title: 'No ingredients available',
          description: 'Please add some ingredients to your inventory first.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    },
    [toast]
  );

  return {
    validateInventoryForGeneration,
  };
};
