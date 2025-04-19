import React, { useEffect, useState } from 'react';
import { Recipe, ModelInfo } from '@/types/recipe';
import RecipeCard from './RecipeCard';
import { useRecipeContext } from '@/hooks/useRecipeContext';

interface RecipeGridProps {
  recipes: Recipe[];
  onClick?: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  favoriteCounts?: Record<string, number>;
  modelInfo?: ModelInfo;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onClick,
  onFavoriteToggle,
  favoriteCounts = {},
  modelInfo,
}) => {
  const { getRecipeFavorites } = useRecipeContext();
  const [counts, setCounts] = useState<Record<string, number>>(favoriteCounts);

  // Fetch favorite counts if not provided
  useEffect(() => {
    const fetchFavoriteCounts = async () => {
      try {
        const fetchedCounts = await getRecipeFavorites();
        console.log('Fetched favorite counts in RecipeGrid:', fetchedCounts);
        setCounts(fetchedCounts);
      } catch (error) {
        console.error('Error fetching favorite counts:', error);
      }
    };

    if (Object.keys(favoriteCounts).length === 0) {
      fetchFavoriteCounts();
    }
  }, [getRecipeFavorites, favoriteCounts]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          id={recipe.id}
          title={recipe.title}
          image={recipe.image || ''}
          cookTime={recipe.cookTime}
          prepTime={recipe.prepTime}
          servings={recipe.servings}
          tags={recipe.tags}
          isFavorite={recipe.isFavorite || false}
          onClick={() => onClick && onClick(recipe.id)}
          onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(recipe.id) : undefined}
          favoriteCount={counts[recipe.id] || 0}
          modelInfo={modelInfo}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
