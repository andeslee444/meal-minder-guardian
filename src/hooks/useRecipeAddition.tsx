import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import { useToast } from '@/hooks/use-toast';
import { addStatusMessage } from '@/components/ui/status';

export const useRecipeAddition = () => {
  const { addRecipe, addMultipleRecipes, recipes } = useRecipeContext();
  const { toast } = useToast();

  // Helper to check if a recipe is a duplicate
  const isDuplicateRecipe = (newRecipe: Recipe): boolean => {
    if (!newRecipe || !newRecipe.title) {
      return false; // Can't be a duplicate if it's invalid
    }

    return recipes.some(
      existingRecipe => existingRecipe.title.toLowerCase() === newRecipe.title.toLowerCase()
    );
  };

  // Custom addRecipe that prevents duplicates and returns boolean indicating success
  const addUniqueRecipe = (recipe: Recipe): boolean => {
    if (!recipe || !recipe.title) {
      console.error('Invalid recipe received:', recipe);
      toast({
        title: 'Recipe Generation Failed',
        description: 'The recipe generation service returned an invalid recipe. Please try again.',
        variant: 'destructive',
      });

      addStatusMessage(
        'error',
        'Invalid recipe format received from generator',
        'Recipe Generation'
      );

      return false;
    }

    // Check if this recipe already exists (by title)
    if (isDuplicateRecipe(recipe)) {
      console.log(`Recipe "${recipe.title}" already exists, not adding duplicate`);

      addStatusMessage(
        'info',
        `Recipe "${recipe.title}" already exists in your collection`,
        'Recipe Generation'
      );

      return false;
    }

    // Add the recipe to context state
    console.log('Adding new recipe to state:', recipe.title);
    addRecipe(recipe);

    addStatusMessage(
      'success',
      `Recipe "${recipe.title}" added to your collection`,
      'Recipe Generation'
    );

    return true;
  };

  // Handler for adding multiple recipes at once with duplicate detection
  const cacheMultipleRecipes = (recipesToCache: Recipe[]): number => {
    if (!recipesToCache || recipesToCache.length === 0) {
      console.log('No recipes to cache');
      return 0;
    }

    // Filter out invalid recipes
    const validRecipes = recipesToCache.filter(recipe => recipe && recipe.title);

    if (validRecipes.length === 0) {
      console.log('No valid recipes to cache');

      addStatusMessage('error', 'No valid recipes received from generator', 'Recipe Generation');

      return 0;
    }

    // Filter out duplicates
    const uniqueRecipes = validRecipes.filter(recipe => !isDuplicateRecipe(recipe));

    console.log(
      `Found ${uniqueRecipes.length} unique recipes out of ${validRecipes.length} valid recipes`
    );

    if (uniqueRecipes.length > 0) {
      console.log(`Adding ${uniqueRecipes.length} unique recipes to cache`);
      addMultipleRecipes(uniqueRecipes);

      addStatusMessage(
        'success',
        `Added ${uniqueRecipes.length} new recipes to your collection`,
        'Recipe Generation'
      );
    } else {
      console.log('All recipes already exist in the collection');

      addStatusMessage(
        'info',
        'All generated recipes already exist in your collection',
        'Recipe Generation'
      );
    }

    return uniqueRecipes.length;
  };

  return {
    addUniqueRecipe,
    cacheMultipleRecipes,
    isDuplicateRecipe,
  };
};
