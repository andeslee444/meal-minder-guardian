import { useRecipeFavoriteCounts } from './useRecipeFavoriteCounts';
import { useUserFavorites } from './useUserFavorites';
import { useUserContext } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const {
    favoriteCounts,
    initializeFavoriteCounts,
    getFavoriteCount,
    getRecipeFavorites,
    setFavoriteCounts,
  } = useRecipeFavoriteCounts();

  const { fetchUserFavorites, addFavorite, removeFavorite } = useUserFavorites();

  // Toggle favorite status for a recipe
  const toggleFavorite = async (recipeId: string, recipes: any[], setRecipes: Function) => {
    console.log('Toggle favorite called for recipe:', recipeId);

    // Get the current recipe to see if it's being favorited or unfavorited
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      console.error('Recipe not found:', recipeId);
      return;
    }

    const isFavoriting = !recipe.isFavorite;
    console.log('Is favoriting:', isFavoriting, 'for recipe:', recipeId);

    try {
      // Update the UI optimistically
      setRecipes(prevRecipes =>
        prevRecipes.map(r => {
          if (r.id === recipeId) {
            return { ...r, isFavorite: isFavoriting };
          }
          return r;
        })
      );

      // In demo mode, we'll just update the localStorage count
      const storageKey = `recipe_likes_${recipeId}`;
      const currentCount = parseInt(localStorage.getItem(storageKey) || '0');

      if (isFavoriting) {
        let success = true;

        // Add favorite to database if user is logged in
        if (user) {
          try {
            const { error } = await addFavorite(recipeId);

            if (error) {
              // If there's a foreign key error, we'll just update the UI without showing an error
              if (error.message && error.message.includes('violates foreign key constraint')) {
                console.warn(
                  'Foreign key constraint error when adding favorite - continuing in demo mode'
                );
              } else {
                console.error('Error adding favorite:', error);
                toast({
                  title: 'Note',
                  description: 'Saved to local favorites only',
                  variant: 'default',
                });
                success = false;
              }
            }
          } catch (error) {
            console.warn('Error in database operation - continuing in demo mode', error);
          }
        }

        // Update favorite count in localStorage
        const newCount = currentCount + 1;
        localStorage.setItem(storageKey, newCount.toString());

        // Update favorite count in state
        setFavoriteCounts(prev => ({
          ...prev,
          [recipeId]: newCount,
        }));

        console.log(`Increased favorite count for ${recipeId} to ${newCount}`);
      } else {
        let success = true;

        // Remove favorite from database if user is logged in
        if (user) {
          try {
            const { error } = await removeFavorite(recipeId);

            if (error) {
              // If there's a foreign key error, we'll just update the UI without showing an error
              if (error.message && error.message.includes('violates foreign key constraint')) {
                console.warn(
                  'Foreign key constraint error when removing favorite - continuing in demo mode'
                );
              } else {
                console.error('Error removing favorite:', error);
                toast({
                  title: 'Note',
                  description: 'Removed from local favorites only',
                  variant: 'default',
                });
                success = false;
              }
            }
          } catch (error) {
            console.warn('Error in database operation - continuing in demo mode', error);
          }
        }

        // Update favorite count in localStorage, ensuring it doesn't go below 0
        const newCount = Math.max(currentCount - 1, 0);
        localStorage.setItem(storageKey, newCount.toString());

        // Update favorite count in state
        setFavoriteCounts(prev => ({
          ...prev,
          [recipeId]: newCount,
        }));

        console.log(`Decreased favorite count for ${recipeId} to ${newCount}`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Note',
        description: 'Favorite status saved locally only',
        variant: 'default',
      });
    }
  };

  return {
    favoriteCounts,
    fetchUserFavorites,
    initializeFavoriteCounts,
    getFavoriteCount,
    getRecipeFavorites,
    toggleFavorite,
  };
};
