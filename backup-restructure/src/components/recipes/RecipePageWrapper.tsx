import React from 'react';
import { useRecipePageContent } from '@/hooks/useRecipePageContent';
import { Tabs } from '@/components/ui/tabs';
import StatusIndicator from '@/components/ui/status/status-indicator';
import RecipePageHeader from './RecipePageHeader';
import RecipeContent from './RecipeContent';
import RecipeDetailsDialog from './RecipeDetailsDialog';
import BackgroundRecipeGenerator from './BackgroundRecipeGenerator';
import RecipeGenerationStatus from './status/RecipeGenerationStatus';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

interface RecipePageWrapperProps {
  showRecipeGenerator: boolean;
  setShowRecipeGenerator: (show: boolean) => void;
  handleGenerateRecipe: () => Promise<void>;
  isGenerating: boolean;
  isSpoonacularLoading: boolean;
  generatingMultiple: boolean;
  inventory: any[];
  filterMode: RecipeFilterMode;
  setFilterMode: (mode: RecipeFilterMode) => void;
  generationProgress: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRecipes: any[];
  handleRecipeClick: (recipe: any) => void;
  toggleFavorite: (recipeId: string) => void;
  recipesExist: boolean;
  handleGenerateMoreRecipes: () => Promise<void>;
  isBackgroundGeneration: boolean;
  selectedRecipe: any;
  setIsDialogOpen: (open: boolean) => void;
  isDialogOpen: boolean;
  getIngredientStatus: (name: string) => 'available' | 'missing' | 'expired' | 'expiring-soon';
}

const RecipePageWrapper: React.FC<RecipePageWrapperProps> = ({
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
}) => {
  return (
    <div className="space-y-6">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto py-6 sm:py-8">
          <RecipePageHeader
            showRecipeGenerator={showRecipeGenerator}
            setShowRecipeGenerator={setShowRecipeGenerator}
            handleGenerateRecipe={handleGenerateRecipe}
            isGenerating={isGenerating}
            isSpoonacularLoading={isSpoonacularLoading}
            generatingMultiple={generatingMultiple}
            inventoryLength={inventory?.length || 0}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            generationProgress={generationProgress}
          />

          <RecipeGenerationStatus
            progress={generationProgress}
            error={null}
            isGenerating={isGenerating}
            isBackgroundGeneration={isBackgroundGeneration}
          />

          <Tabs value={activeTab} defaultValue="all" className="w-full">
            <RecipeContent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredRecipes={filteredRecipes}
              handleRecipeClick={handleRecipeClick}
              toggleFavorite={toggleFavorite}
              isGenerating={isGenerating}
              onGenerateRecipe={handleGenerateRecipe}
              inventoryLength={inventory?.length || 0}
              recipesExist={recipesExist}
              handleGenerateMoreRecipes={handleGenerateMoreRecipes}
              isBackgroundGeneration={isBackgroundGeneration}
              apiLimitReached={false}
            />
          </Tabs>
        </div>
      </div>

      <RecipeDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedRecipe={selectedRecipe}
        getIngredientStatus={getIngredientStatus}
      />

      <BackgroundRecipeGenerator />

      <StatusIndicator />
    </div>
  );
};

export default RecipePageWrapper;
