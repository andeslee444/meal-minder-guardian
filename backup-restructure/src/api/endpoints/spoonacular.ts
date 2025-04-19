import { apiGet, type ApiResponse } from '@/api/client';
import { getEnv } from '@/config/environment';
import { endpoints } from '@/config/environment';

/**
 * Interface for recipe search request parameters
 */
export interface RecipeSearchRequest {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  type?: string;
  instructionsRequired?: boolean;
  fillIngredients?: boolean;
  addRecipeInformation?: boolean;
  addRecipeNutrition?: boolean;
  author?: string;
  tags?: string;
  number?: number;
  limitLicense?: boolean;
  offset?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minFat?: number;
  maxFat?: number;
  minCarbs?: number;
  maxCarbs?: number;
}

/**
 * Interface for a recipe
 */
export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  license: string;
  sourceName: string;
  sourceUrl: string;
  spoonacularSourceUrl: string;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: any[];
  cheap: boolean;
  creditsText: string;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  ketogenic: boolean;
  lowFodmap: boolean;
  occasions: string[];
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  extendedIngredients: any[];
  summary: string;
}

/**
 * Interface for recipe search response
 */
export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

/**
 * Interface for recipe by ingredients request
 */
export interface RecipeByIngredientsRequest {
  ingredients: string;
  number?: number;
  limitLicense?: boolean;
  ranking?: number;
  ignorePantry?: boolean;
}

/**
 * Interface for ingredient used in recipe
 */
export interface UsedIngredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  extendedName?: string;
  image: string;
}

/**
 * Interface for recipe by ingredients response item
 */
export interface RecipeByIngredientsResponseItem {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: UsedIngredient[];
  usedIngredients: UsedIngredient[];
  unusedIngredients: UsedIngredient[];
  likes: number;
}

/**
 * Interface for recipe information request
 */
export interface RecipeInformationRequest {
  id: number;
  includeNutrition?: boolean;
}

/**
 * Utility function to append API key to URL
 */
function appendApiKey(url: string): string {
  const apiKey = getEnv('VITE_SPOONACULAR_API_KEY', '');

  // Add API key to the URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}apiKey=${apiKey}`;
}

/**
 * Search for recipes by query and filters
 */
export async function searchRecipes(
  params: RecipeSearchRequest
): Promise<ApiResponse<RecipeSearchResponse>> {
  // Construct URL with query parameters
  let url = endpoints.spoonacularSearch;
  const queryParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  // Add query parameters if provided
  if (queryParams.toString()) {
    url = `${url}?${queryParams.toString()}`;
  }

  // Add API key
  url = appendApiKey(url);

  return apiGet<RecipeSearchResponse>(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    retries: 1,
  });
}

/**
 * Find recipes by ingredients
 */
export async function findRecipesByIngredients(
  params: RecipeByIngredientsRequest
): Promise<ApiResponse<RecipeByIngredientsResponseItem[]>> {
  // Construct URL with query parameters
  let url = endpoints.spoonacularGenerate;
  const queryParams = new URLSearchParams();

  // Add all parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  // Add query parameters if provided
  if (queryParams.toString()) {
    url = `${url}?${queryParams.toString()}`;
  }

  // Add API key
  url = appendApiKey(url);

  return apiGet<RecipeByIngredientsResponseItem[]>(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    retries: 1,
  });
}

/**
 * Get detailed recipe information by ID
 */
export async function getRecipeInformation(
  params: RecipeInformationRequest
): Promise<ApiResponse<Recipe>> {
  // Construct URL with ID
  let url = endpoints.spoonacularInfo.replace('{id}', params.id.toString());

  // Add includeNutrition parameter if provided
  if (params.includeNutrition !== undefined) {
    url = `${url}?includeNutrition=${params.includeNutrition}`;
  }

  // Add API key
  url = appendApiKey(url);

  return apiGet<Recipe>(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    retries: 1,
  });
}
