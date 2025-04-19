import { useState, useEffect } from 'react';
import { Recipe, RecipeComment } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { generateSampleComments, generateSampleLikes } from '@/utils/sampleGenerators';

export const useRecipeDetails = (recipe: Recipe) => {
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { toast } = useToast();
  const { getComments, addComment, getFavoriteCount, toggleFavorite } = useRecipeContext();

  // Load comments and favorite count
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoadingComments(true);
        console.log('Loading comments for recipe:', recipe.id);

        // Check local storage for sample comments
        const localCommentsKey = `recipe_comments_${recipe.id}`;
        const localLikesKey = `recipe_likes_${recipe.id}`;

        let loadedComments: RecipeComment[] = [];
        let loadedLikes = 0;

        // Try to load from local storage first
        try {
          const storedComments = localStorage.getItem(localCommentsKey);
          const storedLikes = localStorage.getItem(localLikesKey);

          if (storedComments) {
            loadedComments = JSON.parse(storedComments);
            console.log('Loaded comments from localStorage:', loadedComments.length);
          }

          if (storedLikes) {
            loadedLikes = parseInt(storedLikes, 10);
            console.log('Loaded likes from localStorage:', loadedLikes);
          }
        } catch (e) {
          console.error('Error parsing stored comments/likes:', e);
        }

        // If no comments in local storage, generate new ones
        if (loadedComments.length === 0) {
          console.log('No stored comments found, generating new sample comments');
          loadedComments = generateSampleComments(recipe.id);
          loadedLikes = generateSampleLikes();

          // Store the newly generated comments and likes
          localStorage.setItem(localCommentsKey, JSON.stringify(loadedComments));
          localStorage.setItem(localLikesKey, loadedLikes.toString());
        }

        // Update state if component is still mounted
        if (isMounted) {
          setComments(loadedComments);
          setFavoriteCount(loadedLikes);
        }
      } catch (error) {
        console.error('Error loading recipe data:', error);
        if (isMounted) {
          toast({
            title: 'Error loading data',
            description: 'Could not load comments for this recipe.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingComments(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [recipe.id, toast]);

  const handleAddComment = async (content: string): Promise<void> => {
    try {
      // Attempt to add comment via the context method
      await addComment(recipe.id, content);

      // Add the new comment to the local state
      const newComment: RecipeComment = {
        id: `local-${Date.now()}`,
        userId: 'current-user',
        username: 'You',
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      setComments(prevComments => [newComment, ...prevComments]);

      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error adding comment',
        description: 'There was an error adding your comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle toggling favorite status
  const handleToggleFavorite = () => {
    toggleFavorite(recipe.id);

    // Update favorite count optimistically
    if (recipe.isFavorite) {
      setFavoriteCount(prev => Math.max(0, prev - 1));
    } else {
      setFavoriteCount(prev => prev + 1);
    }
  };

  return {
    comments,
    isLoadingComments,
    favoriteCount,
    handleAddComment,
    handleToggleFavorite,
  };
};
