import { useMemo, useState } from 'react';
import { Recipe } from '@/context/RecipeContext';
import { InventoryItem } from '@/types/inventory';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

/**
 * Hook to handle recipe filtering based on search query, active tab, and filter mode
 * Provides defensive programming to prevent undefined/null errors
 */
export function useRecipeFiltering(
  recipes: Recipe[],
  inventory: InventoryItem[],
  searchQuery: string = '',
  activeTab: string = 'all'
) {
  // State for recipe filtering mode
  const [filterMode, setFilterMode] = useState<RecipeFilterMode>('hybrid');

  // Filter recipes based on search query and active tab
  const filteredRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];

    return recipes.filter(recipe => {
      if (!recipe) return false;

      // Filter by search query - add null checks to prevent errors
      const recipeTitle = recipe.title || '';
      const recipeTags = recipe.tags || [];

      const matchesSearch =
        !searchQuery ||
        recipeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipeTags.some(tag => tag && tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter by active tab
      if (activeTab === 'all') return true;

      if (activeTab === 'favorites') {
        return !!recipe.isFavorite;
      }

      // Simple inventory-based filtering for "available" tab
      if (activeTab === 'available' && inventory && inventory.length > 0) {
        const availableIngredients = new Set(
          inventory.filter(item => item && item.name).map(item => item.name.toLowerCase())
        );

        // Safely handle potentially undefined ingredients
        const recipeIngredients = recipe.ingredients || [];
        const recipeRequiresIngredients = recipeIngredients
          .filter(ing => ing && ing.name)
          .map(ing => ing.name.toLowerCase());

        // If no ingredients, don't filter out
        if (recipeRequiresIngredients.length === 0) return true;

        // Check if at least 70% of the ingredients are available
        const availableCount = recipeRequiresIngredients.filter(ing =>
          availableIngredients.has(ing)
        ).length;

        return availableCount / recipeRequiresIngredients.length >= 0.7;
      }

      // Filter by specific dietary needs
      if (activeTab === 'quick') {
        const prepTime = recipe.prepTime || 0;
        const cookTime = recipe.cookTime || 0;
        return prepTime + cookTime <= 30;
      }

      return false;
    });
  }, [recipes, searchQuery, activeTab, inventory]);

  // Calculate total filtered count
  const totalFilteredCount = filteredRecipes.length;

  return {
    filteredRecipes,
    totalFilteredCount,
    filterMode,
    setFilterMode,
  };
}
