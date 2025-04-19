import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { RecipeComment } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

export const useRecipeComments = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Add a comment to a recipe
  const addComment = async (recipeId: string, content: string): Promise<void> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to add a comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('recipe_comments').insert([
        {
          user_id: user.id,
          recipe_id: recipeId,
          content,
        },
      ]);

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  };

  // Get comments for a recipe
  const getComments = async (recipeId: string): Promise<RecipeComment[]> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('recipe_comments_with_user')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data.map(comment => ({
        id: comment.id || '',
        userId: comment.user_id || '',
        username: comment.username || 'Anonymous',
        avatarUrl: comment.avatar_url || undefined,
        content: comment.content || '',
        createdAt: comment.created_at || new Date().toISOString(),
        likes: comment.likes || 0,
      }));
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addComment,
    getComments,
    isLoading,
  };
};
