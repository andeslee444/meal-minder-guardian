import React from 'react';
import { Sparkles, Loader2, Settings, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RecipeGenerator from '@/components/recipes/RecipeGenerator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RecipeFilterMode } from './RecipesHeader';
import FilterModeSelector from './FilterModeSelector';
import DebugGenerationButton from './DebugGenerationButton';

interface RecipeGenerationControlsProps {
  showRecipeGenerator: boolean;
  setShowRecipeGenerator: (show: boolean) => void;
  handleGenerateRecipe: () => Promise<void | null>;
  handleFallbackToOpenAI: () => Promise<void>;
  isGenerating: boolean;
  isSpoonacularLoading: boolean;
  generatingMultiple: boolean;
  inventoryLength: number;
  filterMode: RecipeFilterMode;
  setFilterMode: (mode: RecipeFilterMode) => void;
  generationProgress: any;
  isRefreshing?: boolean;
  handleRefreshDatabases?: () => Promise<void>;
  apiLimitReached?: boolean;
  isBackgroundGeneration?: boolean;
  recipesLength?: number;
  generationError?: any;
  isSwitchingToAI?: boolean;
}

const RecipeGenerationControls: React.FC<RecipeGenerationControlsProps> = ({
  showRecipeGenerator,
  setShowRecipeGenerator,
  handleGenerateRecipe,
  handleFallbackToOpenAI,
  isGenerating,
  isSpoonacularLoading,
  generatingMultiple,
  inventoryLength,
  filterMode,
  setFilterMode,
  generationProgress,
  isRefreshing = false,
  handleRefreshDatabases = () => Promise.resolve(),
  apiLimitReached = false,
  isBackgroundGeneration = false,
  recipesLength = 0,
  generationError = null,
  isSwitchingToAI = false,
}) => {
  const handleGenerateClick = async () => {
    if (isGenerating || isSpoonacularLoading) return;
    try {
      await handleGenerateRecipe();
    } catch (error) {
      console.error('Error generating recipes:', error);
    }
  };

  const handleFallbackClick = async () => {
    if (isGenerating || isSwitchingToAI) return;
    try {
      await handleFallbackToOpenAI();
    } catch (error) {
      console.error('Error switching to OpenAI:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold">Recipe Recommendations</h1>
          <p className="text-muted-foreground text-sm">
            Discover delicious meals based on your available ingredients.
          </p>
        </div>

        {/* Button row directly under the header */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecipeGenerator(!showRecipeGenerator)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>

          <FilterModeSelector mode={filterMode} setMode={setFilterMode} />

          <Button
            size="sm"
            onClick={handleGenerateClick}
            disabled={
              isGenerating ||
              isSpoonacularLoading ||
              (filterMode !== 'preference' && inventoryLength === 0)
            }
          >
            {isGenerating || isSpoonacularLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generatingMultiple ? 'Generating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Recipes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Recipe Generator Content */}
      <Collapsible
        open={showRecipeGenerator}
        onOpenChange={setShowRecipeGenerator}
        className="w-full"
      >
        <CollapsibleContent className="p-4 bg-card border rounded-lg shadow-sm mt-4 animate-slide-down">
          <RecipeGenerator
            filterMode={filterMode}
            removeGenerateButton={true}
            generationProgress={generationProgress}
            generationError={generationError}
          />

          <DebugGenerationButton />

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleFallbackClick}
              disabled={isGenerating || isSwitchingToAI}
            >
              {isSwitchingToAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching to AI...
                </>
              ) : (
                'Force OpenAI Generation'
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RecipeGenerationControls;
