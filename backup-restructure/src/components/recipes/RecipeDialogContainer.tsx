import React from 'react';
import { Recipe } from '@/types/recipe';
import RecipeDetailsDialog from '@/components/recipes/RecipeDetailsDialog';

interface RecipeDialogContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecipe: Recipe | null;
  getIngredientStatus: (name: string) => 'available' | 'missing' | 'expired' | 'expiring-soon';
}

/**
 * Container component that manages the Recipe details dialog
 * This component provides a layer of abstraction over the dialog implementation
 */
const RecipeDialogContainer: React.FC<RecipeDialogContainerProps> = ({
  isOpen,
  onOpenChange,
  selectedRecipe,
  getIngredientStatus,
}) => {
  return (
    <RecipeDetailsDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedRecipe={selectedRecipe}
      getIngredientStatus={getIngredientStatus}
    />
  );
};

export default RecipeDialogContainer;
