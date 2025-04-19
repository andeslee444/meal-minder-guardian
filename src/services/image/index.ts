// Re-export all image service functionality for backward compatibility
export * from './cacheService';
export * from './fallbackService';
export * from './dalleService';
export * from './statusService';
export * from './validationService';
export * from './recipeTypeDetection';

// Explicitly export the DALL-E function to ensure it's available
export { generateDalleImage } from './dalleService';

// Explicitly export cache functions to ensure they're available
export {
  markImageAsSuccessful,
  markImageAsFailed,
  markImageAsSuccessfulFromCache,
  markImageAsFailedFromCache,
  markImageAsSuccessfulCache,
  markImageAsFailedCache,
  getSuccessfulImagesCache,
  getFailedImagesCache,
} from './cacheService';
