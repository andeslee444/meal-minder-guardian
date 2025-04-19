import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/context/UserContext';

export const useUserFavorites = () => {
  const { user } = useUserContext();

  // Fetch user's favorites from database
  const fetchUserFavorites = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return [];
      }

      return data.map(fav => fav.recipe_id);
    } catch (error) {
      console.error('Error in fetchUserFavorites:', error);
      return [];
    }
  }, [user]);

  // Add a favorite to the database
  const addFavorite = async (recipeId: string) => {
    if (!user) {
      console.log('User must be logged in to favorite recipes');
      return { error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('recipe_favorites')
        .insert([{ user_id: user.id, recipe_id: recipeId }]);

      if (error) {
        console.error('Error adding favorite:', error);
        return { error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return { error };
    }
  };

  // Remove a favorite from the database
  const removeFavorite = async (recipeId: string) => {
    if (!user) {
      console.log('User must be logged in to unfavorite recipes');
      return { error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Error removing favorite:', error);
        return { error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { error };
    }
  };

  return {
    fetchUserFavorites,
    addFavorite,
    removeFavorite,
  };
};
