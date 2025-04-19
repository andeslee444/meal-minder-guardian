import React, { useState, useEffect } from 'react';
import { RecipeGenerationProgress, RecipeGenerationError } from '@/types/recipe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeStatusBarProps {
  progress?: RecipeGenerationProgress | null;
  error?: RecipeGenerationError | null;
  showWhenComplete?: boolean;
  className?: string;
}

/**
 * Component that shows a compact status indicator for recipe generation
 * Used for background tasks and error states
 */
const RecipeStatusBar: React.FC<RecipeStatusBarProps> = ({
  progress,
  error,
  showWhenComplete = false,
  className,
}) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  // Ensure we have a valid progress object
  const safeProgress = progress || {
    isGenerating: false,
    current: 0,
    total: 0,
    percentage: 0,
  };

  // For debugging
  React.useEffect(() => {
    if (progress) {
      console.log('RecipeStatusBar rendering with progress:', {
        isGenerating: progress.isGenerating,
        percentage: progress.percentage,
        current: progress.current,
        total: progress.total,
        message: progress.statusMessage,
        stage: progress.stage || progress.statusMessage,
      });
    }
  }, [progress]);

  // Add fade-out effect when progress reaches 100%
  useEffect(() => {
    if (safeProgress.percentage === 100 && !safeProgress.isGenerating) {
      // Start fade out animation after 1.5 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 1500);

      // Hide component after fade out animation (300ms)
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 1800);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else if (safeProgress.isGenerating || safeProgress.percentage > 0 || error) {
      // Reset visibility when new progress starts or there's an error
      setFadeOut(false);
      setVisible(true);
    }
  }, [safeProgress.percentage, safeProgress.isGenerating, error]);

  // If component should be hidden, return null
  if (!visible && !error) {
    return null;
  }

  // Show error state if there is an error
  if (error) {
    return (
      <Alert variant="destructive" className={cn('mb-4', className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recipe Generation Error</AlertTitle>
        <AlertDescription>
          {error.message}
          {error.recoverable && (
            <div className="mt-2 text-sm">
              We'll try a different approach to generate recipes for you.
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Show completed state
  if (safeProgress.percentage === 100 && !safeProgress.isGenerating && showWhenComplete) {
    return (
      <Alert
        variant="default"
        className={cn(
          'mb-4 bg-green-50 border-green-200 transition-opacity duration-300',
          fadeOut ? 'opacity-0' : 'opacity-100',
          className
        )}
      >
        <Sparkles className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Recipe generation completed successfully!
        </AlertDescription>
      </Alert>
    );
  }

  // If we're generating or progress is greater than 0, show the progress bar
  if (safeProgress.isGenerating || safeProgress.percentage > 0) {
    // Calculate step label based on progress
    const getProgressLabel = () => {
      if (!safeProgress) return 'Preparing...';

      // Use stage or statusMessage if available (supports both new and old formats)
      if (safeProgress.stage || safeProgress.statusMessage) {
        return safeProgress.stage || safeProgress.statusMessage;
      }

      // Fallback progress messages based on percentage
      const percentage = safeProgress.percentage || 0;
      if (percentage <= 20) {
        return 'Analyzing your inventory ingredients...';
      } else if (percentage <= 40) {
        return 'Identifying compatible flavor combinations...';
      } else if (percentage <= 60) {
        return 'Creating recipe options...';
      } else if (percentage <= 80) {
        return 'Finalizing recipes...';
      } else {
        return 'Preparing recipes for display...';
      }
    };

    return (
      <div
        className={cn(
          'space-y-2 transition-opacity duration-300',
          fadeOut ? 'opacity-0' : 'opacity-100',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{getProgressLabel()}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {safeProgress.current > 0 && safeProgress.total > 0
              ? `${safeProgress.current} of ${safeProgress.total}`
              : `${Math.round(safeProgress.percentage)}%`}
          </span>
        </div>
        <Progress value={safeProgress.percentage} className="h-2" />
      </div>
    );
  }

  // If nothing else matched, don't render anything
  return null;
};

export default RecipeStatusBar;
