import React from 'react';
import { Button } from '@/components/ui/button';
import { Soup, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmptyRecipeStateProps {
  inventoryLength: number;
  isGenerating: boolean;
  generationInProgress: boolean;
  onGenerateRecipe: () => void;
  apiLimitReached?: boolean;
  error?: Error;
}

const EmptyRecipeState: React.FC<EmptyRecipeStateProps> = ({
  inventoryLength,
  isGenerating,
  generationInProgress,
  onGenerateRecipe,
  apiLimitReached = false,
  error,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      {isGenerating || generationInProgress ? (
        <div className="space-y-4 w-full max-w-md">
          <div className="flex justify-center">
            <Soup className="h-12 w-12 text-gray-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-center">Generating recipes...</h3>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we create personalized recipes for you
          </p>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 max-w-md">
          <Soup className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium">No recipes available</h3>
          <p className="text-sm text-muted-foreground">
            {inventoryLength === 0
              ? 'Add some ingredients to your inventory to generate recipes.'
              : 'Generate recipes based on your ingredients.'}
          </p>

          {apiLimitReached && (
            <div className="flex items-center justify-center text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Spoonacular API limit reached. Using AI generation.</span>
            </div>
          )}

          <Button onClick={onGenerateRecipe} disabled={inventoryLength === 0} className="mx-auto">
            <Soup className="h-4 w-4 mr-2" />
            Generate Recipe
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyRecipeState;
