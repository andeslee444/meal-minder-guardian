import { useCallback, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { RecipeContext, Recipe } from '@/context/RecipeContext';
import { useToast } from '@/hooks/use-toast';
import { errorHandler } from '@/utils/errorHandler';

export const useFavorites = () => {
  const { user } = useUser();
  const { recipes, updateRecipe } = useContext(RecipeContext);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = data?.map(fav => fav.recipe_id) || [];
      const favoriteRecipes = recipes.filter((recipe: Recipe) => favoriteIds.includes(recipe.id));
      setFavorites(favoriteRecipes);

      // Optionally update the main recipes list with favorite status
      // This might be better handled directly in RecipeContext/useRecipeStorage
      // setRecipes(prev => prev.map(r => ({ ...r, isFavorite: favoriteIds.includes(r.id) })));
    } catch (error) {
      errorHandler.handleError(error, { component: 'useFavorites', action: 'fetch_favorites' });
      toast({ title: 'Error fetching favorites', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user, recipes, toast]); // Removed setRecipes dependency if not used here

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) return;
      // Removed unused success variable
      try {
        const { error } = await supabase
          .from('recipe_favorites')
          .insert({ user_id: user.id, recipe_id: recipeId });

        if (error) throw error;

        updateRecipe({ ...recipes.find((r: Recipe) => r.id === recipeId)!, isFavorite: true });
        setFavorites(prev => [...prev, recipes.find((r: Recipe) => r.id === recipeId)!]);
        toast({ title: 'Added to favorites' });
      } catch (error) {
        // Improved error handling
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error adding favorite';
        errorHandler.handleError(error, {
          component: 'useFavorites',
          action: 'add_favorite',
          metadata: { recipeId },
        });
        // Check for specific foreign key constraint error (example)
        if (errorMessage.includes('violates foreign key constraint')) {
          toast({ title: 'Error', description: 'Recipe not found.', variant: 'destructive' });
        } else {
          toast({
            title: 'Error adding favorite',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    },
    [user, recipes, updateRecipe, toast]
  );

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) return;
      // Removed unused success variable
      try {
        const { error } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (error) throw error;

        updateRecipe({ ...recipes.find((r: Recipe) => r.id === recipeId)!, isFavorite: false });
        setFavorites(prev => prev.filter((fav: Recipe) => fav.id !== recipeId));
        toast({ title: 'Removed from favorites' });
      } catch (error) {
        // Improved error handling
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error removing favorite';
        errorHandler.handleError(error, {
          component: 'useFavorites',
          action: 'remove_favorite',
          metadata: { recipeId },
        });
        // Check for specific foreign key constraint error (example)
        if (errorMessage.includes('violates foreign key constraint')) {
          toast({
            title: 'Error',
            description: 'Recipe not found or already removed.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error removing favorite',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    },
    [user, recipes, updateRecipe, toast]
  );

  const isFavorite = useCallback(
    (recipeId: string) => {
      return favorites.some((fav: Recipe) => fav.id === recipeId);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    fetchFavorites, // Expose refetch function
  };
};
