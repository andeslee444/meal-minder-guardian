import { useState, useCallback } from 'react';
import { Recipe, RecipeGenerationParams } from '@/types/recipe';
import { SpoonacularGenerationService } from '@/services/generation/SpoonacularGenerationService';
import { OpenAIGenerationService } from '@/services/generation/OpenAIGenerationService';
import { EdgeFunctionGenerationService } from '@/services/generation/EdgeFunctionGenerationService';
import { isApiLimitError, isRecipeAPILimitError } from '@/utils/errorHandling';
import { useToast } from '@/components/ui/use-toast';

// Mock inventory hook until the real one is available
const useInventory = () => {
  return {
    inventory: [
      { id: '1', name: 'Chicken' },
      { id: '2', name: 'Rice' },
      { id: '3', name: 'Carrots' },
      { id: '4', name: 'Onions' },
      { id: '5', name: 'Garlic' },
    ],
  };
};

// Create instances of the generation services
const spoonacularService = new SpoonacularGenerationService();
const openAIService = new OpenAIGenerationService();
const edgeFunctionService = new EdgeFunctionGenerationService();

/**
 * Hook for generating recipes with proper progress tracking and error handling
 */
export function useRecipeOperations() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const { toast } = useToast();

  /**
   * Handle progress updates during recipe generation
   */
  const handleProgressUpdate = useCallback((progress: number) => {
    setProgressPercentage(progress);
  }, []);

  /**
   * Generate recipes using available services, with fallback strategies
   */
  const generateRecipes = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setProgressPercentage(0);

    try {
      // Extract ingredient names from inventory for recipe generation
      const ingredients = useInventory().inventory.map(item => item.name);

      console.log('[Recipe Generation] Using ingredients from inventory:', ingredients);

      // Prepare generation parameters
      const params: RecipeGenerationParams = {
        ingredients,
        meal_type: 'any',
        cuisine_type: 'any',
      };

      // First try Spoonacular API
      try {
        setProgressPercentage(10);
        console.log('[Recipe Generation] Trying Spoonacular API...');

        const result = await spoonacularService.generateRecipe(params, handleProgressUpdate);
        setRecipes(result.recipes);
        setIsGenerating(false);
        setProgressPercentage(100);

        console.log('[Recipe Generation] Successfully generated recipes with Spoonacular');
        toast({
          title: 'Recipes Generated',
          description: `Found ${result.recipes.length} recipes using your ingredients.`,
          variant: 'default',
        });

        return;
      } catch (spoonacularError) {
        console.error('[Recipe Generation] Spoonacular error:', spoonacularError);

        // Check if this is an API limit error
        if (isApiLimitError(spoonacularError)) {
          console.log(
            '[Recipe Generation] Spoonacular API limit reached, falling back to OpenAI...'
          );
          // Toast to inform user
          toast({
            title: 'API Limit Reached',
            description: 'Falling back to AI-generated recipes.',
            variant: 'default',
          });
        }
      }

      // If Spoonacular fails, try OpenAI
      try {
        setProgressPercentage(30);
        console.log('[Recipe Generation] Trying OpenAI generation...');

        const result = await openAIService.generateRecipe(params, handleProgressUpdate);
        setRecipes(result.recipes);
        setIsGenerating(false);
        setProgressPercentage(100);

        console.log('[Recipe Generation] Successfully generated recipes with OpenAI');
        toast({
          title: 'AI Recipes Generated',
          description: `Created ${result.recipes.length} recipes based on your ingredients.`,
          variant: 'default',
        });

        return;
      } catch (openAIError) {
        console.error('[Recipe Generation] OpenAI error:', openAIError);

        // Check if this is an API limit error for OpenAI
        if (isRecipeAPILimitError(openAIError)) {
          console.log(
            '[Recipe Generation] OpenAI API limit reached, falling back to Edge Function...'
          );
          toast({
            title: 'API Limit Reached',
            description: 'Falling back to local recipe generation.',
            variant: 'default',
          });
        }
      }

      // Last resort - use Edge Function with mock data
      setProgressPercentage(60);
      console.log('[Recipe Generation] Using Edge Function as final fallback...');

      const result = await edgeFunctionService.generateRecipe(params, handleProgressUpdate);
      setRecipes(result.recipes);

      toast({
        title: 'Recipes Generated',
        description: `Created ${result.recipes.length} recipes with local generator.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('[Recipe Generation] Final error:', error);
      setError(error instanceof Error ? error : new Error('Failed to generate recipes'));

      toast({
        title: 'Recipe Generation Failed',
        description: 'Could not generate recipes. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgressPercentage(100);
    }
  }, [handleProgressUpdate, toast]);

  return {
    recipes,
    isGenerating,
    error,
    progressPercentage,
    generateRecipes,
  };
}
