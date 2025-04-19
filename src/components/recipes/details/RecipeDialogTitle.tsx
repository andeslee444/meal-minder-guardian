import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipe';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { cn } from '@/lib/utils';

interface RecipeDialogTitleProps {
  recipe: Recipe;
}

const RecipeDialogTitle: React.FC<RecipeDialogTitleProps> = ({ recipe }) => {
  const { toggleFavorite } = useRecipeContext();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(recipe.id);
  };

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'w-8 h-8 rounded-full p-0',
          recipe.isFavorite
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-gray-600'
        )}
        onClick={handleToggleFavorite}
      >
        <Heart className={cn('w-5 h-5', recipe.isFavorite ? 'fill-red-500' : '')} />
      </Button>
      {recipe.title}
    </>
  );
};

export default RecipeDialogTitle;
