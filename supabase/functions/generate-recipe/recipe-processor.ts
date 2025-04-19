/**
 * Hyper-optimized module for processing recipe data
 */
// @ts-ignore
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { createPrompt } from './prompt-builder.ts';
import { callOpenAIWithRetry } from './openai-client.ts';
import { callGeminiWithRetry } from './gemini-client.ts';
import { RecipeResponse as BaseRecipeResponse } from './types.ts';

// PERFORMANCE: Use fixed template strings & constants for static resources
const DEFAULT_IMAGE_BASE = 'https://source.unsplash.com/featured/?recipe,food,cooking';

// PERFORMANCE: Precompile regex patterns
const STEP_REGEX = /^\d+\.\s+/;
const NEWLINE_REGEX = /\n+/g;

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  image?: string;
  [key: string]: any;
}

// Rename to avoid conflict with imported type
export interface ProcessedRecipeResponse extends BaseRecipeResponse {
  id?: string;
  image?: string;
}

/**
 * Process a single recipe from OpenAI response with minimal overhead
 */
export async function processSingleRecipe(recipe: Partial<Recipe>): Promise<Recipe | null> {
  if (!recipe) return null;

  try {
    // PERFORMANCE: Create recipe ID once
    const recipeId = recipe.id || uuidv4();

    // Validate required fields
    if (
      !recipe.title ||
      !Array.isArray(recipe.ingredients) ||
      !Array.isArray(recipe.instructions)
    ) {
      console.error('[Error] Recipe missing required fields:', {
        hasTitle: !!recipe.title,
        hasIngredients: Array.isArray(recipe.ingredients),
        hasInstructions: Array.isArray(recipe.instructions),
      });
      return null;
    }

    // PERFORMANCE: Use object spread for default values
    const processedRecipe = {
      id: recipeId,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: typeof recipe.prepTime === 'number' ? recipe.prepTime : 15,
      cookTime: typeof recipe.cookTime === 'number' ? recipe.cookTime : 30,
      servings: typeof recipe.servings === 'number' ? recipe.servings : 4,
      image: recipe.image || `${DEFAULT_IMAGE_BASE}/${encodeURIComponent(recipe.title)}`,
      ...recipe, // Preserve any additional fields
    };

    return processedRecipe as Recipe;
  } catch (error) {
    console.error('[Error] Failed to process recipe:', error);
    return null;
  }
}

/**
 * Process multiple recipes from OpenAI response with parallel execution
 */
export async function processMultipleRecipes(recipes: Partial<Recipe>[]): Promise<Recipe[]> {
  if (!Array.isArray(recipes)) {
    console.error('[Error] Expected array of recipes, got:', typeof recipes);
    return [];
  }

  // PERFORMANCE: Process recipes in parallel with Promise.all
  const processedRecipes = await Promise.all(recipes.map(recipe => processSingleRecipe(recipe)));

  // Filter out null results efficiently
  return processedRecipes.filter((recipe): recipe is Recipe => recipe !== null);
}

/**
 * Create essential recipes with minimal data for ultra-fast UI rendering
 */
export function createEssentialRecipes(recipes: Partial<Recipe>[]): Recipe[] {
  if (!Array.isArray(recipes)) {
    console.error('[Error] Expected array of recipes, got:', typeof recipes);
    return [];
  }

  return recipes.map(recipe => createEssentialRecipe(recipe));
}

/**
 * Create an essential recipe with absolute minimal required data
 */
export function createEssentialRecipe(recipe: Partial<Recipe>): Recipe {
  if (!recipe) {
    console.error('[Error] Cannot create essential recipe from null/undefined');
    return {
      id: uuidv4(),
      title: 'Untitled Recipe',
      ingredients: [],
      instructions: [],
      image: `${DEFAULT_IMAGE_BASE}/recipe`,
      prepTime: 15,
      cookTime: 30,
      servings: 4,
    };
  }

  return {
    id: recipe.id || uuidv4(),
    title: recipe.title || 'Untitled Recipe',
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    image: recipe.image || `${DEFAULT_IMAGE_BASE}/${encodeURIComponent(recipe.title || 'Recipe')}`,
    prepTime: typeof recipe.prepTime === 'number' ? recipe.prepTime : 15,
    cookTime: typeof recipe.cookTime === 'number' ? recipe.cookTime : 30,
    servings: typeof recipe.servings === 'number' ? recipe.servings : 4,
  };
}

interface RecipeGenerationParams {
  ingredients: string[];
  filterMode: string;
  numRecipes: number;
  partialRecipes: boolean;
  cacheKey: string;
  existingRecipes: ProcessedRecipeResponse[];
}

export async function handleRecipeGenerationRequest(
  params: RecipeGenerationParams
): Promise<ProcessedRecipeResponse[]> {
  const { ingredients, filterMode, numRecipes, partialRecipes, cacheKey, existingRecipes } = params;

  console.log('[Info] Starting recipe generation request with:', {
    ingredientsCount: ingredients.length,
    dietary: [],
    mealType: 'any',
    numRecipes,
    filterMode,
    partialRecipes,
    cacheKey,
    existingRecipesCount: existingRecipes.length,
    hasOpenAIKey: !!Deno.env.get('OPENAI_API_KEY'),
    hasGeminiKey: !!Deno.env.get('GOOGLE_API_KEY'),
  });

  // Create prompt
  console.log('[Info] Creating prompt with ingredients:', ingredients);
  const prompt = createPrompt(ingredients, numRecipes, {
    filterMode,
    existingRecipes,
    partialRecipes,
  });
  console.log('[Info] Prompt created successfully');

  try {
    // Try OpenAI first
    console.log('[Info] Attempting to use OpenAI API');
    const recipes = await callOpenAIWithRetry(prompt);
    console.log('[Info] Successfully generated recipes with OpenAI');
    return recipes;
  } catch (openaiError) {
    console.error('[Error] OpenAI API failed, falling back to Gemini:', openaiError);

    try {
      // Fallback to Gemini
      console.log('[Info] Falling back to Gemini API');
      const recipes = await callGeminiWithRetry(prompt);
      console.log('[Info] Successfully generated recipes with Gemini');
      return recipes;
    } catch (geminiError) {
      console.error('[Error] Both APIs failed:', {
        openaiError: openaiError.message,
        geminiError: geminiError.message,
      });
      throw new Error('Failed to generate recipes with both APIs');
    }
  }
}

function parseRecipes(content: string): ProcessedRecipeResponse[] {
  try {
    const recipes = JSON.parse(content);
    if (!Array.isArray(recipes)) {
      console.error('[Error] Expected array of recipes, got:', typeof recipes);
      return [];
    }
    return recipes;
  } catch (error) {
    console.error('[Error] Failed to parse recipes:', error);
    throw new Error('Invalid recipe format');
  }
}

function isValidRecipe(recipe: any): recipe is ProcessedRecipeResponse {
  if (!recipe || typeof recipe !== 'object') {
    console.error('[Error] Invalid recipe object:', recipe);
    return false;
  }

  if (!recipe.title || typeof recipe.title !== 'string') {
    console.error('[Error] Recipe missing or invalid title');
    return false;
  }

  if (!Array.isArray(recipe.ingredients)) {
    console.error('[Error] Recipe missing or invalid ingredients array');
    return false;
  }

  if (!Array.isArray(recipe.instructions)) {
    console.error('[Error] Recipe missing or invalid instructions array');
    return false;
  }

  if (typeof recipe.prepTime !== 'number') {
    console.error('[Error] Recipe missing or invalid prepTime');
    return false;
  }

  if (typeof recipe.cookTime !== 'number') {
    console.error('[Error] Recipe missing or invalid cookTime');
    return false;
  }

  if (typeof recipe.servings !== 'number') {
    console.error('[Error] Recipe missing or invalid servings');
    return false;
  }

  if (!Array.isArray(recipe.tags)) {
    console.error('[Error] Recipe missing or invalid tags array');
    return false;
  }

  return true;
}
