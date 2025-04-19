import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RecipeGenerationProgress } from '@/types/recipe';
import { Brain, ChefHat, Zap, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecipeThinkingVisualizerProps {
  progress: RecipeGenerationProgress;
}

/**
 * Component that visualizes the AI "thinking" process during recipe generation
 * Shows a detailed visualization of thought process, preferences, etc.
 */
const RecipeThinkingVisualizer: React.FC<RecipeThinkingVisualizerProps> = ({ progress }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Set animation complete after progress reaches 100%
  useEffect(() => {
    if (progress.percentage >= 100) {
      const timer = setTimeout(() => setAnimationComplete(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(false);
    }
  }, [progress.percentage]);

  // For debugging
  useEffect(() => {
    console.log('RecipeThinkingVisualizer rendering with progress:', {
      percentage: progress.percentage,
      thinkingPoints: progress.thinkingPoints?.length || 0,
      preferences: progress.preferences?.length || 0,
      stage: progress.stage || progress.statusMessage,
    });
  }, [progress]);

  // Don't show when not generating
  if (!progress.isGenerating && progress.percentage === 0) {
    return null;
  }

  // Default thinking points if none provided
  const thinkingPoints = progress.thinkingPoints || [
    'Analyzing available ingredients in your inventory...',
    'Considering your past recipe preferences...',
    'Exploring compatible flavor combinations...',
    'Calculating preparation and cooking times...',
    'Evaluating nutritional balance...',
    'Finding creative ways to use your ingredients...',
  ];

  // Default preferences if none provided
  const preferences = progress.preferences || [
    'Quick meals',
    'Family-friendly',
    'Budget-conscious',
    'Minimal ingredients',
    'Meal prep friendly',
  ];

  // Calculate how many thinking points to show based on progress
  const pointsToShow = Math.max(1, Math.ceil(progress.percentage / 16));

  const getIconForPoint = (index: number) => {
    const icons = [
      <Brain key="brain" size={16} />,
      <ChefHat key="chef" size={16} />,
      <Zap key="zap" size={16} />,
      <Utensils key="utensils" size={16} />,
    ];
    return icons[index % icons.length];
  };

  // Get stage from either stage or statusMessage field to support both new and old formats
  const currentStage = progress.stage || progress.statusMessage || '';

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium flex items-center">
            <ChefHat className="mr-2 h-5 w-5 text-primary" />
            <span>Generating Your Recipes</span>
          </h3>
          <span className="text-sm text-muted-foreground">{Math.round(progress.percentage)}%</span>
        </div>

        <Progress value={progress.percentage} className="h-2 mb-4" />

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left column: thinking points */}
          <div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium mb-2">Analyzing Your Ingredients</h4>
              {thinkingPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: index < pointsToShow ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-start gap-2 ${
                    index < pointsToShow ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="mt-0.5 bg-primary/10 p-1 rounded">{getIconForPoint(index)}</div>
                  <span className="text-sm">{point}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column: preferences, dietary info, cuisines */}
          <div className="space-y-6">
            {/* Only show preferences when we're at least 20% through */}
            {progress.percentage >= 20 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Considering Your Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.slice(0, Math.ceil(progress.percentage / 20)).map((pref, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Badge variant="outline" className="bg-primary/5">
                        {pref}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Only show dietary info when we're at least 40% through */}
            {progress.percentage >= 40 &&
              progress.dietaryInfo &&
              progress.dietaryInfo.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Dietary Considerations</h4>
                  <div className="flex flex-wrap gap-2">
                    {progress.dietaryInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-800 border-blue-200"
                        >
                          {info}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            {/* Only show cuisines when we're at least 60% through */}
            {progress.percentage >= 60 &&
              progress.cuisineStyles &&
              progress.cuisineStyles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Exploring Cuisines</h4>
                  <div className="flex flex-wrap gap-2">
                    {progress.cuisineStyles.map((cuisine, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 1 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200"
                        >
                          {cuisine}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            {currentStage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t pt-3 mt-3"
              >
                <span className="text-sm text-muted-foreground">{currentStage}</span>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeThinkingVisualizer;
