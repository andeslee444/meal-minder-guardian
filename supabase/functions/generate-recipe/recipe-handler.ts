/**
 * Hyper-optimized module for handling recipe generation requests
 */
import {
  corsHeaders,
  handleOpenAIError,
  handleValidationError,
  handleGeneralError,
} from './error-handler.ts';
import { CONFIG } from './config.ts';
import { callOpenAI } from './openai-client.ts';
import { rateLimit } from './rate-limiter.ts';
import { RecipeRequest, ProgressUpdate } from './types.ts';

interface RecipeResponse {
  recipes: any[]; // TODO: Define proper recipe type
}

// PERFORMANCE: Pre-create common response headers
const STANDARD_HEADERS = { ...corsHeaders, 'Content-Type': 'application/json' };

/**
 * Validates an ingredient string
 */
function validateIngredient(ingredient: string): boolean {
  const trimmed = ingredient.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && !/<>{}[]\\/.test(trimmed);
}

/**
 * Creates a progress update event
 */
function createProgressUpdate(stage: keyof typeof CONFIG.PROGRESS.STAGES): ProgressUpdate {
  const stageConfig = CONFIG.PROGRESS.STAGES[stage];
  return {
    stage,
    current: stageConfig.current,
    total: stageConfig.total,
    percentage: stageConfig.percentage,
    message: `Processing ${stage.toLowerCase()}...`,
  };
}

/**
 * Handles a request for generating new recipes with extreme performance optimization
 */
export async function handleRecipeGenerationRequest(request: RecipeRequest): Promise<Response> {
  try {
    // Validate request structure immediately
    if (!Array.isArray(request.ingredients) || request.ingredients.length === 0) {
      return handleValidationError(
        new Error('Invalid request: ingredients must be a non-empty array')
      );
    }

    // Validate number of ingredients
    if (request.ingredients.length > CONFIG.MAX_INGREDIENTS) {
      return handleValidationError(
        new Error(`Too many ingredients. Maximum allowed: ${CONFIG.MAX_INGREDIENTS}`)
      );
    }

    // Validate each ingredient
    const invalidIngredients = request.ingredients.filter(ing => !validateIngredient(ing));
    if (invalidIngredients.length > 0) {
      return handleValidationError(
        new Error('Invalid ingredients detected. Please check your input.')
      );
    }

    // Validate numRecipes if provided
    const numRecipes = request.numRecipes || 1;
    if (!Number.isInteger(numRecipes) || numRecipes < 1 || numRecipes > CONFIG.MAX_RECIPES) {
      return handleValidationError(
        new Error(`Invalid number of recipes. Must be between 1 and ${CONFIG.MAX_RECIPES}`)
      );
    }

    // Call OpenAI API with progress updates
    const recipes = await callOpenAI(request.ingredients, numRecipes);

    // Validate the response
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return handleOpenAIError(new Error('Invalid response from OpenAI API'));
    }

    // Return success response with progress update
    return new Response(
      JSON.stringify({
        recipes,
        progress: {
          current: recipes.length,
          total: numRecipes,
          percentage: 100,
          stage: 'Recipes generated successfully!',
          isGenerating: false,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('[Recipe Handler] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return handleValidationError(error);
      } else if (error.message.includes('OpenAI')) {
        return handleOpenAIError(error);
      } else {
        return handleGeneralError(error);
      }
    }

    return handleGeneralError(new Error('An unexpected error occurred'));
  }
}
