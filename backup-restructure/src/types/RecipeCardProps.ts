import { Recipe } from './recipe';

export interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (recipeId: string) => void;
}
