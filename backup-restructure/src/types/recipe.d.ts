import { Ingredient } from './ingredient';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  calories?: number;
  image?: string;
  imageAlt?: string;
  cuisineType?: string;
  dishType?: string;
  mealType?: string;
  tags?: string[];
  source?: string;
  sourceUrl?: string;
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  rating?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  healthScore?: number;
  userId?: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
}

export interface RecipeGenerationParams {
  ingredients: string[];
  mealType?: string;
  cuisine?: string;
  dietaryRestrictions?: string[];
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
}
