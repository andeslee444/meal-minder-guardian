import React from 'react';
import { Button } from '@/components/ui/button';
import { useRecipeGenerator } from '@/hooks/recipe-generation/useRecipeGenerator';
import { useAppContext } from '@/context/AppContext';
import { useRecipeGenerationCore } from '@/hooks/recipe-generation/useRecipeGenerationCore';

export const DebugGenerationButton = () => {
  const { inventory } = useAppContext();
  const { generateRecipe, isGenerating } = useRecipeGenerator();

  // Use the core hook for direct access to OpenAI generation
  const { generateWithOpenAI } = useRecipeGenerationCore();

  const handleDebugWithSpoonacular = async () => {
    console.log('DEBUG: Attempting to generate with Spoonacular + OpenAI fallback');
    try {
      await generateRecipe('hybrid');
    } catch (error) {
      console.error('DEBUG: Error with Spoonacular generation:', error);
    }
  };

  const handleDebugWithOpenAI = async () => {
    console.log('DEBUG: Attempting to directly generate with OpenAI');
    try {
      // Use the direct OpenAI generation method
      if (generateWithOpenAI) {
        await generateWithOpenAI('hybrid', inventory);
      } else {
        console.error('DEBUG: OpenAI generation function not available');
      }
    } catch (error) {
      console.error('DEBUG: Error with OpenAI generation:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-4 border p-4 rounded">
      <h3 className="font-semibold text-sm">Debug Recipe Generation</h3>
      <div className="text-xs text-muted-foreground">
        <p>Inventory items: {inventory?.length || 0}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDebugWithSpoonacular}
          disabled={isGenerating}
        >
          Test Spoonacular
        </Button>
        <Button variant="outline" size="sm" onClick={handleDebugWithOpenAI} disabled={isGenerating}>
          Test OpenAI
        </Button>
      </div>
    </div>
  );
};

export default DebugGenerationButton;
