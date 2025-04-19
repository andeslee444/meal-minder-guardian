import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  ImageOff,
  Clock,
  User as UserIcon,
  Heart,
  Bot,
  Share2,
  Plus,
  Drumstick,
  Utensils,
  Carrot,
  EggFried,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useImageValidation } from '@/hooks/image/useImageValidation';
import useFallbackStrategies from '@/hooks/image/useFallbackStrategies';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import dalleService from '@/services/dalleService';
import { GenerateImageButton } from './GenerateImageButton';
import { IngredientDisplay } from './IngredientDisplay';
import { DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { generateRecipeImage } from '@/services/dalleService';
import { useCachedState } from '@/hooks/useCachedState';
import useImageGeneration from '@/hooks/api/useImageGeneration';
import { FALLBACK_IMAGES } from '@/config/constants';

type RecipeCardProps = Omit<Recipe, 'ingredients' | 'instructions' | 'description'> & {
  onClick: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
  count?: number | null;
  modelInfo?: {
    provider: string;
    model: string;
    message: string;
  } | null;
  onAddToCart?: (recipe: Recipe) => void;
  showAddToCart?: boolean;
  isFull?: boolean;
  setOpen?: (isOpen: boolean) => void;
};

/**
 * Format favorite counts for display
 */
const formatFavoriteCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
};

/**
 * Get a fallback image for a recipe based on its title or tags
 */
const getFallbackImage = (title: string, tags?: string[]): string => {
  const titleLower = title.toLowerCase();

  // First check for keywords in the title
  if (titleLower.includes('soup')) return FALLBACK_IMAGES.SOUP;
  if (titleLower.includes('salad')) return FALLBACK_IMAGES.SALAD;
  if (titleLower.includes('pasta')) return FALLBACK_IMAGES.PASTA;
  if (titleLower.includes('pizza')) return FALLBACK_IMAGES.PIZZA;
  if (titleLower.includes('burger')) return FALLBACK_IMAGES.BURGER;
  if (titleLower.includes('sandwich')) return FALLBACK_IMAGES.SANDWICH;
  if (titleLower.includes('steak')) return FALLBACK_IMAGES.STEAK;
  if (titleLower.includes('chicken')) return FALLBACK_IMAGES.CHICKEN;
  if (titleLower.includes('rice')) return FALLBACK_IMAGES.RICE;
  if (titleLower.includes('breakfast')) return FALLBACK_IMAGES.BREAKFAST;
  if (titleLower.includes('dinner')) return FALLBACK_IMAGES.DINNER;
  if (titleLower.includes('lunch')) return FALLBACK_IMAGES.LUNCH;

  // Then check the tags if provided
  if (tags) {
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      if (tagLower === 'soup') return FALLBACK_IMAGES.SOUP;
      if (tagLower === 'salad') return FALLBACK_IMAGES.SALAD;
      if (tagLower === 'pasta') return FALLBACK_IMAGES.PASTA;
      if (tagLower === 'pizza') return FALLBACK_IMAGES.PIZZA;
      if (tagLower === 'burger') return FALLBACK_IMAGES.BURGER;
      if (tagLower === 'breakfast') return FALLBACK_IMAGES.BREAKFAST;
      if (tagLower === 'dinner') return FALLBACK_IMAGES.DINNER;
      if (tagLower === 'lunch') return FALLBACK_IMAGES.LUNCH;
      if (tagLower === 'dessert') return FALLBACK_IMAGES.DESSERT;
    }
  }

  // Default fallback
  return FALLBACK_IMAGES.DEFAULT;
};

/**
 * Determine the image source for display
 */
const getImageSource = (url: string): string => {
  if (!url) return 'none';
  if (url.includes('unsplash.com')) return 'Unsplash';
  if (url.includes('openai.com') || url.includes('dall-e')) return 'DALL-E';
  if (url.includes('spoonacular')) return 'Spoonacular';
  if (url.startsWith('data:image')) return 'Generated';
  return 'External';
};

// Recipe difficulty level icons
const difficultyIcons = {
  easy: <Leaf className="w-4 h-4 ml-1 text-green-500" />,
  medium: <Utensils className="w-4 h-4 ml-1 text-orange-500" />,
  hard: <EggFried className="w-4 h-4 ml-1 text-red-500" />,
};

// Meal type icons
const mealTypeIcons = {
  breakfast: <EggFried className="w-4 h-4 mr-1" />,
  lunch: <Utensils className="w-4 h-4 mr-1" />,
  dinner: <Drumstick className="w-4 h-4 mr-1" />,
  vegetarian: <Carrot className="w-4 h-4 mr-1" />,
  special: <Sparkles className="w-4 h-4 mr-1" />,
};

// SVG fallback for when everything fails
const SVG_FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIHVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

/**
 * Recipe card component displaying a recipe with image
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  tags = [],
  prepTime = 0,
  cookTime = 0,
  servings = 0,
  image,
  isFavorite = false,
  count = null,
  modelInfo = null,
  onClick,
  onFavoriteToggle,
  onAddToCart,
  showAddToCart = true,
  isFull = false,
  setOpen,
}) => {
  // Create a recipe object from props for the hooks
  const recipeObj: Recipe = {
    id,
    title,
    tags,
    prepTime,
    cookTime,
    servings,
    image,
    ingredients: [],
    instructions: [],
  };

  // Calculate total cooking time
  const totalTime = prepTime + cookTime;

  // Get fallback image based on recipe
  const fallbackImage = useMemo(() => getFallbackImage(title, tags), [title, tags]);

  // Use our custom image generation hook
  const { images, isGenerating, errors, generateImage, hasImage } = useImageGeneration({
    cachePrefix: 'recipe',
    fallbackImage,
    debugMode: true,
  });

  // Generate image when component mounts
  useEffect(() => {
    // Only generate if we don't already have an image and we have a recipe ID
    if (id && !hasImage(id) && !image) {
      const prompt = `A delicious ${title}, food photography, high quality, professional lighting`;
      generateImage(id, prompt);
    } else if (id && image) {
      // If the recipe already has an image URL, use that instead of generating
      console.log(`[RecipeCard] Recipe already has image: ${image}`);
    }
  }, [id, title, hasImage, generateImage, image]);

  // Get the image URL to display, preferring the recipe's own image, then our generated one, then the fallback
  const displayImageUrl = useMemo(() => {
    if (image) return image;
    if (id && images[id]) return images[id];
    return fallbackImage;
  }, [id, image, images, fallbackImage]);

  // Handle clicking the generate image button
  const handleGenerateImage = useCallback(() => {
    if (id) {
      const prompt = `A delicious ${title}, food photography, high quality, professional lighting`;
      generateImage(id, prompt);
    }
  }, [id, title, generateImage]);

  // Handle image loading errors
  const handleImageError = useCallback(() => {
    console.log(`[RecipeCard] Image load error for: ${title}`);

    // If we failed to load the recipe's own image, try to generate one
    if (image && id) {
      const prompt = `A delicious ${title}, food photography, high quality, professional lighting`;
      generateImage(id, prompt);
    }
  }, [title, image, id, generateImage]);

  // Handle closing the dialog
  const handleCloseDialog = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  // Clean up to check if the image is valid
  const hasValidImage =
    Boolean(displayImageUrl) &&
    (displayImageUrl.startsWith('data:image') || displayImageUrl.startsWith('http'));

  // Determine the image source for display
  const imageSource = hasValidImage ? getImageSource(displayImageUrl) : 'none';

  // Determine if this specific recipe's image is currently generating
  const isLoadingImage = isGenerating[id] || false;
  const imageErrorMessage = errors[id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card
        className="overflow-hidden h-full hover:shadow-elegant-hover transition-shadow duration-300"
        data-recipe-id={id}
      >
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            {isLoadingImage ? (
              <div className="flex items-center justify-center w-full h-full bg-muted animate-pulse">
                <span className="text-muted-foreground text-sm">Generating image...</span>
              </div>
            ) : hasValidImage ? (
              <>
                <img
                  src={displayImageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                  onError={handleImageError}
                />
                {/* Image Source Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge
                    variant="outline"
                    className="bg-black/40 text-white backdrop-blur-sm border-0 text-xs"
                  >
                    {imageSource}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-60">
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageOff className="w-6 h-6 mb-1" />
                  <span className="text-xs">Image unavailable</span>
                </div>
              </div>
            )}
          </AspectRatio>

          <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[70%]">
            {Array.isArray(tags) &&
              tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="blur-backdrop">
                  {tag}
                </Badge>
              ))}
          </div>

          {/* Model info badge */}
          {modelInfo && (
            <div className="absolute bottom-2 left-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="blur-backdrop border-0 text-xs gap-1">
                      <Bot className="w-3 h-3" />
                      {modelInfo.provider}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generated with {modelInfo.model}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        <CardHeader className="pb-1 pt-3">
          <CardTitle
            className={cn(
              'line-clamp-2 font-medium text-lg leading-tight cursor-pointer hover:text-primary transition-colors',
              isFull && 'text-xl'
            )}
            onClick={() => onClick && onClick(id)}
          >
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-0">
          <div className="flex justify-between items-center">
            {onFavoriteToggle && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-full',
                  isFavorite && 'text-red-500 hover:text-red-400'
                )}
                onClick={() => onFavoriteToggle(id)}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
                <span className="sr-only">Toggle favorite</span>
              </Button>
            )}

            {onAddToCart && showAddToCart && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => onAddToCart(recipeObj)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-3 flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              <span>{servings}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Generate Image Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={handleGenerateImage}
              disabled={isLoadingImage}
            >
              {isLoadingImage ? 'Generating...' : 'Generate Image'}
            </Button>

            {count !== null && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Heart className={cn('h-4 w-4 mr-1', count > 0 && 'fill-red-500 text-red-500')} />
                <span>{formatFavoriteCount(count)}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      {imageErrorMessage && (
        <div className="error-message mt-2 text-sm text-red-500">{imageErrorMessage}</div>
      )}
    </motion.div>
  );
};

// Add default export
export default RecipeCard;
