import { useCallback, useRef } from 'react';
import { RecipeGenerationProgress } from '@/types/recipe';

const PROGRESS_UPDATE_INTERVAL = 100; // Update every 100ms
const MIN_PROGRESS_STEP = 5; // Minimum progress step to trigger update

export const useProgressUpdater = (
  onProgressUpdate: (progress: RecipeGenerationProgress) => void
) => {
  const lastUpdateTime = useRef(0);
  const lastProgress = useRef(0);

  const updateProgress = useCallback(
    (current: number, total: number, statusMessage: string, isGenerating: boolean = true) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime.current;
      const percentage = Math.round((current / total) * 100);

      // Only update if enough time has passed or progress has changed significantly
      if (
        timeSinceLastUpdate >= PROGRESS_UPDATE_INTERVAL ||
        Math.abs(percentage - lastProgress.current) >= MIN_PROGRESS_STEP
      ) {
        onProgressUpdate({
          isGenerating,
          current,
          total,
          percentage,
          statusMessage,
        });

        lastUpdateTime.current = now;
        lastProgress.current = percentage;
      }
    },
    [onProgressUpdate]
  );

  return { updateProgress };
};
