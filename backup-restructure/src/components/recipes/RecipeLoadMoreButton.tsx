import React from 'react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipe';
import { Loader2 } from 'lucide-react';

/**
 * Props for the RecipeLoadMoreButton component
 */
interface RecipeLoadMoreButtonProps {
  isGenerating: boolean;
  isBackgroundGeneration: boolean;
  apiLimitReached: boolean;
  handleGenerateMoreRecipes: () => Promise<void | null>;
  filteredRecipes: Recipe[];
}

/**
 * Button to generate more recipes
 * Only displayed when recipes exist and we're not currently generating
 */
const RecipeLoadMoreButton: React.FC<RecipeLoadMoreButtonProps> = ({
  isGenerating,
  isBackgroundGeneration,
  apiLimitReached,
  handleGenerateMoreRecipes,
  filteredRecipes,
}) => {
  // If no recipes are shown, don't render any buttons
  if (filteredRecipes.length === 0) {
    return null;
  }

  // Don't show when API limit is reached
  if (apiLimitReached) {
    return (
      <div className="mt-6 text-center">
        <p className="text-amber-600 text-sm mb-2">
          Recipe generation limit reached. Please try again later.
        </p>
      </div>
    );
  }

  const handleGenerateClick = async () => {
    if (isGenerating || isBackgroundGeneration) return;

    try {
      await handleGenerateMoreRecipes();
    } catch (error) {
      console.error('Error generating more recipes:', error);
    }
  };

  // Render "Generate More Recipes" button if recipes exist and we're not generating
  return (
    <div className="mt-6 text-center">
      <Button
        onClick={handleGenerateClick}
        disabled={isGenerating || isBackgroundGeneration}
        className="px-6 relative"
      >
        {isGenerating || isBackgroundGeneration ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <span>Generate More Recipes</span>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        This will create additional recipes based on your ingredients.
      </p>
    </div>
  );
};

export default RecipeLoadMoreButton;
