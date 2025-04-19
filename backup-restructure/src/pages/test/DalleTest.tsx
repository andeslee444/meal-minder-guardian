import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Loader2, ImagePlus } from 'lucide-react';
import dalleService from '@/services/dalleService';
import { toast } from '@/components/ui/use-toast';
import { Recipe, RecipeIngredient } from '@/types/recipe';

export default function DalleTest() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');

  const handleGenerateImage = async () => {
    if (!prompt && !recipeTitle) {
      toast({
        title: 'Missing prompt',
        description: 'Please enter a prompt or recipe details to generate an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      let imageUrl: string | null = null;

      if (recipeTitle) {
        // Generate image from recipe details
        const recipe: Recipe = {
          id: 'test-recipe',
          title: recipeTitle,
          ingredients: recipeIngredients
            .split('\n')
            .filter(Boolean)
            .map(ingredient => ({
              name: ingredient,
              quantity: '1',
              unit: 'piece',
            })),
          instructions: [],
          image: undefined,
          tags: [],
          prepTime: 0,
          cookTime: 0,
          servings: 0,
        };

        imageUrl = await dalleService.generateRecipeImage(recipe);
      } else {
        // Generate image from custom prompt
        imageUrl = await dalleService.generateImage(prompt);
      }

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        toast({
          title: 'Image generated!',
          description: 'DALL-E has created a beautiful image for you.',
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Image generation failed',
        description: 'There was an error generating the image. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">DALL-E Image Generation Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Image</CardTitle>
            <CardDescription>
              Test DALL-E image generation with a custom prompt or recipe details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-title">Recipe Title (Optional)</Label>
              <Input
                id="recipe-title"
                placeholder="Enter a recipe title"
                value={recipeTitle}
                onChange={e => setRecipeTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipe-ingredients">Recipe Ingredients (Optional)</Label>
              <Textarea
                id="recipe-ingredients"
                placeholder="Enter recipe ingredients (one per line)"
                value={recipeIngredients}
                onChange={e => setRecipeIngredients(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Enter a custom prompt for DALL-E"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateImage}
              disabled={isGenerating || (!prompt && !recipeTitle)}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>The image will appear here after generation</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center h-64 bg-muted animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : generatedImageUrl ? (
              <AspectRatio ratio={16 / 9}>
                <img
                  src={generatedImageUrl}
                  alt="Generated by DALL-E"
                  className="object-cover w-full h-full rounded-md"
                />
              </AspectRatio>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted text-muted-foreground">
                No image generated yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
