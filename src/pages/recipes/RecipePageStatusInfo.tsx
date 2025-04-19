/**
 * This component is deprecated. Use RecipeStatusBar component instead.
 * @deprecated
 */
import React from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';
import RecipeStatusBar from '@/components/recipes/status/RecipeStatusBar';

interface RecipePageStatusInfoProps {
  isGenerating: boolean;
  isBackgroundGeneration: boolean;
  generationProgress: RecipeGenerationProgress;
  inventoryLength: number;
  recipesLength: number;
  apiLimitReached?: boolean;
  connectionError?: boolean;
}

const RecipePageStatusInfo: React.FC<RecipePageStatusInfoProps> = props => {
  // Don't show anything if everything is working normally and we have data
  if (
    !props.isGenerating &&
    !props.isBackgroundGeneration &&
    !props.apiLimitReached &&
    !props.connectionError &&
    props.inventoryLength > 0 &&
    props.recipesLength > 0
  ) {
    return null;
  }

  return (
    <div className="mt-4">
      <RecipeStatusBar progress={props.generationProgress} showWhenComplete={false} />
    </div>
  );
};

export default RecipePageStatusInfo;
