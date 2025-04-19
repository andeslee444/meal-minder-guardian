import React from 'react';
import { Save, Heart, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { useImageValidation } from '@/hooks/useImageValidation';
import { isProblematicRecipeType } from '@/services/imageService';
import { Recipe } from '@/types/recipe';
import {
  Clock,
  Users,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

// Function to determine image source from URL
const getImageSource = (url: string): string => {
  if (!url) return 'none';
  if (url.startsWith('data:image')) return 'dalle';
  if (url.includes('unsplash.com')) return 'unsplash';
  if (url.includes('spoonacular.com')) return 'spoonacular';
  return 'external';
};

interface GeneratedRecipeProps {
  recipe: Recipe | null;
  recipeSaved: boolean;
  onSave: () => void;
  onAccept: (recipe: Recipe) => void;
  onReject: (recipeId: string) => void;
  onModify?: (recipe: Recipe) => void; // Optional modify handler
  isLoadingImage?: boolean; // Propagate loading state if needed
}

const GeneratedRecipe: React.FC<GeneratedRecipeProps> = ({
  recipe,
  recipeSaved,
  onSave,
  onAccept,
  onReject,
  onModify,
  isLoadingImage,
}) => {
  const { toggleFavorite } = useRecipeContext();

  if (!recipe) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </CardFooter>
      </Card>
    );
  }

  // Check if this is a problematic recipe type using the utility function
  const isProblematicRecipe = isProblematicRecipeType(recipe.title);

  // Pass the whole recipe object to useImageValidation
  const {
    isValidated,
    isLoading: isImageLoadingInternal,
    needsFallback,
    effectiveImageUrl,
  } = useImageValidation(
    recipe, // Pass recipe object
    { fallbackStrategies: ['static'], recipeTitle: recipe.title } // Example options
  );

  // Combine internal loading state with prop if provided
  const isImageLoading = isLoadingImage ?? isImageLoadingInternal;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  // Map to the expected properties
  const displayImage = effectiveImageUrl || '';
  const isError = !isValidated && needsFallback;
  const isFallback = needsFallback;

  // Determine image source from URL
  const imageSource = displayImage ? getImageSource(displayImage) : 'none';

  // Ensure effectiveImageUrl defaults to undefined for img src prop
  const imageUrlForSrc = effectiveImageUrl || undefined;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-xl font-semibold text-primary font-display tracking-tight flex items-center">
          {recipe.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-60 w-full overflow-hidden bg-secondary/30 flex items-center justify-center">
          {isImageLoading ? (
            <div className="animate-pulse flex items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 text-gray-400" />
              <span className="ml-2">Loading Image...</span>
            </div>
          ) : (
            <img
              src={imageUrlForSrc} // Use variable compatible with string | undefined
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
          {/* Optional: Add validation status indicator */}
          <div className="absolute top-2 right-2">
            {isValidated ? (
              <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full p-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 bg-white rounded-full p-0.5" />
            )}
          </div>
          {needsFallback && (
            <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> Fallback Image Used
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{recipe.servings || 'N/A'} servings</span>
            </div>
          </div>

          {/* Optional: Display a snippet of ingredients or instructions */}
          <div>
            <h4 className="font-medium text-sm mb-1">Key Ingredients:</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.ingredients
                ?.map(ing => ing.name)
                .slice(0, 5)
                .join(', ') || 'Ingredients not listed'}
              {recipe.ingredients && recipe.ingredients.length > 5 ? '...' : ''}
            </p>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {recipe.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-muted/40 border-t">
        <Button variant="outline" onClick={() => onReject(recipe.id)}>
          Reject
        </Button>
        {onModify && (
          <Button variant="secondary" onClick={() => onModify(recipe)}>
            Modify
          </Button>
        )}
        <Button onClick={() => onAccept(recipe)}>Accept Recipe</Button>
      </CardFooter>
    </Card>
  );
};

export default GeneratedRecipe;
