import { useEffect } from 'react';
import { Recipe } from '@/types/recipe';

interface UseRecipeContentWrapperProps {
  filteredRecipes: Recipe[];
  isGenerating: boolean;
  isBackgroundGeneration: boolean;
  apiLimitReached: boolean;
  recipesExist: boolean;
}

export const useRecipeContentWrapper = ({
  filteredRecipes,
  isGenerating,
  isBackgroundGeneration,
  apiLimitReached,
  recipesExist,
}: UseRecipeContentWrapperProps) => {
  // Add detailed debugging log to check props being passed
  useEffect(() => {
    console.log('RecipeContentWrapper hook with:', {
      filteredRecipesCount: filteredRecipes.length,
      isGenerating,
      isBackgroundGeneration,
      apiLimitReached,
      shouldShowGenerateMore: !isGenerating && !apiLimitReached && filteredRecipes.length > 0,
      recipesExist,
    });
  }, [filteredRecipes.length, isGenerating, isBackgroundGeneration, apiLimitReached, recipesExist]);

  // Determine if we should show the "Generate More" button
  const shouldShowGenerateMore = !isGenerating && !apiLimitReached && filteredRecipes.length > 0;

  return {
    shouldShowGenerateMore,
  };
};
