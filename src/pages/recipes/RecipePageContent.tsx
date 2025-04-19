import React from 'react';
import RecipePageWrapper from '@/components/recipes/RecipePageWrapper';
import { useRecipePageContent } from '@/hooks/useRecipePageContent';

interface RecipePageContentProps {
  isRefreshing: boolean;
  handleRefreshRecipes: () => Promise<void>;
}

const RecipePageContent: React.FC<RecipePageContentProps> = ({
  isRefreshing,
  handleRefreshRecipes,
}) => {
  const {
    showRecipeGenerator,
    setShowRecipeGenerator,
    handleGenerateRecipe,
    isGenerating,
    isSpoonacularLoading,
    generatingMultiple,
    inventory,
    filterMode,
    setFilterMode,
    generationProgress,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredRecipes,
    handleRecipeClick,
    toggleFavorite,
    recipesExist,
    handleGenerateMoreRecipes,
    isBackgroundGeneration,
    selectedRecipe,
    setIsDialogOpen,
    isDialogOpen,
    getIngredientStatus,
  } = useRecipePageContent(isRefreshing, handleRefreshRecipes);

  return (
    <div className="space-y-6">
      <RecipePageWrapper
        isRefreshing={isRefreshing}
        handleRefreshRecipes={handleRefreshRecipes}
        showRecipeGenerator={showRecipeGenerator}
        setShowRecipeGenerator={setShowRecipeGenerator}
        handleGenerateRecipe={handleGenerateRecipe}
        isGenerating={isGenerating}
        isSpoonacularLoading={isSpoonacularLoading}
        generatingMultiple={generatingMultiple}
        inventory={inventory}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        generationProgress={generationProgress}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredRecipes={filteredRecipes}
        handleRecipeClick={handleRecipeClick}
        toggleFavorite={toggleFavorite}
        recipesExist={recipesExist}
        handleGenerateMoreRecipes={handleGenerateMoreRecipes}
        isBackgroundGeneration={isBackgroundGeneration}
        selectedRecipe={selectedRecipe}
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
        getIngredientStatus={getIngredientStatus}
      />
    </div>
  );
};

export default RecipePageContent;
