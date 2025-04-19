/**
 * This hook is deprecated. Use useRecipeGenerationStatus instead.
 * @deprecated
 */
import { useCallback } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

export const useOpenAIProgress = () => {
  // Sample preferences to show during recipe generation
  const samplePreferences = [
    'Quick meals',
    'Family-friendly',
    'Budget-conscious',
    'Minimal ingredients',
    'Meal prep friendly',
  ];

  // Sample dietary considerations
  const sampleDietaryInfo = [
    'Balanced nutrition',
    'Protein-rich',
    'Vegetable-forward',
    'Diverse macronutrients',
    'Portion control',
  ];

  // Sample cuisine styles
  const sampleCuisineStyles = [
    'Italian',
    'Mediterranean',
    'Asian fusion',
    'Latin American',
    'Comfort food',
  ];

  // Create a progress update with relevant information
  const createProgressUpdate = useCallback(
    (current: number, total: number, isGenerating: boolean): RecipeGenerationProgress => {
      const percentage = total > 0 ? (current / total) * 100 : 0;

      // For early stages, show thinking points and preferences
      if (percentage < 40) {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints: [
            'Analyzing available ingredients in your inventory...',
            'Considering your past recipe preferences...',
            'Exploring compatible flavor combinations...',
            'Calculating preparation and cooking times...',
            'Evaluating nutritional balance...',
            'Finding creative ways to use your ingredients...',
          ],
          preferences: samplePreferences.slice(0, 3 + Math.floor(percentage / 10)),
        };
      }
      // For middle stages, add dietary info
      else if (percentage < 70) {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints: [
            'Analyzing available ingredients in your inventory...',
            'Considering your past recipe preferences...',
            'Exploring compatible flavor combinations...',
            'Calculating preparation and cooking times...',
            'Evaluating nutritional balance...',
            'Finding creative ways to use your ingredients...',
          ],
          preferences: samplePreferences,
          dietaryInfo: sampleDietaryInfo.slice(0, Math.floor((percentage - 40) / 6)),
          stage: 'Creating recipe plans',
        };
      }
      // For final stages, add cuisine styles
      else {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints: [
            'Analyzing available ingredients in your inventory...',
            'Considering your past recipe preferences...',
            'Exploring compatible flavor combinations...',
            'Calculating preparation and cooking times...',
            'Evaluating nutritional balance...',
            'Finding creative ways to use your ingredients...',
          ],
          preferences: samplePreferences,
          dietaryInfo: sampleDietaryInfo,
          cuisineStyles: sampleCuisineStyles.slice(0, Math.floor((percentage - 70) / 6)),
          stage:
            percentage >= 95 ? 'Finalizing multiple recipe options' : 'Generating recipe details',
        };
      }
    },
    []
  );

  // Add specific stage information to an existing progress object
  const updateStage = useCallback(
    (progress: RecipeGenerationProgress, stage: string): RecipeGenerationProgress => {
      return {
        ...progress,
        stage,
      };
    },
    []
  );

  return {
    createProgressUpdate,
    updateStage,
  };
};
