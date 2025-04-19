import React from 'react';
import { RecipeGenerationProgress, RecipeGenerationError } from '@/types/recipe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import RecipeThinkingVisualizer from './RecipeThinkingVisualizer';
import RecipeStatusBar from './RecipeStatusBar';

interface RecipeGenerationStatusProps {
  progress?: RecipeGenerationProgress | null;
  error?: RecipeGenerationError | null;
  isGenerating: boolean;
  isBackgroundGeneration: boolean;
}

/**
 * A unified component for displaying recipe generation status
 * Handles both detailed progress visualization and compact status bars
 */
const RecipeGenerationStatus: React.FC<RecipeGenerationStatusProps> = ({
  progress,
  error,
  isGenerating,
  isBackgroundGeneration,
}) => {
  // Safe default progress object
  const safeProgress: RecipeGenerationProgress = progress || {
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
  };

  // For debugging
  React.useEffect(() => {
    console.log('RecipeGenerationStatus rendering with:', {
      isGenerating,
      isBackgroundGeneration,
      progressData: safeProgress,
      hasError: !!error,
      percentage: safeProgress.percentage,
    });
  }, [isGenerating, isBackgroundGeneration, safeProgress, error]);

  // Always render the component during generation, just control what's shown
  if (isGenerating && !isBackgroundGeneration) {
    return (
      <div className="my-6 animate-fade-in">
        <RecipeThinkingVisualizer progress={safeProgress} />
      </div>
    );
  }

  // Show status bar for background operations
  if (isBackgroundGeneration) {
    return (
      <div className="my-4 animate-fade-in">
        <RecipeStatusBar
          progress={safeProgress}
          error={error}
          className="bg-blue-50 border-blue-200"
        />
      </div>
    );
  }

  // Show error bar if there's an error but we're not showing detailed progress
  if (error) {
    return (
      <div className="my-4 animate-fade-in">
        <RecipeStatusBar error={error} />
      </div>
    );
  }

  // If nothing else matched but we're generating, show the progress
  if (isGenerating) {
    return (
      <div className="my-4 animate-fade-in">
        <RecipeStatusBar progress={safeProgress} />
      </div>
    );
  }

  // If not generating and no errors, don't render anything
  return null;
};

export default RecipeGenerationStatus;
