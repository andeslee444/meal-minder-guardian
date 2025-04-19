import { useState, useCallback, useEffect } from 'react';
import { generateSampleLikes } from '@/utils/sampleGenerators';

export const useRecipeFavoriteCounts = () => {
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});

  // Initialize favorite counts from local storage for demo purposes
  const initializeFavoriteCounts = useCallback(async () => {
    try {
      // Get all favorite counts from localStorage
      const countsFromStorage: Record<string, number> = {};
      const localStorageKeys = Object.keys(localStorage);

      // Find all recipe_likes_* keys
      localStorageKeys.forEach(key => {
        if (key.startsWith('recipe_likes_')) {
          const recipeId = key.replace('recipe_likes_', '');
          const count = parseInt(localStorage.getItem(key) || '0');
          countsFromStorage[recipeId] = count;
        }
      });

      console.log('Loaded favorite counts from localStorage:', countsFromStorage);
      setFavoriteCounts(countsFromStorage);
      return countsFromStorage;
    } catch (error) {
      console.error('Error initializing favorite counts:', error);
      return {};
    }
  }, []);

  // Get favorite count for a specific recipe
  const getFavoriteCount = async (recipeId: string): Promise<number> => {
    // First check if we have it cached
    if (favoriteCounts[recipeId] !== undefined) {
      return favoriteCounts[recipeId];
    }

    // Check localStorage
    const storageKey = `recipe_likes_${recipeId}`;
    const storedCount = localStorage.getItem(storageKey);

    if (storedCount) {
      const count = parseInt(storedCount);
      // Update the cached value
      setFavoriteCounts(prev => ({
        ...prev,
        [recipeId]: count,
      }));
      return count;
    }

    // If not in localStorage, generate a random count for demo purposes
    const newCount = generateSampleLikes();
    localStorage.setItem(storageKey, newCount.toString());
    console.log(`Generated new count for recipe ${recipeId}: ${newCount}`);

    // Update the cached value
    setFavoriteCounts(prev => ({
      ...prev,
      [recipeId]: newCount,
    }));

    return newCount;
  };

  // Get all favorite counts at once
  const getRecipeFavorites = async (): Promise<Record<string, number>> => {
    // If we don't have any counts yet, initialize them
    if (Object.keys(favoriteCounts).length === 0) {
      return await initializeFavoriteCounts();
    }
    return favoriteCounts;
  };

  // Initialize favorite counts on mount
  useEffect(() => {
    initializeFavoriteCounts();
  }, [initializeFavoriteCounts]);

  return {
    favoriteCounts,
    initializeFavoriteCounts,
    getFavoriteCount,
    getRecipeFavorites,
    setFavoriteCounts,
  };
};
