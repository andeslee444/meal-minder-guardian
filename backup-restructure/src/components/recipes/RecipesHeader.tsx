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
import { RecipeGenerationProgress } from '@/types/recipe';
import FilterModeSelector from './FilterModeSelector';

export type RecipeFilterMode = 'strict' | 'hybrid' | 'preference';

interface RecipesHeaderProps {
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
}

const RecipesHeader: React.FC<RecipesHeaderProps> = ({
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
  const handleGenerateClick = async () => {
    if (isGenerating || isSpoonacularLoading) return;
    try {
      await handleGenerateRecipe();
    } catch (error) {
      console.error('Error generating recipes:', error);
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

      {/* Recipe Generator Content with progress bar support */}
      {showRecipeGenerator && (
        <div className="bg-card border rounded-lg p-4 shadow-sm mt-4 animate-slide-down">
          <RecipeGenerator
            filterMode={filterMode}
            removeGenerateButton={true}
            generationProgress={generationProgress}
          />
        </div>
      )}
    </div>
  );
};

export default RecipesHeader;
