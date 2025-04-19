/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
/**
 * Hyper-optimized OpenAI client for recipe generation
 */
import { RecipeResponse, OpenAIResponse } from './types.ts';
import { ENV } from './env.ts';
import { createPrompt } from './prompt-builder.ts';

const CONFIG = {
  OPENAI: {
    API_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-3.5-turbo',
    TEMPERATURE: 0.7,
    TEMPERATURE_MAX: 0.7,
    TEMPERATURE_MIN: 0.7,
    TOP_P: 0.8,
    MAX_TOKENS: 2000,
    TIMEOUT: 120000, // 2 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
    MAX_RETRY_DELAY: 10000,
    BATCH_SIZE: 3,
    REQUEST_OPTIONS: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      keepAlive: true,
      timeout: 120000,
      duplex: 'half',
    },
  },
  CACHE: {
    MAX_SIZE: 100,
    EXPIRY_TIME: 30 * 60 * 1000, // 30 minutes
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  },
  MAX_RECIPES: 6,
};

// Cache for storing recipe responses
const recipeCache = new Map<string, { data: RecipeResponse[]; timestamp: number }>();

/**
 * Prune old cache entries and enforce size limit
 */
function pruneCache() {
  const now = Date.now();

  // Remove expired entries
  for (const [key, value] of recipeCache.entries()) {
    if (now - value.timestamp > CONFIG.CACHE.EXPIRY_TIME) {
      recipeCache.delete(key);
    }
  }

  // If still over size limit, remove oldest entries
  if (recipeCache.size > CONFIG.CACHE.MAX_SIZE) {
    const entries = Array.from(recipeCache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    const entriesToRemove = entries.slice(0, recipeCache.size - CONFIG.CACHE.MAX_SIZE);
    for (const [key] of entriesToRemove) {
      recipeCache.delete(key);
    }
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callOpenAIWithRetry(prompt: string): Promise<RecipeResponse[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.OPENAI.RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(
        `[Info] Attempting OpenAI API call (attempt ${attempt}/${CONFIG.OPENAI.RETRY_ATTEMPTS})`
      );

      const response = await fetch(CONFIG.OPENAI.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.OPENAI.MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a recipe generation assistant that ONLY responds with valid JSON arrays containing recipe objects. Never include any explanatory text, markdown, or non-JSON content in your response.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: CONFIG.OPENAI.TEMPERATURE,
          max_tokens: CONFIG.OPENAI.MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in response');
        }

        const recipes = JSON.parse(jsonMatch[0]) as RecipeResponse[];
        if (!Array.isArray(recipes)) {
          throw new Error('Response is not an array of recipes');
        }
        return recipes;
      } catch (parseError) {
        console.error('[Error] Failed to parse OpenAI response:', parseError);
        throw new Error('Invalid recipe format in response');
      }
    } catch (error) {
      lastError = error as Error;
      console.error(
        `[Error] OpenAI API call failed (attempt ${attempt}/${CONFIG.OPENAI.RETRY_ATTEMPTS}):`,
        error
      );

      if (attempt < CONFIG.OPENAI.RETRY_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, attempt), CONFIG.OPENAI.MAX_RETRY_DELAY);
        console.log(`[Info] Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Failed to generate recipes after all retries');
}

async function batchGenerateRecipes(
  ingredients: string[],
  numRecipes: number,
  options: {
    filterMode?: string;
    existingRecipes?: string[];
    generateMultiple?: boolean;
    partialRecipe?: boolean;
  } = {}
): Promise<RecipeResponse[]> {
  const batches = Math.ceil(numRecipes / CONFIG.OPENAI.BATCH_SIZE);
  const results: RecipeResponse[] = [];

  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(CONFIG.OPENAI.BATCH_SIZE, numRecipes - results.length);
    const prompt = createPrompt(ingredients, batchSize, options);

    try {
      const response = await callOpenAIWithRetry(prompt);
      results.push(...response);

      // If we have enough recipes, stop
      if (results.length >= numRecipes) {
        break;
      }

      // Add a small delay between batches to avoid rate limits
      if (i < batches - 1) {
        await sleep(1000);
      }
    } catch (error) {
      console.error(`[Error] Batch ${i + 1}/${batches} failed:`, error);
      throw error;
    }
  }

  return results.slice(0, numRecipes);
}

export async function callOpenAI(
  ingredients: string[],
  numRecipes: number = CONFIG.MAX_RECIPES,
  options: {
    filterMode?: string;
    existingRecipes?: string[];
    generateMultiple?: boolean;
    partialRecipe?: boolean;
  } = {}
): Promise<RecipeResponse[]> {
  // Generate cache key
  const cacheKey = generateCacheKey(ingredients, options.filterMode, numRecipes);

  // Check cache first
  const cached = recipeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE.EXPIRY_TIME) {
    console.log('[Info] Returning cached recipes');
    return cached.data;
  }

  // Generate recipes in batches
  const recipes = await batchGenerateRecipes(ingredients, numRecipes, options);

  // Cache the results
  recipeCache.set(cacheKey, {
    data: recipes,
    timestamp: Date.now(),
  });

  return recipes;
}

/**
 * Generates a prompt for the OpenAI API
 */
function generatePrompt(
  ingredients: string[],
  numRecipes: number,
  options: {
    filterMode?: string;
    existingRecipes?: string[];
    generateMultiple?: boolean;
    partialRecipe?: boolean;
  } = {}
): string {
  const {
    filterMode,
    existingRecipes = [],
    generateMultiple = false,
    partialRecipe = false,
  } = options;

  console.log('[Info] Creating prompt with ingredients:', ingredients);

  let prompt = `Create ${numRecipes} recipe${numRecipes === 1 ? '' : 's'} using these ingredients: ${ingredients.join(', ')}. `;

  if (filterMode) {
    prompt += `Focus on ${filterMode.toLowerCase()} recipes. `;
  }

  if (existingRecipes.length > 0) {
    prompt += `Avoid these existing recipes: ${existingRecipes.join(', ')}. `;
  }

  if (partialRecipe) {
    prompt += 'You may use additional ingredients not listed. ';
  } else {
    prompt +=
      'Use ingredients from this list as primary ingredients. You may add common ingredients as needed. ';
  }

  prompt += `\n\nReturn recipes in this JSON format:
[
  {
    "title": "Recipe Title",
    "ingredients": [
      {"name": "ingredient 1", "quantity": "1", "unit": "cup"},
      {"name": "ingredient 2", "quantity": "2", "unit": "tablespoons"}
    ],
    "instructions": ["Step 1 instruction", "Step 2 instruction"],
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4,
    "tags": ["tag1", "tag2"]
  }${numRecipes > 1 ? ',\n  ... more recipes for a total of ' + numRecipes + ' recipes' : ''}
]

Return only valid JSON with ${numRecipes} recipe${numRecipes === 1 ? '' : 's'}. Keep instructions concise and focused.`;

  console.log('[Info] Prompt created successfully');
  return prompt;
}

/**
 * Validates a recipe object
 */
function isValidRecipe(recipe: any): recipe is RecipeResponse {
  return (
    typeof recipe === 'object' &&
    recipe !== null &&
    typeof recipe.title === 'string' &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every(
      (ing: any) =>
        typeof ing === 'object' &&
        typeof ing.name === 'string' &&
        typeof ing.quantity === 'string' &&
        typeof ing.unit === 'string'
    ) &&
    Array.isArray(recipe.instructions) &&
    recipe.instructions.every((inst: any) => typeof inst === 'string') &&
    typeof recipe.prepTime === 'number' &&
    typeof recipe.cookTime === 'number' &&
    typeof recipe.servings === 'number' &&
    Array.isArray(recipe.tags) &&
    recipe.tags.every((tag: any) => typeof tag === 'string')
  );
}

/**
 * Parses the OpenAI response into recipe objects
 */
function parseRecipes(content: string): RecipeResponse[] {
  try {
    const data = JSON.parse(content.trim());
    if (!Array.isArray(data)) {
      throw new Error('Response is not an array of recipes');
    }

    return data.filter(isValidRecipe);
  } catch (error) {
    throw new Error(`Failed to parse recipes: ${error.message}`);
  }
}

/**
 * Hash string for cache key
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateCacheKey(ingredients: string[], filterMode?: string, numRecipes?: number): string {
  return hashString(
    JSON.stringify({
      ingredients,
      numRecipes,
      filterMode,
    })
  );
}
