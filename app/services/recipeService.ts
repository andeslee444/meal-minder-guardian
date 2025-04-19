import { supabase, supabaseAdmin } from '../lib/supabase';

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  tags?: string[];
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  filterMode: 'hybrid' | 'strict' | 'flexible';
  numRecipes: number;
  partialRecipes: boolean;
  cacheKey: string;
  existingRecipes: Recipe[];
}

export interface GenerateRecipeResponse {
  recipes: Recipe[];
}

export class RecipeService {
  static async generateRecipes(request: GenerateRecipeRequest): Promise<Recipe[]> {
    try {
      const { data, error } = await supabaseAdmin.functions.invoke<GenerateRecipeResponse>(
        'generate-recipe',
        {
          body: request,
        }
      );

      if (error) {
        console.error('[RecipeService] Error generating recipes:', error);
        throw new Error(error.message);
      }

      if (!data?.recipes) {
        throw new Error('No recipes returned from the service');
      }

      return data.recipes;
    } catch (error) {
      console.error('[RecipeService] Failed to generate recipes:', error);
      throw error;
    }
  }

  static async saveRecipe(recipe: Recipe): Promise<void> {
    try {
      const { error } = await supabase.from('recipes').insert([recipe]);

      if (error) {
        console.error('[RecipeService] Error saving recipe:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('[RecipeService] Failed to save recipe:', error);
      throw error;
    }
  }

  static async getRecipes(): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase.from('recipes').select('*');

      if (error) {
        console.error('[RecipeService] Error getting recipes:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('[RecipeService] Failed to get recipes:', error);
      throw error;
    }
  }
}
