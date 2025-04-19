import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipe';
import { useRecipeDetails } from '@/hooks/recipe/useRecipeDetails';

// Import components
import RecipeImageSection from './details/RecipeImageSection';
import RecipeMetadata from './details/RecipeMetadata';
import RecipeIngredientList from './details/RecipeIngredientList';
import RecipeInstructions from './details/RecipeInstructions';
import RecipeCommentsSection from './details/RecipeCommentsSection';

interface RecipeDetailsProps {
  recipe: Recipe;
  getIngredientStatus: (name: string) => 'available' | 'missing' | 'expired' | 'expiring-soon';
  onClose?: () => void;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, getIngredientStatus, onClose }) => {
  const { comments, isLoadingComments, favoriteCount, handleAddComment, handleToggleFavorite } =
    useRecipeDetails(recipe);

  console.log('RecipeDetails rendering for recipe:', recipe.id, recipe.title);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RecipeImageSection
            image={recipe.image || ''}
            title={recipe.title}
            isFavorite={recipe.isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />

          <RecipeMetadata
            prepTime={recipe.prepTime}
            cookTime={recipe.cookTime}
            servings={recipe.servings}
            favoriteCount={favoriteCount}
          />

          <RecipeIngredientList
            ingredients={recipe.ingredients}
            getIngredientStatus={getIngredientStatus}
          />
        </div>

        <div>
          <RecipeInstructions instructions={recipe.instructions} />
        </div>
      </div>

      <RecipeCommentsSection
        comments={comments}
        isLoadingComments={isLoadingComments}
        onAddComment={handleAddComment}
      />

      <DialogFooter className="mt-6">
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  );
};

export default RecipeDetails;
