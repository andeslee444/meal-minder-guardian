import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import OpenAI from 'openai';

interface DirectRecipeGenerationProps {
  onProgressUpdate?: (progress: any) => void;
}

export const useDirectRecipeGeneration = ({ onProgressUpdate }: DirectRecipeGenerationProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);

  // Initialize OpenAI client directly
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true, // Allow client-side usage
  });

  const generateRecipes = useCallback(
    async (
      ingredients: string[],
      filterMode: string,
      partialRecipe: boolean,
      existingRecipeTitles: string[] = []
    ) => {
      try {
        setIsGenerating(true);
        setGeneratingMultiple(true);

        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          throw new Error('OpenAI API key is missing. Please add it to your .env.local file.');
        }

        console.log('Starting direct OpenAI recipe generation');
        console.log('Ingredients:', ingredients);

        // Update progress to show starting
        if (onProgressUpdate) {
          onProgressUpdate({
            isGenerating: true,
            current: 0,
            total: 100,
            percentage: 0,
            statusMessage: 'Starting recipe generation with OpenAI...',
            stage: 'Starting',
          });
        }

        // Set up progress simulation
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(progressInterval);
            progress = 95;
          }

          if (onProgressUpdate) {
            onProgressUpdate({
              isGenerating: true,
              current: progress,
              total: 100,
              percentage: progress,
              statusMessage: 'Generating recipes...',
              stage: 'Generating',
            });
          }
        }, 500);

        // Build prompt for OpenAI
        const content = `Generate 6 unique and creative recipes using exclusively these ingredients: ${ingredients.join(', ')}. 
      
For each recipe, include:
1. A creative title
2. A short description (max 100 characters)
3. Preparation time in minutes
4. Cooking time in minutes
5. A list of ingredients with quantities 
6. Step-by-step instructions
7. Nutritional information summary

Please format each recipe as a proper JSON object with these fields:
{
  "title": "Recipe Title",
  "description": "Short description",
  "prepTime": 15,
  "cookTime": 30,
  "ingredients": [
    {"name": "Ingredient 1", "quantity": "1 cup"},
    {"name": "Ingredient 2", "quantity": "2 tbsp"}
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "nutrition": {
    "calories": 350,
    "protein": "15g",
    "carbs": "30g",
    "fat": "10g"
  }
}

Return an array of 6 recipe objects in a valid JSON format that can be parsed.
Keep each recipe diverse and different from the others.
`;

        // Call OpenAI directly
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional chef assistant that creates delicious, creative recipes based on available ingredients. You always return well-formatted, valid JSON.',
            },
            {
              role: 'user',
              content,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        });

        // Clear progress interval
        clearInterval(progressInterval);

        // Parse the response
        const result = response.choices[0]?.message?.content || '';
        let recipes = [];

        try {
          const parsed = JSON.parse(result);
          recipes = parsed.recipes || parsed;

          if (!Array.isArray(recipes)) {
            // Try to extract recipes array if it's nested
            const keys = Object.keys(parsed);
            for (const key of keys) {
              if (Array.isArray(parsed[key])) {
                recipes = parsed[key];
                break;
              }
            }
          }

          // If still not an array, wrap in array
          if (!Array.isArray(recipes)) {
            recipes = [parsed];
          }
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          console.log('Raw response:', result);
          throw new Error('Failed to parse recipe data from OpenAI');
        }

        // Update progress to complete
        if (onProgressUpdate) {
          onProgressUpdate({
            isGenerating: false,
            current: 100,
            total: 100,
            percentage: 100,
            statusMessage: 'Recipe generation complete!',
            stage: 'Complete',
          });
        }

        return {
          recipes,
          generatedAt: new Date().toISOString(),
          source: 'openai-direct',
        };
      } catch (error) {
        console.error('Error in direct recipe generation:', error);

        // Show toast with error
        toast({
          title: 'Recipe Generation Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });

        // Update progress to show error
        if (onProgressUpdate) {
          onProgressUpdate({
            isGenerating: false,
            current: 0,
            total: 100,
            percentage: 0,
            statusMessage: '',
            stage: '',
          });
        }

        throw error;
      } finally {
        setIsGenerating(false);
        setGeneratingMultiple(false);
      }
    },
    [openai, onProgressUpdate, toast]
  );

  return {
    generateRecipes,
    isGenerating,
    generatingMultiple,
  };
};
