import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { useRecipeFilteringAndSelection } from '@/hooks/recipe-filters/useRecipeFilteringAndSelection';
import { useRecipeGenerationState } from '@/hooks/recipe-generation/useRecipeGenerationState';
import { useRecipeGenerationHandlers } from '@/hooks/recipe-generation/useRecipeGenerationHandlers';
import { Recipe } from '@/types/recipe';

export const useRecipePageLogic = () => {
  const { inventory } = useAppContext();
  const { recipes, toggleFavorite } = useRecipeContext();

  // Add state for dialog and selected recipe
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Recipe filtering and selection state
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredRecipes,
    totalFilteredCount,
    filterMode,
    setFilterMode,
  } = useRecipeFilteringAndSelection(recipes, inventory);

  // Recipe generation state
  const {
    showRecipeGenerator,
    setShowRecipeGenerator,
    apiLimitReached,
    generationProgress,
    updateProgress,
  } = useRecipeGenerationState();

  // Recipe generation handlers
  const {
    isGenerating,
    isBackgroundGeneration,
    isSpoonacularLoading,
    generatingMultiple,
    handleGenerateRecipe,
    handleGenerateMoreRecipes,
  } = useRecipeGenerationHandlers(apiLimitReached, filterMode);

  // Add recipe click handler
  const handleRecipeClick = (id: string) => {
    console.log('Recipe clicked:', id);
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsDialogOpen(true);
    }
  };

  return {
    inventory,
    recipes,
    toggleFavorite,
    filterMode,
    setFilterMode,
    apiLimitReached,
    generationProgress,
    isGenerating,
    isBackgroundGeneration,
    isSpoonacularLoading,
    generatingMultiple,
    showRecipeGenerator,
    setShowRecipeGenerator,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredRecipes,
    totalFilteredCount,
    handleGenerateRecipe,
    handleGenerateMoreRecipes,
    // Add the missing properties
    isDialogOpen,
    setIsDialogOpen,
    selectedRecipe,
    handleRecipeClick,
    updateProgress,
  };
};
