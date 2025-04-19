/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

declare global {
  interface Window {
    Deno: typeof Deno;
  }
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeResponse {
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
}

export interface CacheEntry {
  response: RecipeResponse[];
  timestamp: number;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  filterMode: string;
  numRecipes: number;
  partialRecipes: boolean;
  cacheKey: string;
  existingRecipes: RecipeResponse[];
}

export interface GenerateRecipeResponse {
  recipes: RecipeResponse[];
  error: {
    message: string;
    status: number;
    code: string;
    source: string;
    recoverable: boolean;
    retryable: boolean;
  } | null;
}

export interface ProgressUpdate {
  stage: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
