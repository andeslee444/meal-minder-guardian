import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookingPotIcon } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { useRecipeContext } from '@/hooks/useRecipeContext';

interface RecipeListProps {
  recipes: Recipe[];
  onClick: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  isGenerating?: boolean;
  onGenerateMore?: () => Promise<void | null>;
  favoriteCounts?: Record<string, number>;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onClick,
  onFavoriteToggle,
  isGenerating,
  onGenerateMore,
  favoriteCounts = {},
}) => {
  const { getRecipeFavorites } = useRecipeContext();
  const [counts, setCounts] = useState<Record<string, number>>(favoriteCounts);

  // Fetch favorite counts if not provided
  useEffect(() => {
    const fetchFavoriteCounts = async () => {
      try {
        const fetchedCounts = await getRecipeFavorites();
        console.log('Fetched favorite counts in RecipeList:', fetchedCounts);
        setCounts(fetchedCounts);
      } catch (error) {
        console.error('Error fetching favorite counts:', error);
      }
    };

    fetchFavoriteCounts();
  }, [getRecipeFavorites, recipes]);

  const handleGenerateMore = async () => {
    if (isGenerating || !onGenerateMore) return;
    try {
      await onGenerateMore();
    } catch (error) {
      console.error('Error generating more recipes:', error);
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CookingPotIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              prepTime={recipe.prepTime}
              cookTime={recipe.cookTime}
              servings={recipe.servings}
              image={recipe.image || ''}
              tags={recipe.tags}
              isFavorite={recipe.isFavorite}
              onClick={() => onClick(recipe.id)}
              onFavoriteToggle={onFavoriteToggle}
              favoriteCount={counts[recipe.id]}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Recipe generation button at the bottom */}
      {onGenerateMore && recipes.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="flex items-center"
          >
            {isGenerating ? 'Generating...' : 'Generate More Recipes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
