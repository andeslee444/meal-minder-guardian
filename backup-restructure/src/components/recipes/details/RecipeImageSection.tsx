import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';
import { ImageOff, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isProblematicRecipeType, generateUnsplashFallback } from '@/services/imageService';

interface RecipeImageSectionProps {
  image: string;
  title: string;
  tags?: string[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

// Function to determine image source from URL
const getImageSource = (url: string): string => {
  if (!url) return 'none';
  if (url.startsWith('data:image')) return 'dalle';
  if (url.includes('unsplash.com')) return 'unsplash';
  if (url.includes('spoonacular.com')) return 'spoonacular';
  return 'external';
};

const RecipeImageSection: React.FC<RecipeImageSectionProps> = ({
  image,
  title,
  tags = [],
  isFavorite = false,
  onToggleFavorite,
}) => {
  // Make sure image has a value, using Unsplash as immediate fallback if needed
  const ensuredImage = image || generateUnsplashFallback(title, tags);

  // Local state for image loading/error
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imageSource, setImageSource] = useState('unknown');

  // Determine image source when component mounts
  useEffect(() => {
    if (ensuredImage) {
      setImageSource(getImageSource(ensuredImage));
    }
  }, [ensuredImage]);

  // Handle image load/error
  const handleImageLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-0 relative">
        <AspectRatio ratio={16 / 9}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">Loading image...</span>
            </div>
          )}

          {isError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
              <ImageOff className="h-10 w-10 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Image not available</p>
            </div>
          ) : (
            <>
              <img
                src={ensuredImage}
                alt={title}
                className={`object-cover w-full h-full ${isLoading ? 'invisible' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {/* Image Source Badge - only show when image is loaded */}
              {!isLoading && !isError && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge
                    variant="outline"
                    className="bg-black/40 text-white backdrop-blur-sm border-0 text-xs"
                  >
                    {imageSource}
                  </Badge>
                </div>
              )}
            </>
          )}
        </AspectRatio>

        {onToggleFavorite && (
          <div className="absolute top-3 right-3">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'w-10 h-10 rounded-full p-0 bg-black/30 backdrop-blur-sm hover:bg-black/40',
                isFavorite ? 'text-red-500' : 'text-white'
              )}
              onClick={onToggleFavorite}
            >
              <Heart className={cn('w-5 h-5', isFavorite ? 'fill-red-500' : '')} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeImageSection;
