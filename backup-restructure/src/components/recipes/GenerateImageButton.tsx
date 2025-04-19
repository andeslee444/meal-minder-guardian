import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ImagePlus } from 'lucide-react';
import dalleService from '@/services/dalleService';
import { Recipe } from '@/types/recipe';
import { toast } from '@/components/ui/use-toast';

interface GenerateImageButtonProps {
  recipe: Recipe;
  onImageGenerated?: (imageUrl: string) => void;
}

export function GenerateImageButton({ recipe, onImageGenerated }: GenerateImageButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!recipe || isGenerating) return;

    setIsGenerating(true);

    try {
      toast({
        title: 'Generating image',
        description: 'Creating a beautiful image of this recipe with DALL-E...',
        duration: 5000,
      });

      const imageUrl = await dalleService.generateRecipeImage(recipe);

      if (imageUrl) {
        toast({
          title: 'Image generated!',
          description: 'DALL-E has created a beautiful image for this recipe.',
          duration: 3000,
        });

        // Call the callback if provided
        if (onImageGenerated) {
          onImageGenerated(imageUrl);
        }

        // Update the recipe in storage with the new image
        try {
          const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
          const updatedRecipes = existingRecipes.map((r: any) => {
            if (r.id === recipe.id || r.title === recipe.title) {
              return { ...r, image: imageUrl };
            }
            return r;
          });
          localStorage.setItem('recipes', JSON.stringify(updatedRecipes));

          // Force refresh the UI
          const imgElements = document.querySelectorAll(`[data-recipe-id="${recipe.id}"] img`);
          imgElements.forEach(img => {
            img.setAttribute('src', imageUrl);
          });
        } catch (storageErr) {
          console.error('Error updating recipe storage:', storageErr);
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Image generation failed',
        description: 'There was an error generating the image. Please try again later.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateImage}
      disabled={isGenerating}
      className="gap-1.5"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <ImagePlus className="h-4 w-4" />
          Generate Image
        </>
      )}
    </Button>
  );
}
