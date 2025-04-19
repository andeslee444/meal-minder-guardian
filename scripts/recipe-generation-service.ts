import { supabase } from './supabase-client';
import { Recipe } from '../src/types/recipe';
import { InventoryItem } from '../src/types/inventory';
import { v4 as uuidv4 } from 'uuid';

export class RecipeGenerationService {
  static async generateWithSpoonacular(ingredients: InventoryItem[]): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-recipes', {
        body: {
          endpoint: 'recipes/findByIngredients',
          params: {
            ingredients: ingredients.map(item => item.name).join(','),
            number: 1,
            ranking: 2,
            ignorePantry: true,
          },
        },
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        },
      });

      if (error) {
        console.error('[Error] Spoonacular API error:', error);
        throw error;
      }

      if (!data?.data) {
        console.error('[Error] No data returned from Spoonacular');
        throw new Error('No recipe returned from Spoonacular');
      }

      const recipe = data.data[0];
      if (!recipe) {
        console.error('[Error] Empty recipe data from Spoonacular');
        throw new Error('Empty recipe data from Spoonacular');
      }

      console.log('[Info] Successfully generated recipe with Spoonacular:', recipe.title);
      return {
        id: uuidv4(),
        title: recipe.title,
        ingredients: recipe.usedIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.amount,
          unit: ing.unit,
        })),
        instructions: recipe.instructions || [],
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        image: recipe.image,
        tags: [],
      };
    } catch (error) {
      console.error('[Error] Failed to generate recipe with Spoonacular:', error);
      return null;
    }
  }

  static async generateWithOpenAI(ingredients: InventoryItem[]): Promise<Recipe | null> {
    try {
      console.log(
        '[Info] Attempting to generate recipe with OpenAI using ingredients:',
        ingredients.map(i => i.name)
      );

      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: {
          ingredients: ingredients.map(item => item.name),
          filterMode: 'hybrid',
          numRecipes: 1,
          partialRecipes: true,
          cacheKey: uuidv4(),
          existingRecipes: [],
        },
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        },
      });

      if (error) {
        console.error('[Error] OpenAI API error:', error);
        throw error;
      }

      if (!data) {
        console.error('[Error] No data returned from OpenAI');
        throw new Error('No data returned from OpenAI');
      }

      if (!data.recipes) {
        console.error('[Error] No recipes array in OpenAI response');
        throw new Error('No recipes array in OpenAI response');
      }

      if (!Array.isArray(data.recipes)) {
        console.error('[Error] OpenAI response recipes is not an array:', data.recipes);
        throw new Error('Invalid recipes format in OpenAI response');
      }

      if (data.recipes.length === 0) {
        console.error('[Error] Empty recipes array in OpenAI response');
        throw new Error('No recipes returned from OpenAI');
      }

      const recipe = data.recipes[0];
      if (!recipe) {
        console.error('[Error] First recipe is null or undefined');
        throw new Error('Invalid recipe data from OpenAI');
      }

      // Validate required fields
      if (!recipe.title || typeof recipe.title !== 'string') {
        console.error('[Error] Recipe missing or invalid title');
        throw new Error('Invalid recipe title from OpenAI');
      }

      if (!Array.isArray(recipe.ingredients)) {
        console.error('[Error] Recipe missing or invalid ingredients array');
        throw new Error('Invalid recipe ingredients from OpenAI');
      }

      if (!Array.isArray(recipe.instructions)) {
        console.error('[Error] Recipe missing or invalid instructions array');
        throw new Error('Invalid recipe instructions from OpenAI');
      }

      console.log('[Info] Successfully generated recipe with OpenAI:', recipe.title);
      return {
        id: uuidv4(),
        title: recipe.title,
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        instructions: recipe.instructions,
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 30,
        servings: recipe.servings || 4,
        image: recipe.image,
        tags: recipe.tags || [],
      };
    } catch (error) {
      console.error('[Error] Failed to generate recipe with OpenAI:', error);
      return null;
    }
  }
}
