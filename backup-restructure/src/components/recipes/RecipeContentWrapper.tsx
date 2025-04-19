import React from 'react';
import { Recipe } from '@/types/recipe';
import RecipeFilters from './RecipeFilters';
import RecipeGrid from './RecipeGrid';
import RecipeLoadMoreButton from './RecipeLoadMoreButton';
import EmptyRecipes from './EmptyRecipes';

/**
 * Props for the RecipeContentWrapper component
 */
interface RecipeContentWrapperProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRecipes: Recipe[];
  handleRecipeClick: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleGenerateMoreRecipes: () => Promise<void>;
  isGenerating: boolean;
  isBackgroundGeneration: boolean;
  inventoryLength: number;
  onGenerateRecipe: () => Promise<void>;
  apiLimitReached: boolean;
  recipesExist: boolean;
}

/**
 * Wraps and coordinates the recipe content display
 * This component manages recipe filtering, grid display, and empty states
 */
const RecipeContentWrapper: React.FC<RecipeContentWrapperProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredRecipes,
  handleRecipeClick,
  toggleFavorite,
  handleGenerateMoreRecipes,
  isGenerating,
  isBackgroundGeneration,
  inventoryLength,
  onGenerateRecipe,
  apiLimitReached,
  recipesExist,
}) => {
  // Early return for loading state
  if (isGenerating && !isBackgroundGeneration && !recipesExist) {
    return (
      <div className="py-10 text-center">
        <div className="animate-pulse">
          <p className="text-lg text-muted-foreground">Generating recipe recommendations...</p>
        </div>
      </div>
    );
  }

  // Return empty state if no recipes exist
  if (!recipesExist) {
    return (
      <div className="mt-4">
        <EmptyRecipes
          isGenerating={isGenerating}
          onGenerateRecipe={onGenerateRecipe}
          inventoryCount={inventoryLength}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Recipe filtering controls */}
      <RecipeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Display filtered recipes */}
      {filteredRecipes.length > 0 ? (
        <div>
          <RecipeGrid
            recipes={filteredRecipes}
            onClick={handleRecipeClick}
            onFavoriteToggle={toggleFavorite}
          />

          {/* Show "Generate More" button if recipes exist */}
          <RecipeLoadMoreButton
            isGenerating={isGenerating}
            isBackgroundGeneration={isBackgroundGeneration}
            apiLimitReached={apiLimitReached}
            handleGenerateMoreRecipes={handleGenerateMoreRecipes}
            filteredRecipes={filteredRecipes}
          />
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed rounded-md">
          <p className="text-muted-foreground">No recipes match your current filters.</p>
          <button
            onClick={() => setActiveTab('all')}
            className="mt-2 text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeContentWrapper;
