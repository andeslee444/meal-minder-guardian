import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useUser } from './UserContext';
import { Recipe, RecipeIngredient, RecipeComment } from '@/types/recipe';
import { useRecipeStorage } from '@/hooks/recipe/useRecipeStorage';
import { useRecipeComments } from '@/hooks/recipe/useRecipeComments';

export { type Recipe, type RecipeIngredient, type RecipeComment } from '@/types/recipe';

export interface RecipeContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addRecipe: (recipe: Recipe) => boolean;
  addMultipleRecipes: (recipes: Recipe[]) => void;
  removeRecipe: (recipeId: string) => void;
  updateRecipe: (recipe: Recipe) => void;
  clearRecipes: () => void;
  toggleFavorite: (recipeId: string) => void;
  getFavoriteRecipes: () => Recipe[];
  getFavoriteCount: () => number;
  getRecipeFavorites: (recipeId: string) => boolean;
  addComment: (recipeId: string, comment: RecipeComment) => Promise<void>;
  getComments: (recipeId: string) => Promise<RecipeComment[]>;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const RecipeContext = createContext<RecipeContextType>({
  recipes: [],
  isLoading: true,
  error: null,
  addRecipe: () => false,
  addMultipleRecipes: () => {},
  removeRecipe: () => {},
  updateRecipe: () => {},
  clearRecipes: () => {},
  toggleFavorite: () => {},
  getFavoriteRecipes: () => [],
  getFavoriteCount: () => 0,
  getRecipeFavorites: () => false,
  addComment: async () => {},
  getComments: async () => [],
  setError: () => {},
  setIsLoading: () => {},
});

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const {
    recipes: storedRecipes,
    setRecipes: setStoredRecipes,
    addRecipe: addRecipeToStorage,
    addMultipleRecipes: addMultipleRecipesToStorage,
    clearRecipes: clearStoredRecipes,
    getFavoriteRecipes,
    isLoading: storageLoading,
  } = useRecipeStorage();
  const { addComment, getComments } = useRecipeComments();
  const [recipes, setRecipes] = useState<Recipe[]>(storedRecipes);
  const [isLoading, setIsLoading] = useState(storageLoading);
  const [error, setError] = useState<string | null>(null);

  // Sync recipes with storage
  useEffect(() => {
    setRecipes(storedRecipes);
  }, [storedRecipes]);

  // Sync loading state with storage
  useEffect(() => {
    setIsLoading(storageLoading);
  }, [storageLoading]);

  // Define all callbacks at the top level
  const handleAddRecipe = useCallback(
    (recipe: Recipe) => {
      addRecipeToStorage(recipe);
      return true;
    },
    [addRecipeToStorage]
  );

  const handleAddMultipleRecipes = useCallback(
    (newRecipes: Recipe[]) => {
      addMultipleRecipesToStorage(newRecipes);
    },
    [addMultipleRecipesToStorage]
  );

  const handleRemoveRecipe = useCallback(
    (recipeId: string) => {
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      setStoredRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    },
    [setStoredRecipes]
  );

  const handleUpdateRecipe = useCallback(
    (updatedRecipe: Recipe) => {
      setRecipes(prev =>
        prev.map(recipe => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
      );
      setStoredRecipes(prev =>
        prev.map(recipe => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe))
      );
    },
    [setStoredRecipes]
  );

  const handleClearRecipes = useCallback(() => {
    clearStoredRecipes();
  }, [clearStoredRecipes]);

  const handleToggleFavorite = useCallback(
    (recipeId: string) => {
      setRecipes(prev =>
        prev.map(recipe =>
          recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
        )
      );
      setStoredRecipes(prev =>
        prev.map(recipe =>
          recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
        )
      );
    },
    [setStoredRecipes]
  );

  const handleGetFavoriteRecipes = useCallback(() => {
    return getFavoriteRecipes();
  }, [getFavoriteRecipes]);

  const handleGetFavoriteCount = useCallback(() => {
    return recipes.filter(recipe => recipe.isFavorite).length;
  }, [recipes]);

  const handleGetRecipeFavorites = useCallback(
    (recipeId: string) => {
      return recipes.find(recipe => recipe.id === recipeId)?.isFavorite || false;
    },
    [recipes]
  );

  const handleAddComment = useCallback(
    async (recipeId: string, comment: RecipeComment) => {
      setRecipes(prev =>
        prev.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, comments: [...(recipe.comments || []), comment] }
            : recipe
        )
      );
      setStoredRecipes(prev =>
        prev.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, comments: [...(recipe.comments || []), comment] }
            : recipe
        )
      );
    },
    [setStoredRecipes]
  );

  const handleGetComments = useCallback(
    async (recipeId: string) => {
      const recipe = recipes.find(r => r.id === recipeId);
      return recipe?.comments || [];
    },
    [recipes]
  );

  // Memoize the context value using the pre-defined callbacks
  const contextValue = useMemo(
    () => ({
      recipes,
      isLoading,
      error,
      addRecipe: handleAddRecipe,
      addMultipleRecipes: handleAddMultipleRecipes,
      removeRecipe: handleRemoveRecipe,
      updateRecipe: handleUpdateRecipe,
      clearRecipes: handleClearRecipes,
      toggleFavorite: handleToggleFavorite,
      getFavoriteRecipes: handleGetFavoriteRecipes,
      getFavoriteCount: handleGetFavoriteCount,
      getRecipeFavorites: handleGetRecipeFavorites,
      addComment: handleAddComment,
      getComments: handleGetComments,
      setError,
      setIsLoading,
    }),
    [
      recipes,
      isLoading,
      error,
      handleAddRecipe,
      handleAddMultipleRecipes,
      handleRemoveRecipe,
      handleUpdateRecipe,
      handleClearRecipes,
      handleToggleFavorite,
      handleGetFavoriteRecipes,
      handleGetFavoriteCount,
      handleGetRecipeFavorites,
      handleAddComment,
      handleGetComments,
      setError,
      setIsLoading,
    ]
  );

  return <RecipeContext.Provider value={contextValue}>{children}</RecipeContext.Provider>;
};

export const useRecipe = () => {
  const context = React.useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};
