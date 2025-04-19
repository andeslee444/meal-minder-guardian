import React from 'react';
import { Button } from '@/components/ui/button';
import { Soup, Sparkles, RefreshCw, Settings, AlertCircle, Trash2 } from 'lucide-react';
import RecipeGenerator from '@/components/recipes/RecipeGenerator';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { RecipeGenerationProgress } from '@/types/recipe';
import FilterModeSelector from '@/components/recipes/FilterModeSelector';

interface RecipePageActionsProps {
  showRecipeGenerator: boolean;
  setShowRecipeGenerator: (show: boolean) => void;
  handleGenerateRecipe: () => Promise<void | null>;
  isGenerating: boolean;
  isSpoonacularLoading: boolean;
  generatingMultiple: boolean;
  inventoryLength: number;
  filterMode: RecipeFilterMode;
  setFilterMode: (mode: RecipeFilterMode) => void;
  generationProgress: RecipeGenerationProgress;
  isRefreshing: boolean;
  handleRefreshDatabases: () => Promise<void>;
  apiLimitReached?: boolean;
  hideRefreshButton?: boolean;
}

const RecipePageActions: React.FC<RecipePageActionsProps> = ({
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
  isRefreshing,
  handleRefreshDatabases,
  apiLimitReached = false,
  hideRefreshButton = false,
}) => {
  const handleGenerateClick = async () => {
    if (isGenerating || isSpoonacularLoading) return;
    try {
      await handleGenerateRecipe();
    } catch (error) {
      console.error('Error generating recipes:', error);
    }
  };

  return (
    <div className="mb-4">
      {apiLimitReached && (
        <div className="flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded-md mb-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>Using AI generation (API limit reached)</span>
        </div>
      )}

      {showRecipeGenerator && (
        <div className="mb-4">
          <RecipeGenerator
            filterMode={filterMode}
            removeGenerateButton={true}
            generationProgress={generationProgress}
          />
        </div>
      )}

      {!hideRefreshButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={handleRefreshDatabases}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh DB'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipePageActions;
