import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Recipe } from '@/types/recipe';
import RecipeDetails from './RecipeDetails';
import RecipeDialogTitle from './details/RecipeDialogTitle';

interface RecipeDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecipe: Recipe | null;
  getIngredientStatus: (name: string) => 'available' | 'missing' | 'expired' | 'expiring-soon';
}

const RecipeDetailsDialog: React.FC<RecipeDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedRecipe,
  getIngredientStatus,
}) => {
  if (!selectedRecipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <RecipeDialogTitle recipe={selectedRecipe} />
          </DialogTitle>
        </DialogHeader>
        <RecipeDetails
          recipe={selectedRecipe}
          getIngredientStatus={getIngredientStatus}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailsDialog;
