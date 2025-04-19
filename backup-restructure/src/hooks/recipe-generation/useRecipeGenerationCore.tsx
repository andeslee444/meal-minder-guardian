import { useCallback, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useRecipeGenerationStatus } from './useRecipeGenerationStatus';
import { useRecipeGeneratorState } from './useRecipeGeneratorState';
import { useRecipeOperations } from './useRecipeOperations';
import { useRecipeBackgroundGeneration } from './useRecipeBackgroundGeneration';
import { useRecipeInventoryValidation } from './useRecipeInventoryValidation';
import { useOpenAIGenerationFunction } from './useOpenAIGenerationFunction';

/**
 * Core hook for recipe generation that composes other specialized hooks
 * This is the main entry point that client code should use
 */
export const useRecipeGenerationCore = () => {
  const { inventory } = useAppContext();
  const { addRecipe, addMultipleRecipes, recipes } = useRecipeContext();

  // Get existing recipe titles for duplication prevention
  const existingRecipeTitles = recipes.map(r => r.title);

  // Get the OpenAI generation function
  const openAIGenerateFunction = useOpenAIGenerationFunction();

  // Recipe generation status management
  const {
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generationError,
    generationProgress,
    updateProgress,
    handleError,
    clearError,
    resetState,
  } = useRecipeGenerationStatus();

  // UI state management
  const {
    isSpoonacularLoading,
    generatingMultiple,
    showRecipeGenerator,
    setShowRecipeGenerator,
    apiLimitReached,
    setApiLimitReached,
  } = useRecipeGeneratorState();

  // Create a wrapper for addRecipe that returns a boolean
  const addRecipeWithBoolean = useCallback(
    (recipe: Recipe): boolean => {
      addRecipe(recipe);
      return true; // Return true to indicate successful addition
    },
    [addRecipe]
  );

  // Create a wrapper for addMultipleRecipes that returns a Recipe
  const addMultipleRecipesWithReturn = useCallback(
    (recipes: Recipe[]): Recipe | null => {
      addMultipleRecipes(recipes);
      return recipes.length > 0 ? recipes[0] : null; // Return the first recipe or null
    },
    [addMultipleRecipes]
  );

  // Core recipe generation operations
  const { generateWithOpenAI, generateWithFallback, setupProgressCallbacks } = useRecipeOperations(
    addRecipeWithBoolean,
    addMultipleRecipesWithReturn,
    existingRecipeTitles,
    updateProgress,
    setIsGenerating
  );

  // Background recipe generation operations
  const { generateBackgroundRecipes } = useRecipeBackgroundGeneration(
    inventory,
    openAIGenerateFunction,
    addRecipeWithBoolean,
    updateProgress,
    existingRecipeTitles,
    setIsGenerating,
    setIsBackgroundGeneration,
    clearError,
    handleError
  );

  // Inventory validation
  const { validateInventoryForGeneration } = useRecipeInventoryValidation();

  // Initialize progress callbacks
  useEffect(() => {
    setupProgressCallbacks();
  }, [setupProgressCallbacks]);

  /**
   * Generate a recipe using our available providers with fallback
   */
  const generateRecipe = useCallback(
    async (filterMode: RecipeFilterMode = 'hybrid') => {
      try {
        setIsGenerating(true);
        clearError();

        // Validate inventory
        if (!validateInventoryForGeneration(inventory, filterMode)) {
          setIsGenerating(false);
          return null;
        }

        return await generateWithFallback(inventory, filterMode);
      } catch (error) {
        console.error('Error in generateRecipe:', error);
        handleError(error as Error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [
      inventory,
      generateWithFallback,
      validateInventoryForGeneration,
      setIsGenerating,
      clearError,
      handleError,
    ]
  );

  return {
    // Generation state
    isGenerating,
    isBackgroundGeneration,
    isSpoonacularLoading,
    generatingMultiple,

    // Generation actions
    generateRecipe,
    generateBackgroundRecipes,
    generateWithOpenAI,

    // UI state
    showRecipeGenerator,
    setShowRecipeGenerator,
    apiLimitReached,
    setApiLimitReached,

    // Status information
    generationProgress,
    generationError,

    // Error handling
    handleError,
    updateProgress,
    resetState,
  };
};
