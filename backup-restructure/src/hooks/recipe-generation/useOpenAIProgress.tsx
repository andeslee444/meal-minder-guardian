/**
 * This hook is deprecated. Use useRecipeGenerationStatus instead.
 * @deprecated
 */

import { useCallback } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';
import { useUserContext } from '@/context/UserContext';

export const useOpenAIProgress = () => {
  const { userProfile } = useUserContext();

  // Sample preferences based on user profile if available
  const samplePreferences =
    userProfile?.diet?.length > 0
      ? userProfile.diet
      : [
          'Quick meals',
          'Family-friendly',
          'Budget-conscious',
          'Minimal ingredients',
          'Meal prep friendly',
        ];

  // Sample dietary considerations, including user allergies if available
  const sampleDietaryInfo = [
    ...(userProfile?.allergies || []),
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

  // Thinking points for the generation process
  const thinkingPoints = [
    'Analyzing available ingredients in your inventory...',
    'Considering your past recipe preferences...',
    'Exploring compatible flavor combinations...',
    'Calculating preparation and cooking times...',
    'Evaluating nutritional balance...',
    'Finding creative ways to use your ingredients...',
  ];

  // Create a progress update with relevant information
  const createProgressUpdate = useCallback(
    (
      current: number,
      total: number,
      isGenerating: boolean,
      statusMessage?: string
    ): RecipeGenerationProgress => {
      const percentage = total > 0 ? (current / total) * 100 : 0;

      // For early stages (analyzing and setup) - 0-30%
      if (percentage < 30) {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints,
          preferences: samplePreferences.slice(0, 2 + Math.floor(percentage / 10)),
          stage: statusMessage || 'Analyzing ingredients and preferences',
          statusMessage,
        };
      }
      // For middle stages (API calling and generation) - 30-60%
      else if (percentage < 60) {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints,
          preferences: samplePreferences,
          dietaryInfo: sampleDietaryInfo.slice(0, Math.floor((percentage - 30) / 6)),
          stage: statusMessage || 'Connecting to OpenAI recipe generator',
          statusMessage,
        };
      }
      // For later stages (processing results) - 60-90%
      else if (percentage < 90) {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints,
          preferences: samplePreferences,
          dietaryInfo: sampleDietaryInfo,
          cuisineStyles: sampleCuisineStyles.slice(0, Math.floor((percentage - 60) / 6)),
          stage: statusMessage || 'Processing recipe details and saving to database',
          statusMessage,
        };
      }
      // For final stages (finalization and display) - 90-100%
      else {
        return {
          isGenerating,
          current,
          total,
          percentage,
          thinkingPoints,
          preferences: samplePreferences,
          dietaryInfo: sampleDietaryInfo,
          cuisineStyles: sampleCuisineStyles,
          stage: statusMessage || 'Finalizing recipes for display',
          statusMessage,
        };
      }
    },
    [samplePreferences, sampleDietaryInfo, sampleCuisineStyles, thinkingPoints]
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

  // Add a specific status message to an existing progress object
  const addStatusMessage = useCallback(
    (progress: RecipeGenerationProgress, message: string): RecipeGenerationProgress => {
      return {
        ...progress,
        statusMessage: message,
      };
    },
    []
  );

  return {
    createProgressUpdate,
    updateStage,
    addStatusMessage,
  };
};
