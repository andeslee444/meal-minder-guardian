import { useCallback } from 'react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';

/**
 * Hook for validating inventory before recipe generation
 */
export const useRecipeInventoryValidation = () => {
  /**
   * Validates that inventory is suitable for recipe generation
   */
  const validateInventoryForGeneration = useCallback(
    (inventory: any[], filterMode: RecipeFilterMode): boolean => {
      // For preference mode, we don't need inventory
      if (filterMode === 'preference') {
        return true;
      }

      // For inventory-based modes, we need at least 1 ingredient
      if (!inventory || inventory.length === 0) {
        console.log('No ingredients in inventory for generation');
        addStatusMessage(
          'error',
          'Please add some ingredients to your inventory before generating recipes.',
          'Recipe Generator'
        );
        return false;
      }

      return true;
    },
    []
  );

  return {
    validateInventoryForGeneration,
  };
};
