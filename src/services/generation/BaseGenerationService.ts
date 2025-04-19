import { Recipe, RecipeGenerationParams, RecipeGenerationResult } from '@/types/recipe';

/**
 * Base class for recipe generation services
 */
export abstract class BaseGenerationService {
  /**
   * Generate recipes based on provided parameters
   */
  public abstract generateRecipe(
    params: RecipeGenerationParams,
    onProgressUpdate?: (progress: number) => void
  ): Promise<RecipeGenerationResult>;
}
