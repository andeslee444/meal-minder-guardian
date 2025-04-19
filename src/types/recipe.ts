export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  totalTime?: number;
  servings: number;
  image?: string;
  tags: string[];
  isFavorite?: boolean;
  comments?: RecipeComment[];
}

export interface RecipeComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface RecipeContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addRecipe: (recipe: Recipe) => boolean;
  addMultipleRecipes: (recipes: Recipe[]) => void;
  removeRecipe: (recipeId: string) => void;
  updateRecipe: (recipe: Recipe) => void;
  clearRecipes: () => void;
  toggleFavorite: (recipeId: string) => void;
  getFavoriteRecipes: () => Recipe[];
  getFavoriteCount: () => number;
  getRecipeFavorites: (recipeId: string) => boolean;
  addComment: (recipeId: string, comment: RecipeComment) => Promise<void>;
  getComments: (recipeId: string) => Promise<RecipeComment[]>;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export interface RecipeGenerationProgress {
  isGenerating: boolean;
  current: number;
  total: number;
  percentage: number;
  stage?: string;
  statusMessage?: string;
  thinkingPoints?: string[];
  preferences?: string[];
  dietaryInfo?: string[];
  cuisineStyles?: string[];
}

export interface RecipeGenerationError {
  message: string;
  recoverable: boolean;
  source?: string;
  retryable?: boolean;
  type?: string;
  error?: Error;
}

/**
 * Parameters for recipe generation requests
 */
export interface RecipeGenerationParams {
  ingredients: string[];
  meal_type?: string;
  cuisine_type?: string;
  dietary_restrictions?: string[];
}

/**
 * Model information for recipe generation
 */
export interface ModelInfo {
  provider: string;
  model: string;
  message: string;
}

/**
 * Result of a recipe generation request
 */
export interface RecipeGenerationResult {
  recipes: Recipe[];
  source?: string;
  generationTime?: number;
  prompt?: string;
  modelInfo?: ModelInfo;
}
