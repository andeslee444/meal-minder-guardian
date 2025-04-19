import React from 'react';
import Image from 'next/image';
import { Recipe } from '../services/recipeService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

export function RecipeCard({ recipe, onSave, isSaved }: RecipeCardProps) {
  return (
    <Card className="w-full max-w-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={recipe.image || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{recipe.title}</CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recipe.prepTime + recipe.cookTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} servings
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Ingredients
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-sm">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
      {onSave && (
        <CardFooter>
          <Button
            onClick={() => onSave(recipe)}
            disabled={isSaved}
            variant={isSaved ? 'outline' : 'default'}
            className="w-full"
          >
            {isSaved ? 'Recipe Saved' : 'Save Recipe'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
