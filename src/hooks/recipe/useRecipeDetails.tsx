import { useState, useEffect, useCallback, useContext } from 'react';
import { Recipe, RecipeComment } from '@/types/recipe';
import { RecipeContext } from '@/context/RecipeContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export const useRecipeDetails = (recipe: Recipe | null) => {
  const { user, profile } = useUser();
  // Remove unused getComments, getFavoriteCount. Keep addComment, toggleFavorite.
  const { addComment, toggleFavorite, getRecipeFavorites } = useContext(RecipeContext);
  const { toast } = useToast();

  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (recipe) {
      // Use getRecipeFavorites from context if available
      setIsFavorite(
        getRecipeFavorites ? getRecipeFavorites(recipe.id) : recipe.isFavorite || false
      );

      // Load initial comments (assuming they are part of the recipe object)
      // If comments need fetching, implement fetchComments function
      setComments(recipe.comments || []);
    }
  }, [recipe, getRecipeFavorites]);

  // Example: Function to fetch comments if they aren't part of the initial recipe object
  const fetchComments = useCallback(async () => {
    if (!recipe) return;
    setIsLoadingComments(true);
    try {
      // Assuming a function exists in RecipeContext or elsewhere to fetch comments
      // const fetchedComments = await getComments(recipe.id);
      // setComments(fetchedComments);
      console.warn('fetchComments not fully implemented in useRecipeDetails');
      // For now, use existing comments from recipe object
      setComments(recipe.comments || []);
    } catch (error) {
      errorHandler.handleError(error, { component: 'useRecipeDetails', action: 'fetch_comments' });
      toast({ title: 'Error loading comments', variant: 'destructive' });
    } finally {
      setIsLoadingComments(false);
    }
  }, [recipe, toast]);

  // Fetch comments when recipe changes (if needed)
  // useEffect(() => {
  //   fetchComments();
  // }, [fetchComments]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe || !user) {
      toast({ title: 'Please log in to save favorites', variant: 'default' });
      return;
    }
    try {
      // Assuming toggleFavorite in context handles both UI state and backend call
      await toggleFavorite(recipe.id);
      setIsFavorite(prev => !prev); // Update local state
      toast({ title: isFavorite ? 'Removed from favorites' : 'Added to favorites' });
    } catch (error) {
      errorHandler.handleError(error, { component: 'useRecipeDetails', action: 'toggle_favorite' });
      toast({ title: 'Error updating favorites', variant: 'destructive' });
    }
  }, [recipe, user, isFavorite, toggleFavorite, toast]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!recipe || !user || !profile) {
        toast({ title: 'Please log in to comment', variant: 'default' });
        return;
      }
      if (!content.trim()) {
        toast({ title: 'Comment cannot be empty', variant: 'destructive' });
        return;
      }

      // Construct the RecipeComment object
      const commentToAdd: RecipeComment = {
        id: uuidv4(), // Generate new ID
        userId: user.id,
        username: profile.username || user.email || 'Anonymous', // Use profile username or email
        avatarUrl: profile.avatar_url || undefined,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0, // Initial likes
      };

      try {
        // Pass the full comment object
        await addComment(recipe.id, commentToAdd);
        setComments(prev => [...prev, commentToAdd]); // Optimistic UI update
        setNewComment(''); // Clear input field
        toast({ title: 'Comment added' });
      } catch (error) {
        errorHandler.handleError(error, { component: 'useRecipeDetails', action: 'add_comment' });
        toast({ title: 'Error adding comment', variant: 'destructive' });
      }
    },
    [recipe, user, profile, addComment, toast]
  );

  return {
    isFavorite,
    comments,
    isLoadingComments,
    newComment,
    setNewComment,
    handleToggleFavorite,
    handleAddComment,
    fetchComments, // Expose fetchComments if needed externally
  };
};
