import React, { useState } from 'react';
import { useOpenAIRecipeRequest } from '@/hooks/openai/useOpenAIRecipeRequest';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { RecipeGenerationProgress } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

export const RecipeGenerationTest: React.FC = () => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<RecipeGenerationProgress>({
    isGenerating: false,
    current: 0,
    total: 100,
    percentage: 0,
    stage: 'Ready to generate',
  });

  const { makeOpenAIRequest } = useOpenAIRecipeRequest({
    onProgressUpdate: progress => {
      console.log('[Test] Progress update:', progress);
      setProgress(progress);
    },
  });

  const handleTestGeneration = async () => {
    try {
      const testIngredients = ['chicken breast', 'rice', 'broccoli', 'garlic', 'soy sauce'];
      const testFilterMode: RecipeFilterMode = 'hybrid';

      console.log('[Test] Starting recipe generation test');

      const result = await makeOpenAIRequest(
        testIngredients,
        testFilterMode,
        false,
        false,
        1,
        'test_cache_key',
        [],
        data => data // Simple pass-through for testing
      );

      console.log('[Test] Generation result:', result);

      toast({
        title: 'Test Successful',
        description: 'Recipe generation completed successfully',
      });
    } catch (error) {
      console.error('[Test] Generation error:', error);
      toast({
        title: 'Test Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred during recipe generation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Recipe Generation Test</h2>

      <div className="space-y-2">
        <p>Status: {progress.stage}</p>
        <Progress value={progress.percentage} className="w-full" />
        <p>Progress: {progress.percentage}%</p>
      </div>

      <Button onClick={handleTestGeneration} disabled={progress.isGenerating}>
        {progress.isGenerating ? 'Generating...' : 'Test Recipe Generation'}
      </Button>
    </div>
  );
};
