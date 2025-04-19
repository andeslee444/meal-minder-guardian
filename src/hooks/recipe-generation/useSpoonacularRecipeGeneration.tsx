import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatSpoonacularRecipe } from '@/utils/recipeFormatters';
import { Recipe, RecipeGenerationProgress } from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { useRecipeGenerationProgress } from './useRecipeGenerationProgress';
import { useSpoonacularAPI } from './useSpoonacularAPI';

export const useSpoonacularRecipeGeneration = () => {
  const { toast } = useToast();
  const { isLoading, fetchRecipesByIngredients, fetchRecipeDetails, selectRandomRecipe } =
    useSpoonacularAPI();
  const { updateProgress, createProgressUpdate, setProgressCallback } =
    useRecipeGenerationProgress();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);

  const generateRecipes = async (
    ingredientNames: string[],
    addRecipe: (recipe: Recipe) => boolean,
    cacheMultipleRecipes: (recipes: Recipe[]) => number,
    filterMode: RecipeFilterMode = 'hybrid',
    partialRecipe: boolean = false
  ): Promise<Recipe | null> => {
    if (ingredientNames.length === 0) {
      toast({
        title: 'No ingredients available',
        description: 'Please add some ingredients to your inventory first.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsGenerating(true);

      // Check if we should generate multiple recipes (more than 2 ingredients)
      const shouldGenerateMultiple = ingredientNames.length > 2;
      const recipeCount = shouldGenerateMultiple ? 6 : 1;

      // Set initial progress
      updateProgress(createProgressUpdate(0, recipeCount));

      if (shouldGenerateMultiple) {
        setGeneratingMultiple(true);

        // Get recipes from Spoonacular API
        const spoonacularRecipes = await fetchRecipesByIngredients(ingredientNames, recipeCount);

        // Process all recipes
        const recipePromises = spoonacularRecipes.map(async (recipe, index) => {
          try {
            // Update progress for each recipe
            updateProgress(createProgressUpdate(index, recipeCount));

            const recipeDetails = await fetchRecipeDetails(recipe.id);
            if (!recipeDetails) return null;

            const formattedRecipe = formatSpoonacularRecipe(recipeDetails);

            // Update progress after each recipe
            updateProgress(createProgressUpdate(index + 1, recipeCount));

            return formattedRecipe;
          } catch (error) {
            console.error('Error processing recipe:', error);
            return null;
          }
        });

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter(Boolean) as Recipe[];

        // Cache all recipes at once
        const addedCount = cacheMultipleRecipes(validRecipes);

        // Complete progress
        updateProgress(createProgressUpdate(recipeCount, recipeCount));

        toast({
          title: 'Recipes Generated',
          description: `${addedCount} new recipes have been created and saved!`,
        });

        // Return the first recipe for display
        return validRecipes.length > 0 ? validRecipes[0] : null;
      } else {
        // Single recipe generation
        updateProgress(createProgressUpdate(0, 1));

        const spoonacularRecipes = await fetchRecipesByIngredients(ingredientNames, 5);
        const selectedSpoonacularRecipe = selectRandomRecipe(spoonacularRecipes);

        // Update progress - halfway
        updateProgress(createProgressUpdate(0.5, 1));

        const recipeDetails = await fetchRecipeDetails(selectedSpoonacularRecipe.id);

        // Convert Spoonacular recipe to our format
        const formattedRecipe = formatSpoonacularRecipe(recipeDetails);

        // Update progress - complete
        updateProgress(createProgressUpdate(1, 1));

        // Add the recipe to the list
        const wasAdded = addRecipe(formattedRecipe);

        if (wasAdded) {
          toast({
            title: 'Recipe Generated',
            description: `"${formattedRecipe.title}" has been created and saved to your recipes!`,
          });
        } else {
          toast({
            title: 'Recipe Already Exists',
            description: `"${formattedRecipe.title}" is already in your recipes. Try again for a different recipe.`,
          });
        }

        return formattedRecipe;
      }
    } catch (error) {
      console.error('Error generating recipes with Spoonacular:', error);
      throw error; // Let the caller handle the error
    } finally {
      // Reset progress
      updateProgress(createProgressUpdate(0, 0, false));
      setIsGenerating(false);
      setGeneratingMultiple(false);
    }
  };

  return {
    isGenerating,
    isLoading,
    generatingMultiple,
    generateRecipesWithSpoonacular: generateRecipes,
    setProgressCallback,
  };
};
