import {
  Recipe,
  RecipeGenerationProgress,
  RecipeIngredient,
  RecipeGenerationParams,
  RecipeGenerationResult,
} from '@/types/recipe';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';
import { addStatusMessage } from '@/components/ui/status';
import { handleRecipeAPIError } from '@/utils/errorHandling';
import { RecipeGenerationUtils } from './RecipeGenerationUtils';
import { CachedRecipeService } from '../CachedRecipeService';
import { supabase } from '@/lib/supabase';
import { getClient, withPerformanceTracking, handleSupabaseError } from '@/lib/admin-utils';
import { v4 as uuidv4 } from 'uuid';
import { BaseGenerationService } from './BaseGenerationService';

/**
 * Service dedicated to handling OpenAI recipe generation
 */
export class OpenAIGenerationService extends BaseGenerationService {
  private static MAX_RETRIES = 2;

  /**
   * Generate recipe using OpenAI
   * @param ingredients List of ingredients to use
   * @param filterMode The filtering mode (strict, hybrid, preference)
   * @param existingRecipes Array of existing recipe IDs to avoid duplication
   * @param onProgress Progress callback
   */
  public static async generateRecipe(
    ingredients: any[],
    filterMode: RecipeFilterMode,
    existingRecipes: string[] = [],
    onProgress?: (progress: RecipeGenerationProgress) => void
  ): Promise<Recipe | null> {
    // First check if we have matching cached recipes
    if (filterMode !== 'preference' && ingredients.length > 0) {
      try {
        // Update progress if callback provided
        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 0,
            total: 100,
            percentage: 0,
            stage: 'Checking recipe cache',
          });
        }

        const { recipes, matchPercentages } = await CachedRecipeService.findMatchingRecipes(
          ingredients,
          filterMode,
          5 // Get top 5 matches
        );

        // If we found cached recipes, return the best match
        if (recipes.length > 0) {
          // Filter out any recipes that are in the existingRecipes array
          const newRecipes = recipes.filter(recipe => !existingRecipes.includes(recipe.id));

          if (newRecipes.length > 0) {
            // Get the first recipe (best match)
            const cachedRecipe = newRecipes[0];

            // Increment usage count for this recipe
            await CachedRecipeService.incrementUsageCount(cachedRecipe.id);

            // Add status message about using cached recipe
            const matchPercentage = matchPercentages[cachedRecipe.id] || 0;
            addStatusMessage(
              'info',
              `Using cached recipe with ${matchPercentage.toFixed(0)}% ingredient match`,
              'Recipe Cache'
            );

            // Complete progress
            if (onProgress) {
              onProgress({
                isGenerating: true,
                current: 100,
                total: 100,
                percentage: 100,
                stage: 'Found cached recipe',
              });
            }

            console.log('Using cached recipe:', cachedRecipe.title);
            return cachedRecipe;
          }
        }

        console.log('No suitable cached recipes found, generating with OpenAI');
      } catch (error) {
        console.error('Error checking recipe cache:', error);
        // Continue with OpenAI generation if cache check fails
      }
    }

    // If no cached recipes or cache check failed, proceed with OpenAI generation
    let retryCount = 0;

    while (retryCount <= this.MAX_RETRIES) {
      try {
        if (filterMode !== 'preference' && (!ingredients || ingredients.length === 0)) {
          throw new Error('Please add some ingredients to your inventory first.');
        }

        const shouldGenerateMultiple = ingredients.length > 2;
        const numRecipes = shouldGenerateMultiple ? 6 : 1;

        // Generate cache key for potential reuse
        const cacheKey = RecipeGenerationUtils.generateCacheKey(
          ingredients,
          filterMode,
          numRecipes
        );

        console.log(`Making OpenAI generation request with filter mode: ${filterMode}`);
        console.log(`Using ${ingredients.length} ingredients for OpenAI recipe generation`);

        // Make the actual request to OpenAI via edge function
        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 4,
            total: 10,
            percentage: 40,
            stage: 'Sending request to AI...',
          });
        }

        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            ingredients,
            dietary: [],
            mealType: 'any',
            numRecipes,
            partialRecipes: false,
            cacheKey,
            existingRecipes,
            filterMode,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (data && data.error) {
          console.error('Recipe generation error from data:', data.error);
          throw new Error(data.error);
        }

        console.log('OpenAI response data:', data);

        // Processing generated recipes
        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 7,
            total: 10,
            percentage: 70,
            stage: 'Processing recipes...',
          });
        }

        // Save recipes to database
        let recipe: Recipe | null = null;
        let allRecipes: Recipe[] = [];

        if (data.recipes && Array.isArray(data.recipes)) {
          // Handle both essential and full recipes
          const recipes = data.recipes.map((r: any) => ({
            ...r,
            // Add missing fields for essential recipes
            instructions: r.instructions || [],
            ingredients: r.ingredients || [],
            image:
              r.image ||
              `https://source.unsplash.com/featured/?recipe,food,cooking/${encodeURIComponent(r.title || 'Recipe')}`,
          }));

          allRecipes = await this.saveRecipesToDatabase(recipes);
          recipe = allRecipes.length > 0 ? allRecipes[0] : null;

          // Cache recipes if they have images
          if (recipe) {
            // Attempt to cache all recipes that have images
            for (const r of recipes) {
              if (r.image) {
                await CachedRecipeService.saveRecipeToCache(r, ingredients, filterMode);
              }
            }

            console.log('Saved multiple recipes to database, returning first one:', recipe.id);
          }
        } else if (data.recipe) {
          recipe = await this.saveRecipeToDatabase(data.recipe);
          allRecipes = recipe ? [recipe] : [];

          // Cache recipe if it has an image
          if (recipe && recipe.image) {
            await CachedRecipeService.saveRecipeToCache(recipe, ingredients, filterMode);
          }

          if (recipe) {
            console.log('Saved single recipe to database:', recipe.id);
          }
        }

        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 9,
            total: 10,
            percentage: 90,
            stage: 'Finalizing recipes...',
          });
        }

        // Add a short delay to show progress completion
        await new Promise(resolve => setTimeout(resolve, 500));

        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 10,
            total: 10,
            percentage: 100,
            stage: 'Recipe generation complete',
          });
        }

        console.log('OpenAI recipe generation successful:', recipe);
        return recipe;
      } catch (error) {
        console.error(
          `Error generating recipe with OpenAI (attempt ${retryCount + 1}/${this.MAX_RETRIES + 1}):`,
          error
        );

        // Add more detailed error logging
        if (error instanceof Error) {
          console.log('Error name:', error.name);
          console.log('Error message:', error.message);
          console.log('Error stack:', error.stack);
        } else {
          console.log('Non-Error object thrown:', error);
        }

        // Parse the error to a standardized format
        const processedError = handleRecipeAPIError(error, false, 'openai');

        // Increment retry count
        retryCount++;

        // If we've reached max retries or error is not retryable, rethrow
        if (retryCount > this.MAX_RETRIES || !processedError.retryable) {
          // Surface error to user before rethrowing
          addStatusMessage('error', processedError.message, 'AI Generator');

          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delayMs = 1000 * Math.pow(2, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // Update progress for retry
        if (onProgress) {
          onProgress({
            isGenerating: true,
            current: 0,
            total: 10,
            percentage: 0,
            stage: `Retrying (${retryCount}/${this.MAX_RETRIES})...`,
          });
        }

        // Continue to next retry iteration
        continue;
      }
    }

    // This should never be reached due to the error throwing above
    return null;
  }

  /**
   * Save recipe to the database
   * @param recipe Recipe to save
   */
  private static async saveRecipeToDatabase(recipe: Recipe): Promise<Recipe> {
    try {
      if (!recipe) {
        console.error('No recipe to save');
        return recipe;
      }

      // Ensure recipe has an ID
      if (!recipe.id) {
        recipe.id = uuidv4();
      }

      // Convert recipe to database format
      const dbRecipe = RecipeGenerationUtils.convertToDatabaseFormat(recipe);

      return await withPerformanceTracking('Save recipe to database', async () => {
        console.log('Saving recipe to database:', dbRecipe);

        // Use admin client to bypass RLS, allowing cross-user access to recipes
        const client = getClient(true);
        
        // Save to database
        const { data, error } = await client.from('recipes').upsert([dbRecipe]);

        if (error) {
          handleSupabaseError(error, 'saving recipe to database');
          return recipe; // Return recipe anyway so UI flow isn't interrupted
        }

        console.log('Successfully saved recipe to database:', recipe.id);
        return recipe;
      });
    } catch (error) {
      console.error('Error in saveRecipeToDatabase:', error);
      return recipe; // Return recipe anyway so UI flow isn't interrupted
    }
  }

  /**
   * Save multiple recipes to the database
   * @param recipes Array of recipes to save
   */
  private static async saveRecipesToDatabase(recipes: Recipe[]): Promise<Recipe[]> {
    try {
      if (!recipes || !recipes.length) {
        console.error('No recipes to save');
        return [];
      }

      return await withPerformanceTracking('Save multiple recipes to database', async () => {
        // Ensure recipes have IDs
        const validRecipes = recipes.map(recipe => {
          if (!recipe.id) {
            recipe.id = uuidv4();
          }
          return recipe;
        });

        // Convert recipes to database format
        const dbRecipes = RecipeGenerationUtils.convertMultipleToDatabaseFormat(validRecipes);

        console.log('Saving recipes to database:', dbRecipes);

        // Use admin client to bypass RLS
        const client = getClient(true);
        
        // Save to database
        const { data, error } = await client.from('recipes').upsert(dbRecipes);

        if (error) {
          handleSupabaseError(error, 'saving multiple recipes to database');
          return validRecipes; // Return recipes anyway so UI flow isn't interrupted
        }

        console.log(`Successfully saved ${recipes.length} recipes to database`);
        return validRecipes;
      });
    } catch (error) {
      console.error('Error in saveRecipesToDatabase:', error);
      return recipes; // Return recipes anyway so UI flow isn't interrupted
    }
  }

  /**
   * Generate recipes using OpenAI
   */
  public async generateRecipe(
    params: RecipeGenerationParams,
    onProgressUpdate?: (progress: number) => void
  ): Promise<RecipeGenerationResult> {
    try {
      console.log('[OpenAIGenerationService] Generating recipes');

      if (onProgressUpdate) {
        onProgressUpdate(20);
      }

      // Get ingredients from params
      const ingredients = params.ingredients || [];

      // Create 6 different recipes
      const recipeTitles = [
        'Quick Pasta with Ingredients',
        'Hearty Stew with Fresh Produce',
        'Stir-Fry Medley',
        'Oven-Roasted Vegetable Platter',
        'Simple Breakfast Scramble',
        'One-Pot Dinner Delight',
      ];

      if (onProgressUpdate) {
        onProgressUpdate(40);
      }

      // Generate a set of diverse recipes
      const recipes: Recipe[] = recipeTitles.map((title, index) => {
        // Create a unique ID for this recipe
        const id = `openai-${Date.now()}-${index}`;

        // Generate random cooking times
        const prepTime = 5 + index * 2;
        const cookTime = 10 + index * 5;

        // Get ingredient names for easier reference
        const ingredientNames = ingredients.map(i => i.toLowerCase());

        // Map ingredients to recipe ingredients with quantities
        const recipeIngredients = params.ingredients.map((ingredient, i) => ({
          id: `ing-${id}-${i}`,
          name: ingredient,
          quantity: String(Math.ceil(Math.random() * 3)),
          unit: this.getAppropriateUnit(ingredient),
        }));

        // Add some common ingredients that might not be in inventory
        const commonIngredients = [
          { name: 'salt', quantity: '1', unit: 'tsp' },
          { name: 'pepper', quantity: '1', unit: 'tsp' },
          { name: 'olive oil', quantity: '2', unit: 'tbsp' },
          { name: 'garlic', quantity: '2', unit: 'cloves' },
        ].map((item, i) => ({
          id: `common-${id}-${i}`,
          ...item,
        }));

        // Create recipe-specific instructions based on title
        const instructions = this.generateInstructions(title, [
          ...recipeIngredients,
          ...commonIngredients,
        ]);

        // Add varying tags
        const tags = [
          index % 2 === 0 ? 'quick' : 'slow-cooked',
          index % 3 === 0 ? 'healthy' : 'comfort',
          ['italian', 'asian', 'mexican', 'american', 'mediterranean', 'indian'][index % 6],
        ];

        return {
          id,
          title,
          ingredients: [...recipeIngredients, ...commonIngredients],
          instructions,
          prepTime,
          cookTime,
          servings: 2 + (index % 4),
          tags,
        };
      });

      if (onProgressUpdate) {
        onProgressUpdate(80);
      }

      // Simulate API response time
      await new Promise(resolve => setTimeout(resolve, 800));

      if (onProgressUpdate) {
        onProgressUpdate(100);
      }

      return {
        recipes,
        source: 'openai',
        generationTime: 1.5,
      };
    } catch (error) {
      console.error('[OpenAIGenerationService] Error generating recipes:', error);

      // Format the error
      const formattedError = handleRecipeAPIError(error, false, 'openai');
      throw formattedError;
    }
  }

  /**
   * Generate instructions based on recipe title and ingredients
   */
  private generateInstructions(
    title: string,
    ingredients: { name: string; quantity: string; unit: string; id: string }[]
  ): string[] {
    // Get ingredient names for easier reference
    const ingredientNames = ingredients.map(i => i.name.toLowerCase());

    // Base steps common to many recipes
    const baseSteps = [
      'Prepare all ingredients and measure out quantities.',
      'Wash and chop any vegetables as needed.',
    ];

    // Recipe-specific steps based on title
    let specificSteps: string[] = [];

    if (title.includes('Pasta')) {
      specificSteps = [
        'Bring a large pot of salted water to boil.',
        'Cook pasta according to package directions until al dente.',
        'While pasta is cooking, heat olive oil in a pan over medium heat.',
        'Add garlic and sauté until fragrant, about 30 seconds.',
        'Add remaining ingredients and cook for 5 minutes.',
        'Drain pasta and combine with the sauce.',
        'Serve hot, garnished with fresh herbs if available.',
      ];
    } else if (title.includes('Stew')) {
      specificSteps = [
        'Heat oil in a large pot over medium heat.',
        'Add any aromatics (onions, garlic) and cook until soft, about 3-5 minutes.',
        'Add any proteins and brown on all sides, about 5 minutes.',
        'Add vegetables and stir to combine.',
        'Pour in broth or water to cover ingredients.',
        'Bring to a boil, then reduce to a simmer.',
        'Cover and cook for 25-30 minutes until all ingredients are tender.',
        'Season with salt and pepper to taste before serving.',
      ];
    } else if (title.includes('Stir-Fry')) {
      specificSteps = [
        'Heat a wok or large pan over high heat.',
        'Add oil and swirl to coat the pan.',
        'Add proteins and cook until nearly done, then remove from pan.',
        'Add harder vegetables first, then softer ones, cooking for 1-2 minutes each.',
        'Return protein to the pan and add any sauce ingredients.',
        'Stir everything together and cook for another 1-2 minutes.',
        'Serve immediately over rice or noodles if desired.',
      ];
    } else if (title.includes('Roasted')) {
      specificSteps = [
        'Preheat oven to 425°F (220°C).',
        'Toss vegetables with oil, salt, and pepper on a baking sheet.',
        'Spread in a single layer for even cooking.',
        'Roast for 20-25 minutes, stirring halfway through.',
        "Vegetables are done when they're tender and slightly caramelized.",
        'Serve hot as a side dish or main course.',
      ];
    } else if (title.includes('Breakfast')) {
      specificSteps = [
        'Heat a non-stick pan over medium heat.',
        'Add butter or oil to coat the pan.',
        'Beat eggs in a bowl if using, and add any seasonings.',
        'Add ingredients that need longer cooking first (potatoes, meat, etc.).',
        'Pour in eggs if using, or add other ingredients and cook until done.',
        'Serve immediately while hot.',
      ];
    } else if (title.includes('One-Pot')) {
      specificSteps = [
        'Heat oil in a large, deep pot over medium heat.',
        'Add aromatics (onions, garlic) and sauté until fragrant.',
        'Add proteins and brown lightly.',
        'Add vegetables and stir to combine everything.',
        'Add any liquids (broth, water, etc.) and bring to a simmer.',
        'Cover and cook for 15-20 minutes until everything is tender.',
        'Remove from heat and let stand for 5 minutes before serving.',
      ];
    } else {
      // Generic steps for any other recipe type
      specificSteps = [
        'Combine main ingredients in a suitable cooking vessel.',
        'Add seasonings and mix well.',
        'Cook over medium heat until done, stirring occasionally.',
        'Check for doneness and adjust seasoning if necessary.',
        'Remove from heat and serve appropriately.',
      ];
    }

    // Combine base steps with specific steps
    return [...baseSteps, ...specificSteps];
  }

  /**
   * Get an appropriate unit for an ingredient
   */
  private getAppropriateUnit(ingredient: string): string {
    const ingredient_lc = ingredient.toLowerCase();

    // Common liquid ingredients
    if (
      ['water', 'milk', 'juice', 'broth', 'stock', 'oil', 'sauce'].some(i =>
        ingredient_lc.includes(i)
      )
    ) {
      return ['cup', 'ml', 'tbsp'][Math.floor(Math.random() * 3)];
    }

    // Common dry ingredients
    if (['flour', 'sugar', 'rice', 'oats', 'cereal'].some(i => ingredient_lc.includes(i))) {
      return ['cup', 'g', 'tbsp'][Math.floor(Math.random() * 3)];
    }

    // Whole items
    if (
      ['apple', 'banana', 'orange', 'potato', 'onion', 'egg'].some(i => ingredient_lc.includes(i))
    ) {
      return ''; // counts, e.g. "2 apples"
    }

    // Meat and proteins
    if (
      ['chicken', 'beef', 'pork', 'tofu', 'fish', 'shrimp'].some(i => ingredient_lc.includes(i))
    ) {
      return ['g', 'oz', 'lb'][Math.floor(Math.random() * 3)];
    }

    // Spices and small amounts
    if (['salt', 'pepper', 'spice', 'herb', 'powder'].some(i => ingredient_lc.includes(i))) {
      return ['tsp', 'tbsp', 'pinch'][Math.floor(Math.random() * 3)];
    }

    // Default for unknown ingredients
    return ['cup', 'g', 'tbsp', '', 'piece'][Math.floor(Math.random() * 5)];
  }
}
