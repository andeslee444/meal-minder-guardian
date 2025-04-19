import { useState, useEffect, useCallback, useRef } from 'react';
import { useBasicImageValidation } from './useBasicImageValidation';
import useFallbackStrategies from './useFallbackStrategies';
import {
  showStatusMessage,
  markImageAsSuccessful,
  markImageAsFailed,
  isKnownSuccessfulImage,
  isKnownFailedImage,
  isProblematicRecipeType,
  shouldUseUnsplashForRecipe,
  generateUnsplashFallback,
} from '@/services/imageService';
import { Recipe } from '@/types/recipe';

// Type definition for image validation options
export type ImageValidationOptions = {
  title: string;
  tags?: string[];
  logPrefix?: string;
  maxRetries?: number;
  staticFallback?: string;
  disableStatusMessages?: boolean;
  lazyLoadImages?: boolean;
};

// Type definition for image validation result
export type ImageValidationResult = {
  displayImage: string;
  isLoading: boolean;
  isError: boolean;
  retryCount: number;
  isFallback: boolean;
  tryNextFallback: () => void;
  enableGeneration: () => void;
};

// Keep track of which images we've already validated to avoid infinite loops
const validatedImages = new Set<string>();

/**
 * A hook that validates images and provides fallback strategies for failed images
 */
export const useImageValidation = (recipe: Recipe | null, primaryImageUrl: string | null) => {
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsFallback, setNeedsFallback] = useState(false);
  const [validationAttempts, setValidationAttempts] = useState(0);

  // Get fallback strategies when needed
  const { fallbackUrl, isLoadingFallback, tryNextFallback } = useFallbackStrategies(recipe);

  // Reset when recipe changes
  useEffect(() => {
    setIsValidated(false);
    setNeedsFallback(false);
    setValidationAttempts(0);
  }, [recipe?.id]);

  // Validate primary image URL
  useEffect(() => {
    if (!recipe || validationAttempts > 3) return;

    const validateImage = async (url: any) => {
      // Only validate if we have a recipe and a URL
      if (!recipe || !url) {
        console.log(`[ImageValidation] Cannot validate: no recipe or URL provided`);
        setNeedsFallback(true);
        return;
      }

      // Make sure URL is a string
      if (typeof url !== 'string') {
        console.error(`[ImageValidation] Invalid URL type:`, url);
        setNeedsFallback(true);
        return;
      }

      // Skip if we've already validated this image
      if (validatedImages.has(url)) {
        console.log(`[ImageValidation] Already validated: ${url.substring(0, 50)}...`);
        setIsValidated(true);
        return;
      }

      setIsLoading(true);
      console.log(`[ImageValidation] Validating image: ${url.substring(0, 50)}...`);

      try {
        // Create a new image to validate the URL
        const img = new Image();

        // Promise to track image loading
        const loadPromise = new Promise<boolean>(resolve => {
          img.onload = () => {
            console.log(`[ImageValidation] Image loaded successfully: ${url.substring(0, 30)}...`);
            validatedImages.add(url);
            resolve(true);
          };

          img.onerror = () => {
            console.error(`[ImageValidation] Image failed to load: ${url.substring(0, 30)}...`);
            resolve(false);
          };
        });

        // Set source after adding event listeners
        img.src = url;

        // Wait for the image to load or timeout after 6 seconds
        const timeoutPromise = new Promise<boolean>(resolve => {
          setTimeout(() => {
            console.warn(`[ImageValidation] Image load timed out: ${url.substring(0, 30)}...`);
            resolve(false);
          }, 6000);
        });

        // If either timeout or image load completes first
        const isValid = await Promise.race([loadPromise, timeoutPromise]);

        if (isValid) {
          setIsValidated(true);
          setNeedsFallback(false);
        } else {
          setNeedsFallback(true);
          setValidationAttempts(prev => prev + 1);
        }
      } catch (error) {
        console.error(`[ImageValidation] Error validating image:`, error);
        setNeedsFallback(true);
        setValidationAttempts(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    };

    // If we need a fallback and don't yet have one, try to get one
    if (needsFallback && !fallbackUrl && !isLoadingFallback) {
      console.log(`[ImageValidation] Triggering fallback for recipe: ${recipe.title}`);
      tryNextFallback();
      return;
    }

    // Don't try to validate if loading is already in progress
    if (isLoading || isLoadingFallback) return;

    // If we have a primary image URL, validate it
    if (primaryImageUrl && !isValidated && !needsFallback) {
      validateImage(primaryImageUrl);
    }
    // If we have a fallback URL, validate it
    else if (fallbackUrl && needsFallback && !isValidated) {
      validateImage(fallbackUrl);
    }
    // If we have neither and need a fallback, try to get one
    else if (!primaryImageUrl && !fallbackUrl && !isLoadingFallback) {
      console.log(`[ImageValidation] No primary image, triggering fallback`);
      setNeedsFallback(true);
      tryNextFallback();
    }
  }, [
    recipe,
    primaryImageUrl,
    fallbackUrl,
    isValidated,
    needsFallback,
    isLoading,
    isLoadingFallback,
    tryNextFallback,
    validationAttempts,
  ]);

  // Return the effective URL based on validation results
  const effectiveImageUrl = needsFallback ? fallbackUrl : isValidated ? primaryImageUrl : null;

  return {
    isValidated,
    isLoading: isLoading || isLoadingFallback,
    needsFallback,
    effectiveImageUrl,
  };
};
