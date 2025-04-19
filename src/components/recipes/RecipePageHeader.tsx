import React from 'react';
import RecipesHeader, { RecipeFilterMode } from './RecipesHeader';
import RecipeStatusBar from './status/RecipeStatusBar';

interface RecipeGenerationProgress {
  isGenerating: boolean;
  current: number;
  total: number;
  percentage: number;
}

interface RecipePageHeaderProps {
  showRecipeGenerator: boolean;
  setShowRecipeGenerator: (show: boolean) => void;
  handleGenerateRecipe: () => Promise<void>;
  isGenerating: boolean;
  isSpoonacularLoading: boolean;
  generatingMultiple: boolean;
  inventoryLength: number;
  filterMode: RecipeFilterMode;
  setFilterMode: (mode: RecipeFilterMode) => void;
  generationProgress: RecipeGenerationProgress;
}

const RecipePageHeader: React.FC<RecipePageHeaderProps> = ({
  showRecipeGenerator,
  setShowRecipeGenerator,
  handleGenerateRecipe,
  isGenerating,
  isSpoonacularLoading,
  generatingMultiple,
  inventoryLength,
  filterMode,
  setFilterMode,
  generationProgress,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recipes</h1>
      </div>

      <div className="flex flex-col gap-4">
        <RecipesHeader
          showRecipeGenerator={showRecipeGenerator}
          setShowRecipeGenerator={setShowRecipeGenerator}
          handleGenerateRecipe={handleGenerateRecipe}
          isGenerating={isGenerating}
          isSpoonacularLoading={isSpoonacularLoading}
          generatingMultiple={generatingMultiple}
          inventoryLength={inventoryLength}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          generationProgress={generationProgress}
        />
      </div>
    </div>
  );
};

export default RecipePageHeader;
