import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyRecipesProps {
  isGenerating: boolean;
  onGenerateRecipe: () => Promise<void | null>;
  inventoryCount: number;
}

const EmptyRecipes: React.FC<EmptyRecipesProps> = ({
  isGenerating,
  onGenerateRecipe,
  inventoryCount,
}) => {
  const handleGenerateClick = async () => {
    if (isGenerating) return;
    try {
      await onGenerateRecipe();
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="mr-2 h-5 w-5" />
          No Recipes Yet
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-6">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">Let's create some recipes!</h3>
          <p className="text-muted-foreground mb-4">
            {inventoryCount < 3
              ? 'Add at least 3 ingredients to your inventory to generate recipes.'
              : 'Click the button below to generate recipes based on your available ingredients.'}
          </p>

          {inventoryCount >= 3 && (
            <Button size="lg" onClick={handleGenerateClick} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate Recipe</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyRecipes;
