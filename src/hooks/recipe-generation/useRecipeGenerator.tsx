import { useState, useCallback, useEffect } from 'react';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { useInventoryContext } from '@/context/InventoryContext';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useRecipeOperations } from './useRecipeOperations';
import { useRecipeGenerationStatus } from './useRecipeGenerationStatus';
import { clearStatusMessages } from '@/components/ui/status';

/**
 * Main hook for recipe generation functionality
 */
export const useRecipeGenerator = () => {
  const { recipes, addRecipe, addMultipleRecipes } = useRecipeContext();
  const { items: inventory } = useInventoryContext();
  const [showRecipeGenerator, setShowRecipeGenerator] = useState(false);

  // Initialize progress state
  const [generationProgress, setGenerationProgress] = useState<RecipeGenerationProgress>({
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
    statusMessage: '',
    stage: '',
  });

  // Use the recipe generation status hook for unified status management
  const {
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    setIsBackgroundGeneration,
    generationError,
    handleError,
    clearError,
    resetState,
  } = useRecipeGenerationStatus();

  // Get existing recipe titles to avoid duplicates
  const getExistingRecipeTitles = useCallback(() => {
    return recipes.map(recipe => recipe.title);
  }, [recipes]);

  // Progress update handler
  const handleProgressUpdate = useCallback((progress: number) => {
    setGenerationProgress(prev => ({
      ...prev,
      percentage: progress,
      current: progress,
      total: 100,
    }));
  }, []);

  // Setup recipe operations with the new API
  const {
    recipes: generatedRecipes,
    isGenerating: isGeneratingRecipes,
    progressPercentage,
    generateRecipes,
  } = useRecipeOperations();

  // Create a wrapper for addMultipleRecipes that returns a Recipe or null
  const addMultipleRecipesWrapper = useCallback(
    (recipes: Recipe[]): Recipe | null => {
      addMultipleRecipes(recipes);
      return recipes.length > 0 ? recipes[0] : null; // Return the first recipe or null
    },
    [addMultipleRecipes]
  );

  // Update our local generation state based on the operations hook
  useEffect(() => {
    if (isGeneratingRecipes !== isGenerating) {
      setIsGenerating(isGeneratingRecipes);
    }
  }, [isGeneratingRecipes, isGenerating, setIsGenerating]);

  // Update recipes when new ones are generated
  useEffect(() => {
    if (generatedRecipes.length > 0) {
      addMultipleRecipes(generatedRecipes);
    }
  }, [generatedRecipes, addMultipleRecipes]);

  // Reset progress when generation stops
  useEffect(() => {
    if (!isGenerating && generationProgress.percentage > 0) {
      // Keep showing progress for a moment after completion
      const timer = setTimeout(() => {
        setGenerationProgress({
          isGenerating: false,
          current: 0,
          total: 0,
          percentage: 0,
          statusMessage: '',
          stage: '',
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationProgress.percentage]);

  // Generate a single recipe
  const generateRecipe = useCallback(
    async (filterMode: RecipeFilterMode = 'hybrid'): Promise<Recipe | null> => {
      const startTime = performance.now();
      console.log(`[RecipeGenerator] Starting recipe generation at ${new Date().toISOString()}`);

      try {
        if (isGenerating) return Promise.resolve(null);

        // Clear any existing messages to prevent message buildup
        clearStatusMessages();
        clearError();

        setIsGenerating(true);
        setIsBackgroundGeneration(false);

        // Get selected inventory items with proper null check
        if (!inventory) {
          console.error('[RecipeGenerator] Inventory is undefined');
          throw new Error('Inventory data is not available. Please try again.');
        }

        const selectedItems = inventory.filter(item => item.quantity > 0);
        console.log('[RecipeGenerator] Selected items:', selectedItems);

        if (filterMode !== 'preference' && selectedItems.length === 0) {
          throw new Error('Please select some ingredients first.');
        }

        // Update progress
        const progressStartTime = performance.now();
        setGenerationProgress({
          isGenerating: true,
          current: 0,
          total: 100,
          percentage: 0,
          statusMessage: 'Starting recipe generation...',
          stage: 'Starting',
        });
        console.log(
          `[RecipeGenerator] Progress update took ${performance.now() - progressStartTime}ms`
        );

        // Generate recipes
        const generationStartTime = performance.now();
        await generateRecipes();

        console.log(
          `[RecipeGenerator] Recipe generation took ${performance.now() - generationStartTime}ms`
        );

        // Return the first recipe if available
        if (generatedRecipes.length > 0) {
          return generatedRecipes[0];
        }

        // Log success
        console.log(`[RecipeGenerator] Total generation time: ${performance.now() - startTime}ms`);
        return null;
      } catch (error) {
        console.error(
          `[RecipeGenerator] Error occurred after ${performance.now() - startTime}ms:`,
          error
        );
        handleError(error as Error);
        return Promise.resolve(null);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      isGenerating,
      inventory,
      generateRecipes,
      generatedRecipes,
      setIsGenerating,
      setIsBackgroundGeneration,
      handleError,
      clearError,
    ]
  );

  // Generate multiple recipes in the background
  const generateBackgroundRecipes = useCallback(
    async (count: number = 6, filterMode: RecipeFilterMode = 'hybrid'): Promise<Recipe | null> => {
      const startTime = performance.now();
      console.log(
        `[RecipeGenerator] Starting background recipe generation at ${new Date().toISOString()}`
      );

      try {
        if (isGenerating) return Promise.resolve(null);

        // Clear any existing messages to prevent message buildup
        clearStatusMessages();
        clearError();

        setIsGenerating(true);
        setIsBackgroundGeneration(true);

        // Get selected inventory items - fixing property access
        const selectedItems = inventory.filter(item => item.quantity > 0);

        if (filterMode !== 'preference' && selectedItems.length === 0) {
          throw new Error('Please select some ingredients first.');
        }

        // Update progress
        const progressStartTime = performance.now();
        setGenerationProgress({
          isGenerating: true,
          current: 0,
          total: 100,
          percentage: 0,
          statusMessage: 'Starting background recipe generation...',
          stage: 'Starting',
        });
        console.log(
          `[RecipeGenerator] Progress update took ${performance.now() - progressStartTime}ms`
        );

        // Generate recipes
        const generationStartTime = performance.now();
        await generateRecipes();

        console.log(
          `[RecipeGenerator] Recipe generation took ${performance.now() - generationStartTime}ms`
        );

        // Return the first recipe if available
        if (generatedRecipes.length > 0) {
          return generatedRecipes[0];
        }

        // Log success
        console.log(
          `[RecipeGenerator] Total background generation time: ${performance.now() - startTime}ms`
        );
        return null;
      } catch (error) {
        console.error('Error generating background recipes:', error);
        handleError(error as Error);
        return Promise.resolve(null);
      }
    },
    [
      isGenerating,
      inventory,
      generateRecipes,
      generatedRecipes,
      setIsGenerating,
      setIsBackgroundGeneration,
      handleError,
      clearError,
    ]
  );

  // Create a convenience function to toggle recipe generator visibility
  const toggleRecipeGenerator = useCallback(() => {
    setShowRecipeGenerator(prev => !prev);
  }, []);

  // Set a recipe generation stage
  const setGenerationStage = useCallback((stage: string, message?: string) => {
    setGenerationProgress(prev => ({
      ...prev,
      stage: stage,
      statusMessage: message || prev.statusMessage,
    }));
  }, []);

  // Reset the entire state
  const reset = useCallback(() => {
    resetState();
    setGenerationProgress({
      isGenerating: false,
      current: 0,
      total: 0,
      percentage: 0,
      statusMessage: '',
      stage: '',
    });
    setShowRecipeGenerator(false);
  }, [resetState]);

  return {
    // Generation state
    isGenerating,
    isBackgroundGeneration,
    generationProgress,
    generationError,
    showRecipeGenerator,
    generatedRecipes,

    // Actions
    generateRecipe,
    generateBackgroundRecipes,
    toggleRecipeGenerator,
    setShowRecipeGenerator,
    setGenerationStage,
    handleProgressUpdate,
    handleError,
    clearError,
    reset,
  };
};
