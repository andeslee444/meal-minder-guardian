import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useDalleImageGeneration from '@/hooks/image/useDalleImageGeneration';
import { Recipe } from '@/types/recipe';
import { Loader2 } from 'lucide-react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onImageGenerated: (url: string) => void;
}

export function ImageGenerationModal({
  isOpen,
  onClose,
  recipe,
  onImageGenerated,
}: ImageGenerationModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const { isGenerating, error, generateImage, generateForRecipe } = useDalleImageGeneration();

  // Generate the default prompt based on the recipe
  const generateDefaultPrompt = () => {
    if (!recipe) return '';

    const ingredients = recipe.ingredients.map(ing => ing.name).join(', ');
    return `Professional food photography of ${recipe.title}. A delicious dish with ${ingredients}. Vibrant colors, studio lighting, shallow depth of field, mouth-watering presentation on a beautiful plate, 4k HD.`;
  };

  // Use the recipe to generate a default prompt
  React.useEffect(() => {
    if (recipe) {
      setCustomPrompt(generateDefaultPrompt());
    }
  }, [recipe]);

  const handleGenerateImage = async () => {
    let url;

    if (customPrompt && customPrompt !== generateDefaultPrompt()) {
      // Use custom prompt if available and different from default
      url = await generateImage(customPrompt);
    } else if (recipe) {
      // Otherwise use the recipe
      url = await generateForRecipe(recipe);
    }

    if (url) {
      setGeneratedUrl(url);
      onImageGenerated(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Image with DALL-E</DialogTitle>
          <DialogDescription>Generate an AI image for your recipe using DALL-E.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-name">Recipe</Label>
            <Input
              id="recipe-name"
              value={recipe?.title || ''}
              disabled
              placeholder="No recipe selected"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Image Prompt</Label>
            <Textarea
              id="prompt"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Enter a custom prompt for DALL-E"
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              Describe the food image you want in detail. Include colors, lighting, and
              presentation.
            </p>
          </div>

          {generatedUrl && (
            <div className="space-y-2">
              <Label>Generated Image</Label>
              <div className="rounded-md overflow-hidden border h-48">
                <img
                  src={generatedUrl}
                  alt="Generated food"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md">
              <p className="font-medium">Error generating image:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerateImage} disabled={isGenerating || !recipe}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
