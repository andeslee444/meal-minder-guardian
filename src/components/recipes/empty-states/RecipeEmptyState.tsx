import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles, Loader2 } from 'lucide-react';

interface RecipeEmptyStateProps {
  inventoryLength: number;
  onGenerateRecipe: () => Promise<void | null>;
  isGenerating: boolean;
}

const RecipeEmptyState: React.FC<RecipeEmptyStateProps> = ({
  inventoryLength,
  onGenerateRecipe,
  isGenerating,
}) => {
  // Function to handle button click
  const handleGenerateClick = async () => {
    if (isGenerating) return;

    try {
      await onGenerateRecipe();
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      <div className="bg-primary/10 p-6 rounded-full">
        <ChefHat className="h-12 w-12 text-primary" />
      </div>

      <h3 className="text-2xl font-medium">No Recipes Yet</h3>

      <p className="text-muted-foreground max-w-md">
        Generate your first recipe based on ingredients in your inventory.
      </p>

      {inventoryLength > 0 ? (
        <Button
          size="lg"
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="mt-4 relative"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate First Recipe
            </>
          )}
        </Button>
      ) : (
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800 max-w-md">
          <p className="text-sm font-medium">You need ingredients first</p>
          <p className="text-xs mt-1">
            Add some ingredients to your inventory before generating recipes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeEmptyState;
