// Cache for successful image URLs
const successfulImagesCache = new Set<string>();

// Cache for failed image URLs
const failedImagesCache = new Set<string>();

// TTL for cache entries - 1 hour
const CACHE_TTL = 60 * 60 * 1000;

// Initialize caches from localStorage if available
try {
  const cachedSuccessful = localStorage.getItem('successful-images-cache');
  if (cachedSuccessful) {
    const parsedCache = JSON.parse(cachedSuccessful);
    parsedCache.forEach((url: string) => successfulImagesCache.add(url));
    console.log(`Loaded ${successfulImagesCache.size} successful images from cache`);
  }

  const cachedFailed = localStorage.getItem('failed-images-cache');
  if (cachedFailed) {
    const parsedCache = JSON.parse(cachedFailed);
    parsedCache.forEach((url: string) => failedImagesCache.add(url));
    console.log(`Loaded ${failedImagesCache.size} failed images from cache`);
  }
} catch (error) {
  console.error('Error loading image caches from localStorage:', error);
}

// Periodically save caches to localStorage
setInterval(() => {
  try {
    localStorage.setItem(
      'successful-images-cache',
      JSON.stringify(Array.from(successfulImagesCache))
    );
    localStorage.setItem('failed-images-cache', JSON.stringify(Array.from(failedImagesCache)));
  } catch (error) {
    console.error('Error saving image caches to localStorage:', error);
  }
}, 60000);

/**
 * Mark an image URL as successfully loaded
 */
export const markImageAsSuccessful = (url: string): void => {
  if (!url) return;

  successfulImagesCache.add(url);
  failedImagesCache.delete(url); // Remove from failures if it was there
};

/**
 * Mark an image URL as failed to load
 */
export const markImageAsFailed = (url: string): void => {
  if (!url) return;

  // Only add to failed cache if it's not already known to be successful
  if (!successfulImagesCache.has(url)) {
    failedImagesCache.add(url);
  }
};

/**
 * Clear image caches
 */
export const clearImageCaches = (): void => {
  successfulImagesCache.clear();
  failedImagesCache.clear();
  try {
    localStorage.removeItem('successful-images-cache');
    localStorage.removeItem('failed-images-cache');
  } catch (error) {
    console.error('Error clearing image caches from localStorage:', error);
  }
};

/**
 * Access to the internal caches for validation service
 */
export const getSuccessfulImagesCache = (): Set<string> => successfulImagesCache;
export const getFailedImagesCache = (): Set<string> => failedImagesCache;

// Export aliased functions with correct names for imageService.ts
export const markImageAsSuccessfulFromCache = markImageAsSuccessful;
export const markImageAsFailedFromCache = markImageAsFailed;
export const markImageAsSuccessfulCache = markImageAsSuccessful;
export const markImageAsFailedCache = markImageAsFailed;
