import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIngredientSelection } from '@/hooks/useIngredientSelection';
import IngredientSelector from './IngredientSelector';
import RecipePreferences from './RecipePreferences';
import GeneratedRecipe from './GeneratedRecipe';
import { RecipeFilterMode } from './RecipesHeader';
import { RecipeGenerationProgress, RecipeGenerationError } from '@/types/recipe';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RecipeThinkingVisualizer from './status/RecipeThinkingVisualizer';
import RecipeStatusBar from './status/RecipeStatusBar';

interface RecipeGeneratorProps {
  filterMode?: RecipeFilterMode;
  removeGenerateButton?: boolean;
  generationProgress?: RecipeGenerationProgress;
  generationError?: RecipeGenerationError | null;
  showDetailedProgress?: boolean;
}

const RecipeGenerator = ({
  filterMode = 'hybrid',
  removeGenerateButton = false,
  generationProgress,
  generationError,
  showDetailedProgress = true, // Default to true to always show detailed progress
}: RecipeGeneratorProps) => {
  const { inventory, addRecipe } = useAppContext();
  const { toast } = useToast();
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [mealType, setMealType] = useState<string>('any');
  const [recipeSaved, setRecipeSaved] = useState(false);

  // Default progress as a fallback
  const safeProgress: RecipeGenerationProgress = generationProgress || {
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
  };

  const {
    selectedItems,
    customIngredient,
    setCustomIngredient,
    toggleItemSelection,
    addCustomIngredient,
  } = useIngredientSelection(inventory);

  const toggleDietaryRestriction = (id: string) => {
    setDietaryRestrictions(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all ingredients by default if in strict or hybrid mode
  React.useEffect(() => {
    if (
      filterMode !== 'preference' &&
      selectedItems.length > 0 &&
      selectedItems.every(item => !item.selected)
    ) {
      selectedItems.forEach(item => {
        toggleItemSelection(item.id);
      });
    }
  }, [selectedItems, filterMode, toggleItemSelection]);

  const saveRecipe = () => {
    if (generatedRecipe) {
      addRecipe(generatedRecipe);
      setRecipeSaved(true);
      toast({
        title: 'Recipe Saved',
        description: `"${generatedRecipe.title}" has been saved to your recipes!`,
      });
    }
  };

  const getFilterModeDescription = () => {
    switch (filterMode) {
      case 'strict':
        return 'Using only ingredients available in your inventory.';
      case 'hybrid':
        return 'Prioritizing ingredients from your inventory but may add some common extras.';
      case 'preference':
        return 'Using your preferences to generate recipes, not limited to your inventory.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Recipe Options
            {filterMode === 'strict' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Using Only Available
              </span>
            )}
            {filterMode === 'hybrid' && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Hybrid Mode
              </span>
            )}
            {filterMode === 'preference' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Preference Based
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{getFilterModeDescription()}</AlertDescription>
            </Alert>

            {/* Compact status bar only for errors or background tasks */}
            {!showDetailedProgress && (
              <RecipeStatusBar progress={safeProgress} error={generationError} />
            )}

            {filterMode !== 'preference' && (
              <IngredientSelector
                selectedItems={selectedItems}
                customIngredient={customIngredient}
                setCustomIngredient={setCustomIngredient}
                toggleItemSelection={toggleItemSelection}
                addCustomIngredient={addCustomIngredient}
              />
            )}

            <RecipePreferences
              dietaryRestrictions={dietaryRestrictions}
              toggleDietaryRestriction={toggleDietaryRestriction}
              mealType={mealType}
              setMealType={setMealType}
            />

            {/* Detailed thinking process when generation is active and detailed view is enabled */}
            {showDetailedProgress && safeProgress.isGenerating && (
              <RecipeThinkingVisualizer progress={safeProgress} />
            )}
          </div>
        </CardContent>
      </Card>

      {generatedRecipe && (
        <GeneratedRecipe recipe={generatedRecipe} recipeSaved={recipeSaved} onSave={saveRecipe} />
      )}
    </div>
  );
};

export default RecipeGenerator;
