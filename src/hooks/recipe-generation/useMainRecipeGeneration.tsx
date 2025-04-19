import React, { useCallback, useState, useContext } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status-indicator';
import { useInventoryContext } from '@/context/InventoryContext';
import { RecipeContext } from '@/context/RecipeContext';

export const useMainRecipeGeneration = (
  generateWithOpenAI: (
    filterMode: RecipeFilterMode,
    inventory: any[],
    existingRecipeIds: string[],
    progressCallback: (progress: { current: number; total: number; stage: string }) => void
  ) => Promise<Recipe | null>,
  updateProgress: (current: number, total: number, stage: string) => void,
  setShowRecipeGenerator: (show: boolean) => void,
  setGenerationErrorProp: (error: { message: string; recoverable: boolean } | null) => void
) => {
  const { items: inventory } = useInventoryContext();
  const { recipes } = useContext(RecipeContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [internalGenerationError, setInternalGenerationError] = useState<{
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
        setInternalGenerationError(null);
        setGenerationErrorProp(null);

        // Get existing recipe IDs to avoid duplicates
        const existingRecipeIds = recipes?.map((recipe: Recipe) => recipe.id) || [];

        // Generate the recipe using OpenAI
        const result = await generateWithOpenAI(
          filterMode,
          inventory || [],
          existingRecipeIds,
          progress => {
            updateProgress(progress.current, progress.total, progress.stage);
          }
        );

        if (!result) {
          throw new Error('Failed to generate recipe with OpenAI');
        }

        setShowRecipeGenerator(false);

        return result;
      } catch (error) {
        console.error('Error generating recipe in useMainRecipeGeneration:', error);
        const errorPayload = {
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred during recipe generation',
          recoverable: false,
        };
        setInternalGenerationError(errorPayload);
        setGenerationErrorProp(errorPayload);
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
      setGenerationErrorProp,
      setInternalGenerationError,
    ]
  );

  return {
    generateRecipe,
    isGenerating,
    generationError: internalGenerationError,
  };
};
