import { getSuccessfulImagesCache, getFailedImagesCache } from './cacheService';

/**
 * Check if an image URL is known to load successfully
 */
export const isKnownSuccessfulImage = (url: string): boolean => {
  // Handle empty URLs
  if (!url) return false;

  // Direct cache check
  if (getSuccessfulImagesCache().has(url)) return true;

  // Handle some special cases for Spoonacular images that we know work
  if (
    url.includes('spoonacular.com/recipes') &&
    (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png'))
  ) {
    return true;
  }

  // Check for Unsplash URLs which are generally reliable
  if (url.includes('source.unsplash.com') || url.includes('images.unsplash.com')) {
    return true;
  }

  return false;
};

/**
 * Check if an image URL is known to fail loading
 */
export const isKnownFailedImage = (url: string): boolean => {
  // Handle empty URLs
  if (!url) return true;

  // Direct cache check
  if (getFailedImagesCache().has(url)) return true;

  // Known problematic URL patterns
  const problematicPatterns = [
    '.ico', // ICO files often don't render properly
    'undefined',
    'null',
    'NaN',
    'no-image',
    '404',
    'error',
  ];

  // Check for problematic patterns
  if (problematicPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }

  // Check for very short URLs which are likely invalid
  if (url.length < 10 && !url.startsWith('/')) {
    return true;
  }

  return false;
};

/**
 * Pre-validate an image URL before attempting to load it
 * @returns true if the URL appears to be valid, false otherwise
 */
export const preValidateImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  // Check cache first
  if (isKnownSuccessfulImage(url)) return true;
  if (isKnownFailedImage(url)) return false;

  try {
    // Attempt to parse the URL
    new URL(url);

    // Check for common image file extensions
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(url.toLowerCase());

    // Check for image hosting domains
    const isImageHosting =
      url.includes('unsplash.com') ||
      url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
      url.includes('spoonacular.com') ||
      url.includes('imgur.com') ||
      url.includes('cloudinary.com');

    // If it's an API URL but doesn't have an image extension, it's still likely valid
    return hasImageExtension || isImageHosting || url.startsWith('/');
  } catch (e) {
    // Invalid URL format
    return false;
  }
};
