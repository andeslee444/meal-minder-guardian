import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSpoonacular } from '@/hooks/useSpoonacular';
import { formatSpoonacularRecipe } from '@/utils/recipeFormatters';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { handleRecipeAPIError } from '@/utils/errorHandling';
import { addStatusMessage } from '@/components/ui/status-indicator';

export const useSpoonacularRecipeGeneration = () => {
  const { toast } = useToast();
  const { getRecipesByIngredients, getRecipeInformation, isLoading } = useSpoonacular();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const [progressCallback, setProgressCallback] = useState<
    ((progress: RecipeGenerationProgress) => void) | null
  >(null);

  // Track success and failure messages to avoid duplicates
  const [lastSuccessMessage, setLastSuccessMessage] = useState<string | null>(null);

  const generateRecipes = async (
    ingredientNames: string[],
    addRecipe: (recipe: Recipe) => boolean,
    cacheMultipleRecipes: (recipes: Recipe[]) => number,
    filterMode: RecipeFilterMode = 'hybrid',
    partialRecipe: boolean = false
  ): Promise<Recipe | null> => {
    if (ingredientNames.length === 0) {
      const errorMsg =
        'No ingredients available. Please add some ingredients to your inventory first.';
      addStatusMessage('error', errorMsg, 'Recipe Generator');
      throw new Error(errorMsg);
    }

    try {
      setIsGenerating(true);

      const shouldGenerateMultiple = ingredientNames.length > 2;
      const recipeCount = shouldGenerateMultiple ? 6 : 1;

      const updateProgress = (current: number, total: number) => {
        const percentage = (current / total) * 100;
        const progress: RecipeGenerationProgress = {
          isGenerating: true,
          current,
          total,
          percentage,
        };

        if (progressCallback) {
          progressCallback(progress);
        }
      };

      updateProgress(0, recipeCount);

      if (shouldGenerateMultiple) {
        setGeneratingMultiple(true);

        const spoonacularRecipes = await getRecipesByIngredients(ingredientNames, recipeCount);

        if (!spoonacularRecipes || spoonacularRecipes.length === 0) {
          throw new Error('No recipes found for your ingredients.');
        }

        const recipePromises = spoonacularRecipes.map(async (recipe, index) => {
          try {
            updateProgress(index, recipeCount);

            const recipeDetails = await getRecipeInformation(recipe.id);
            if (!recipeDetails) return null;

            const formattedRecipe = formatSpoonacularRecipe(recipeDetails);

            updateProgress(index + 1, recipeCount);

            return formattedRecipe;
          } catch (error) {
            console.error('Error processing recipe:', error);
            return null;
          }
        });

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter(Boolean) as Recipe[];

        if (validRecipes.length === 0) {
          throw new Error('No valid recipes could be created from your ingredients.');
        }

        const addedCount = cacheMultipleRecipes(validRecipes);

        updateProgress(recipeCount, recipeCount);

        // Show success message only if this is a new message
        const successMsg = `${addedCount} new recipes have been created and saved!`;
        if (!progressCallback && validRecipes.length > 0 && lastSuccessMessage !== successMsg) {
          addStatusMessage('success', successMsg, 'Recipe Generator');
          setLastSuccessMessage(successMsg);
        }

        return validRecipes.length > 0 ? validRecipes[0] : null;
      } else {
        updateProgress(0, 1);

        const spoonacularRecipes = await getRecipesByIngredients(ingredientNames, 5);
        if (!spoonacularRecipes || spoonacularRecipes.length === 0) {
          throw new Error('No recipes found for your ingredients.');
        }

        const randomIndex = Math.floor(Math.random() * spoonacularRecipes.length);
        const selectedSpoonacularRecipe = spoonacularRecipes[randomIndex];

        updateProgress(0.5, 1);

        const recipeDetails = await getRecipeInformation(selectedSpoonacularRecipe.id);

        if (!recipeDetails) {
          throw new Error('Failed to get recipe details.');
        }

        const formattedRecipe = formatSpoonacularRecipe(recipeDetails);

        updateProgress(1, 1);

        const wasAdded = addRecipe(formattedRecipe);

        if (!progressCallback) {
          const statusMsg = wasAdded
            ? `"${formattedRecipe.title}" has been created and saved to your recipes!`
            : `"${formattedRecipe.title}" is already in your recipes. Try again for a different recipe.`;

          // Only show if this is a new message
          if (lastSuccessMessage !== statusMsg) {
            addStatusMessage(wasAdded ? 'success' : 'info', statusMsg, 'Recipe Generator');
            setLastSuccessMessage(statusMsg);
          }
        }

        return formattedRecipe;
      }
    } catch (error) {
      console.error('Error generating recipes with Spoonacular:', error);

      // Format the error as an API limit exceeded error if it contains "limit" or "quota"
      // or if it's a 402 status code (payment required)
      const isAPILimitError =
        (error instanceof Error &&
          (error.message.includes('limit') ||
            error.message.includes('quota') ||
            error.message.includes('402'))) ||
        (error && typeof error === 'object' && (error.status === 402 || error.code === 402));

      if (isAPILimitError) {
        console.log('Detected Spoonacular API limit error');
        const quotaError = {
          status: 'failure',
          code: 402,
          message:
            'Your daily points limit of 150 has been reached. Please upgrade your plan to continue using the API.',
          type: 'api_rate_limit',
          source: 'spoonacular',
          recoverable: true,
          retryable: false,
        };
        throw quotaError;
      }

      handleRecipeAPIError(error, false, 'spoonacular');
      throw error;
    } finally {
      if (progressCallback) {
        progressCallback({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
        });
      }

      setIsGenerating(false);
      setGeneratingMultiple(false);
    }
  };

  return {
    isGenerating,
    isLoading,
    generatingMultiple,
    generateRecipesWithSpoonacular: generateRecipes,
    setProgressCallback,
  };
};
