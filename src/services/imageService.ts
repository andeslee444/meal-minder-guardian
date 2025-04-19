/**
 * Centralized image service for KitchenBuddy
 * Handles image loading, validation, and fallback strategies
 */

import { addStatusMessage } from '@/components/ui/status-indicator';
import { generateUnsplashFallback, getStaticFallback } from './image/fallbackService';
import {
  isProblematicRecipeType,
  shouldUseUnsplashForRecipe,
  getProblematicKeywords,
} from './image/recipeTypeDetection';

// Direct imports to avoid circular dependencies
import { generateDalleImage } from './image/dalleService';
import {
  markImageAsSuccessfulFromCache,
  markImageAsFailedFromCache,
  markImageAsSuccessfulCache,
  markImageAsFailedCache,
  getSuccessfulImagesCache,
  getFailedImagesCache,
} from './image/cacheService';

// Cache of known successful images
const successfulImages = new Map<string, boolean>();
const failedImages = new Map<string, boolean>();

/**
 * Mark an image URL or recipe title as having a successful image
 */
export const markImageAsSuccessful = (key: string): void => {
  successfulImages.set(key, true);
  // Also remove from failed cache if it was there
  failedImages.delete(key);
};

/**
 * Mark an image URL as failed
 */
export const markImageAsFailed = (key: string): void => {
  failedImages.set(key, true);
};

/**
 * Check if we already know this image is successful
 */
export const isKnownSuccessfulImage = (key: string): boolean => {
  return successfulImages.has(key);
};

/**
 * Check if we already know this image has failed
 */
export const isKnownFailedImage = (key: string): boolean => {
  return failedImages.has(key);
};

/**
 * Show a status message about image generation
 */
export const showStatusMessage = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string,
  source: string = 'Image Service'
): void => {
  addStatusMessage(type, message, source);
};

/**
 * Generate a realistic image for a recipe using the optimal strategy
 */
export const generateRealisticRecipeImage = async (
  recipeTitle: string,
  tags: string[] = []
): Promise<string | null> => {
  console.log(`Generating realistic image for recipe: "${recipeTitle}"`);

  // Check if this recipe type is problematic
  const isProblematic = isProblematicRecipeType(recipeTitle);

  // For problematic recipes, skip DALL-E and use Unsplash directly
  if (isProblematic) {
    console.log(`Using Unsplash for problematic recipe type: "${recipeTitle}"`);
    return generateUnsplashFallback(recipeTitle, tags);
  }

  try {
    // First try DALL-E generation
    console.log(`Attempting DALL-E generation for: "${recipeTitle}"`);
    const dalleImage = await generateDalleImage(
      `A professional food photography image of ${recipeTitle}, photorealistic, high resolution, appetizing presentation, on a beautiful plate, with perfect lighting, no text`,
      {
        title: recipeTitle,
        tags,
        timeout: 60000, // 60 second timeout
        maxAttempts: 3,
      }
    );

    if (dalleImage) {
      console.log(`Successfully generated DALL-E image for: "${recipeTitle}"`);
      markImageAsSuccessful(recipeTitle);
      return dalleImage;
    }

    // If DALL-E fails or returns null, use Unsplash
    console.log(`DALL-E failed, using Unsplash fallback for: "${recipeTitle}"`);
    const unsplashImage = await generateUnsplashFallback(recipeTitle, tags);
    if (unsplashImage) {
      markImageAsSuccessful(recipeTitle);
      return unsplashImage;
    }

    // If both DALL-E and Unsplash fail, use static fallback
    console.log(`Both DALL-E and Unsplash failed, using static fallback for: "${recipeTitle}"`);
    return getStaticFallback();
  } catch (error) {
    console.error(`Error generating image for "${recipeTitle}":`, error);
    markImageAsFailed(recipeTitle);

    // Try Unsplash as fallback
    try {
      const unsplashImage = await generateUnsplashFallback(recipeTitle, tags);
      if (unsplashImage) {
        markImageAsSuccessful(recipeTitle);
        return unsplashImage;
      }
    } catch (fallbackError) {
      console.error(`Fallback to Unsplash failed for "${recipeTitle}"`);
    }

    // If all else fails, use static fallback
    return getStaticFallback();
  }
};

// Re-export utility functions from sub-modules for easy access
export {
  isProblematicRecipeType,
  shouldUseUnsplashForRecipe,
  getProblematicKeywords,
} from './image/recipeTypeDetection';

export { generateUnsplashFallback, getStaticFallback } from './image/fallbackService';

// Export DALL-E service function directly
export { generateDalleImage } from './image/dalleService';

// Re-export cache service functions with clear names
export {
  markImageAsSuccessfulFromCache,
  markImageAsFailedFromCache,
  markImageAsSuccessfulCache,
  markImageAsFailedCache,
  getSuccessfulImagesCache,
  getFailedImagesCache,
} from './image/cacheService';
