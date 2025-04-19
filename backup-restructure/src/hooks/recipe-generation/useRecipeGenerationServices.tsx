import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSpoonacularRecipeGeneration } from '@/hooks/useSpoonacularRecipeGeneration';
import { useOpenAIRecipeGeneration } from '@/hooks/openai/useOpenAIRecipeGeneration';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';

export const useRecipeGenerationServices = (
  handleProgressUpdate: (progress: RecipeGenerationProgress) => void
) => {
  const { toast } = useToast();

  const {
    generateRecipesWithSpoonacular,
    isGenerating: isSpoonacularGenerating,
    isLoading: isSpoonacularLoading,
    generatingMultiple: spoonacularGeneratingMultiple,
    setProgressCallback: setSpoonacularProgressCallback,
  } = useSpoonacularRecipeGeneration();

  const {
    generateRecipeWithOpenAI,
    isGenerating: isOpenAIGenerating,
    generatingMultiple: openAIGeneratingMultiple,
    setProgressCallback: setOpenAIProgressCallback,
  } = useOpenAIRecipeGeneration();

  useEffect(() => {
    if (setSpoonacularProgressCallback) {
      setSpoonacularProgressCallback(handleProgressUpdate);
    }

    if (setOpenAIProgressCallback) {
      setOpenAIProgressCallback(handleProgressUpdate);
    }
  }, [handleProgressUpdate, setSpoonacularProgressCallback, setOpenAIProgressCallback]);

  const generateWithSpoonacularOrFallback = useCallback(
    async (
      inventory: any[],
      addUniqueRecipe: (recipe: Recipe) => boolean,
      cacheMultipleRecipes: (recipes: Recipe[]) => number,
      filterMode: RecipeFilterMode,
      silent: boolean = false,
      existingRecipes: string[] = []
    ) => {
      const ingredientNames = inventory.map(item => item.name);

      try {
        return await generateRecipesWithSpoonacular(
          ingredientNames,
          addUniqueRecipe,
          cacheMultipleRecipes,
          filterMode
        );
      } catch (error) {
        const shouldFallback =
          error &&
          typeof error === 'object' &&
          (error.type === 'api_rate_limit' ||
            error.message?.includes('limit') ||
            error.message?.includes('quota'));

        if (shouldFallback) {
          console.log('Error with Spoonacular, falling back to OpenAI:', error);

          if (!silent) {
            toast({
              title: 'Switching to AI Generation',
              description: 'Using our AI model to create recipes for you instead.',
            });
          }

          try {
            return await generateRecipeWithOpenAI(
              inventory,
              addUniqueRecipe,
              filterMode,
              false,
              existingRecipes
            );
          } catch (openAIError) {
            console.error('Both recipe services failed:', { spoonacularError: error, openAIError });

            if (!silent) {
              toast({
                title: 'Recipe Generation Failed',
                description:
                  "We couldn't generate recipes with either service. Please try again later.",
                variant: 'destructive',
              });
            }

            throw openAIError;
          }
        } else {
          throw error;
        }
      }
    },
    [generateRecipesWithSpoonacular, generateRecipeWithOpenAI, toast]
  );

  const generateWithOpenAI = useCallback(
    async (addUniqueRecipe: (recipe: Recipe) => boolean, existingRecipes: string[] = []) => {
      try {
        return await generateRecipeWithOpenAI(
          [],
          addUniqueRecipe,
          'preference',
          false,
          existingRecipes
        );
      } catch (error) {
        console.error('OpenAI preference-based generation failed:', error);

        toast({
          title: 'AI Recipe Generation Failed',
          description:
            error instanceof Error
              ? error.message
              : "We couldn't generate preference-based recipes. Please try again later.",
          variant: 'destructive',
        });

        throw error;
      }
    },
    [generateRecipeWithOpenAI, toast]
  );

  return {
    isSpoonacularGenerating,
    isSpoonacularLoading,
    isOpenAIGenerating,
    spoonacularGeneratingMultiple,
    openAIGeneratingMultiple,
    generateWithSpoonacularOrFallback,
    generateWithOpenAI,
  };
};
