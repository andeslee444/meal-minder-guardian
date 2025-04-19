import { useCallback, useState } from 'react';
import { Recipe, RecipeGenerationError } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';

export const useMainRecipeGeneration = (
  generateWithOpenAI: (
    filterMode: RecipeFilterMode,
    inventory: any[],
    existingRecipeIds: string[],
    progressCallback: (progress: { current: number; total: number; stage: string }) => void
  ) => Promise<Recipe | null>,
  updateProgress: (current: number, total: number, stage: string) => void,
  setShowRecipeGenerator: (show: boolean) => void,
  setGenerationError: (error: { message: string; recoverable: boolean } | null) => void
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<{
    message: string;
    recoverable: boolean;
  } | null>(null);

  // Main function to generate a recipe
  const generateRecipe = useCallback(
    async (filterMode: RecipeFilterMode): Promise<Recipe | null> => {
      // Validate inventory early
      if (filterMode !== 'preference' && (!inventory || inventory.length === 0)) {
        addStatusMessage(
          'error',
          'Please add some ingredients to your inventory before generating recipes.',
          'Recipe Generator'
        );
        return null;
      }

      try {
        setIsGenerating(true);
        setGenerationError(null);

        // Get existing recipe IDs to avoid duplicates
        const existingRecipeIds = recipes.map(recipe => recipe.id);

        // Generate the recipe using OpenAI
        const result = await generateWithOpenAI(
          filterMode,
          inventory,
          existingRecipeIds,
          progress => {
            updateProgress(progress.current, progress.total, progress.stage);
          }
        );

        if (!result) {
          throw new Error('Failed to generate recipe');
        }

        // If the recipe was generated successfully, hide the generator
        if (result) {
          setShowRecipeGenerator(false);
        }

        return result;
      } catch (error) {
        console.error('Error generating recipe:', error);
        setGenerationError({
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          recoverable: false,
        });
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [
      generateWithOpenAI,
      inventory,
      recipes,
      updateProgress,
      setShowRecipeGenerator,
      setGenerationError,
    ]
  );

  return {
    generateRecipe,
  };
};
