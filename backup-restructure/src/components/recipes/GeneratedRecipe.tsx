import React from 'react';
import { Save, Heart, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { useImageValidation } from '@/hooks/useImageValidation';
import { isProblematicRecipeType } from '@/services/imageService';

// Function to determine image source from URL
const getImageSource = (url: string): string => {
  if (!url) return 'none';
  if (url.startsWith('data:image')) return 'dalle';
  if (url.includes('unsplash.com')) return 'unsplash';
  if (url.includes('spoonacular.com')) return 'spoonacular';
  return 'external';
};

interface GeneratedRecipeProps {
  recipe: any;
  recipeSaved: boolean;
  onSave: () => void;
}

const GeneratedRecipe: React.FC<GeneratedRecipeProps> = ({ recipe, recipeSaved, onSave }) => {
  const { toggleFavorite } = useRecipeContext();

  if (!recipe) return null;

  // Check if this is a problematic recipe type using the utility function
  const isProblematicRecipe = isProblematicRecipeType(recipe.title);

  // Use our custom hook for image validation - status messages enabled for individual recipe view
  const { isValidated, isLoading, needsFallback, effectiveImageUrl } = useImageValidation(
    recipe.image,
    {
      title: recipe.title,
      tags: recipe.tags,
      logPrefix: 'GeneratedRecipe',
      maxRetries: 3,
      // For problematic recipes, always prioritize Unsplash over DALL-E
      preferredStrategies: isProblematicRecipe
        ? ['unsplash', 'static']
        : ['dalle', 'unsplash', 'static'],
    }
  );

  // Map to the expected properties
  const displayImage = effectiveImageUrl || '';
  const isError = !isValidated && needsFallback;
  const isFallback = needsFallback;

  // Determine image source from URL
  const imageSource = displayImage ? getImageSource(displayImage) : 'none';

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-start gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'w-8 h-8 rounded-full p-0',
              recipe.isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-gray-600'
            )}
            onClick={() => toggleFavorite(recipe.id)}
          >
            <Heart className={cn('w-5 h-5', recipe.isFavorite ? 'fill-red-500' : '')} />
          </Button>
          <div>
            <CardTitle>{recipe.title}</CardTitle>
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button
          onClick={onSave}
          disabled={recipeSaved}
          size="sm"
          variant={recipeSaved ? 'outline' : 'default'}
        >
          <Save className="mr-2 h-4 w-4" />
          {recipeSaved ? 'Saved' : 'Save Recipe'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 rounded-md overflow-hidden border">
          <AspectRatio ratio={16 / 9}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">Loading image...</span>
              </div>
            ) : (
              <>
                <img src={displayImage} alt={recipe.title} className="w-full h-full object-cover" />
                {/* Image Source Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge
                    variant="outline"
                    className="bg-black/40 text-white backdrop-blur-sm border-0 text-xs"
                  >
                    {imageSource}
                  </Badge>
                </div>
                {isError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                    <div className="flex flex-col items-center text-muted-foreground bg-background/80 p-2 rounded">
                      <ImageOff className="w-8 h-8 mb-1" />
                      <span className="text-sm">Using fallback image</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </AspectRatio>
        </div>

        <div>
          <h3 className="font-medium mb-2">Ingredients:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ing: any, index: number) => (
              <li key={index}>
                {ing.quantity} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2">Instructions:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.instructions.map((step: string, index: number) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <span>Prep: {recipe.prepTime} min</span>
          <span>Cook: {recipe.cookTime} min</span>
          <span>Servings: {recipe.servings}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedRecipe;
