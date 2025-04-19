import { useState, useCallback } from 'react';
import { generateImageWithFallback } from '@/api/endpoints/dalle';
import { useToast } from '@/hooks/ui/useToast';

interface UseImageGenerationOptions {
  enableCache?: boolean;
}

interface UseImageGenerationResult {
  loading: boolean;
  image: string | null;
  error: Error | null;
  generateImage: (
    prompt: string,
    options?: { title?: string; category?: string }
  ) => Promise<string>;
  clearImage: () => void;
}

/**
 * React hook for generating images using DALL-E
 */
export function useImageGeneration({
  enableCache = true,
}: UseImageGenerationOptions = {}): UseImageGenerationResult {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Generate an image from a text prompt
   */
  const generateImage = useCallback(
    async (prompt: string, options?: { title?: string; category?: string }): Promise<string> => {
      if (!prompt || prompt.trim() === '') {
        const err = new Error('Please provide a non-empty prompt');
        setError(err);

        toast({
          title: 'Empty prompt',
          description: 'Please provide a description to generate an image.',
          variant: 'destructive',
        });

        return '';
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Generating image for: ${prompt}`);

        toast({
          title: 'Generating image',
          description: 'This may take a moment...',
          variant: 'default',
        });

        const imageUrl = await generateImageWithFallback(prompt, {
          title: options?.title,
          category: options?.category,
        });

        setImage(imageUrl);

        if (imageUrl.includes('fallback')) {
          toast({
            title: 'Using fallback image',
            description: 'Could not generate a custom image for this recipe.',
            variant: 'warning',
          });
        } else {
          toast({
            title: 'Image generated',
            description: 'Successfully created an image for your recipe.',
            variant: 'success',
          });
        }

        return imageUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));

        toast({
          title: 'Error generating image',
          description: errorMessage,
          variant: 'destructive',
        });

        return '';
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  /**
   * Clear the current image
   */
  const clearImage = useCallback(() => {
    setImage(null);
  }, []);

  return {
    loading,
    image,
    error,
    generateImage,
    clearImage,
  };
}
