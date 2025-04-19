import {
  useImageValidation as useRefactoredImageValidation,
  ImageFallbackOptions,
  ImageValidationResult,
} from './image';

// Re-export the types for backward compatibility
export type { ImageFallbackOptions, ImageValidationResult };

/**
 * This is a compatibility wrapper around the refactored useImageValidation hook
 * It maintains the same API but uses the new implementation under the hood
 */
export function useImageValidation(imageUrl: string | undefined, options: ImageFallbackOptions) {
  return useRefactoredImageValidation(imageUrl, {
    ...options,
    // Default to DALL-E as the preferred strategy but preserve order if specified
    preferredStrategies: options.preferredStrategies || ['dalle', 'unsplash', 'static'],
    // Default to true for lazyLoadImages to prevent unnecessary DALL-E requests
    lazyLoadImages: options.lazyLoadImages !== undefined ? options.lazyLoadImages : true,
  });
}
