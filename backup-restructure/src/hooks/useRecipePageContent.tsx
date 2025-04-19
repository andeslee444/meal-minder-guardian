import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { Recipe } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useRecipeFiltering } from '@/hooks/useRecipeFiltering';
import { useIngredientStatus } from '@/hooks/useIngredientStatus';
import { useRecipeGenerationStatus } from '@/hooks/recipe-generation/useRecipeGenerationStatus';
import { useRecipeGenerator } from '@/hooks/recipe-generation/useRecipeGenerator';

export const useRecipePageContent = (
  isRefreshing: boolean,
  handleRefreshDatabases: () => Promise<void>
) => {
  const { items: inventory } = useInventoryContext();
  const { recipes, toggleFavorite } = useRecipeContext();

  // Use unified status management hook
  const {
    generationProgress,
    isGenerating,
    setIsGenerating,
    isBackgroundGeneration,
    generationError,
    handleError,
    updateProgress,
    clearError,
  } = useRecipeGenerationStatus();

  // Recipe generator with unified status handlers
  const {
    generateRecipe,
    generatingMultiple,
    generateBackgroundRecipes,
    showRecipeGenerator,
    setShowRecipeGenerator,
  } = useRecipeGenerator();

  // For compatibility with existing components expecting isSpoonacularLoading
  const [isSpoonacularLoading, setIsSpoonacularLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterMode, setFilterMode] = useState<RecipeFilterMode>('hybrid');

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { getIngredientStatus } = useIngredientStatus(inventory || []);

  const { filteredRecipes, totalFilteredCount } = useRecipeFiltering(
    recipes || [],
    inventory || [],
    searchQuery,
    activeTab
  );

  const recipesExist = recipes && recipes.length > 0;

  // Show progress indicator during database refresh
  useEffect(() => {
    if (isRefreshing) {
      setIsGenerating(true);
      updateProgress(0, 100, 'Refreshing recipe database...');

      // Use requestAnimationFrame for smoother progress updates
      const startTime = performance.now();
      const duration = 2000; // 2 seconds for the animation

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 90, 90);

        if (progress < 90) {
          updateProgress(Math.floor(progress), 100, 'Refreshing recipe database...');
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      return () => {
        // Complete progress when component unmounts or refresh ends
        updateProgress(100, 100, 'Database refresh complete!');

        // Keep visible for a moment, then reset
        setTimeout(() => {
          setIsGenerating(false);
        }, 1000);
      };
    }
  }, [isRefreshing, updateProgress, setIsGenerating]);

  const handleGenerateRecipe = async () => {
    try {
      clearError();
      updateProgress(0, 100, 'Starting recipe generation...');
      console.log('Starting recipe generation...');
      await generateRecipe(filterMode);
      return Promise.resolve();
    } catch (error) {
      console.error('Error in handleGenerateRecipe:', error);
      handleError(error as Error);
      return Promise.reject(error);
    }
  };

  const handleGenerateMoreRecipes = async () => {
    try {
      clearError();
      updateProgress(0, 100, 'Starting background recipe generation...');
      console.log('Starting background recipe generation...');
      await generateBackgroundRecipes(6, filterMode);
      return Promise.resolve();
    } catch (error) {
      console.error('Error in handleGenerateMoreRecipes:', error);
      handleError(error as Error);
      return Promise.reject(error);
    }
  };

  // Custom wrapper for refresh function to show progress
  const handleRefreshWithProgress = async () => {
    try {
      setIsGenerating(true);
      updateProgress(0, 100, 'Refreshing recipe database...');

      // Use requestAnimationFrame for smoother progress updates
      const startTime = performance.now();
      const duration = 2000; // 2 seconds for the animation

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 90, 90);

        if (progress < 90) {
          updateProgress(Math.floor(progress), 100, 'Refreshing recipe database...');
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      // Call the actual refresh function
      await handleRefreshDatabases();

      // Complete the progress
      updateProgress(100, 100, 'Database refresh complete!');

      // Keep the completion state visible for a moment
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error('Error refreshing databases:', error);
      handleError(error as Error);
    }
  };

  const handleRecipeClick = (id: string) => {
    console.log('Recipe clicked:', id);
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsDialogOpen(true);
    }
  };

  return {
    // App context
    inventory,
    recipes,

    // Recipe state
    filteredRecipes,
    selectedRecipe,
    isDialogOpen,
    recipesExist,

    // UI state
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    showRecipeGenerator,
    setShowRecipeGenerator,

    // Generation state
    isGenerating,
    isSpoonacularLoading,
    isBackgroundGeneration,
    generatingMultiple,
    generationProgress,
    generationError,

    // Filter state
    filterMode,
    setFilterMode,

    // Actions
    toggleFavorite,
    handleGenerateRecipe,
    handleGenerateMoreRecipes,
    handleRefreshWithProgress,
    handleRecipeClick,
    setIsDialogOpen,

    // Utility functions
    getIngredientStatus,
  };
};
