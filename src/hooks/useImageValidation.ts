import {
  useImageValidation as useRefactoredImageValidation,
  ImageFallbackOptions,
  ImageValidationResult,
} from './image';
import { Recipe } from '@/types/recipe';

// Re-export the types for backward compatibility
export type { ImageFallbackOptions, ImageValidationResult };

/**
 * This is a compatibility wrapper around the refactored useImageValidation hook
 * It maintains the same API but uses the new implementation under the hood
 */
export function useImageValidation(
  // Accept recipe object instead of just imageUrl
  recipe: Recipe | null,
  options: ImageFallbackOptions
) {
  // Pass the recipe object and extract imageUrl if needed
  const imageUrl = recipe?.image || null;
  return useRefactoredImageValidation(recipe, {
    ...options,
    // Provide the primary image URL from the recipe to the refactored hook
    primaryImageUrl: imageUrl,
    // Default to DALL-E as the preferred strategy but preserve order if specified
    preferredStrategies: options.preferredStrategies || ['dalle', 'unsplash', 'static'],
    // Default to true for lazyLoadImages to prevent unnecessary DALL-E requests
    lazyLoadImages: options.lazyLoadImages !== undefined ? options.lazyLoadImages : true,
  });
}
