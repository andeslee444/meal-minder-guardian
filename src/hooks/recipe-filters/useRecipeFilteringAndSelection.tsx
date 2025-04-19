import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { useRecipeFiltering } from '@/hooks/useRecipeFiltering';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

export const useRecipeFilteringAndSelection = (recipes: Recipe[], inventory: any[]) => {
  // Create our own search and tab state here instead of getting it from useRecipeFiltering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterMode, setFilterMode] = useState<RecipeFilterMode>('hybrid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Pass our local state to useRecipeFiltering
  const { filteredRecipes, totalFilteredCount } = useRecipeFiltering(
    recipes,
    inventory,
    searchQuery,
    activeTab
  );

  const handleRecipeClick = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setIsDialogOpen(true);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredRecipes,
    totalFilteredCount,
    filterMode,
    setFilterMode,
    isDialogOpen,
    setIsDialogOpen,
    selectedRecipe,
    handleRecipeClick,
  };
};
