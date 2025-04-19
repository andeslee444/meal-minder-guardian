import { useState, useEffect, useRef } from 'react';

export interface ImageValidationOptions {
  logPrefix?: string;
  skipValidation?: boolean;
  timeoutMs?: number;
}

export interface BasicImageValidationResult {
  imageUrl: string | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Basic image validation hook that checks if an image URL loads properly
 */
export function useBasicImageValidation(
  primaryUrl: string | undefined,
  fallbackUrl: string | null = null,
  options: ImageValidationOptions = {}
): BasicImageValidationResult {
  const {
    logPrefix = 'ImageValidation',
    skipValidation = false,
    timeoutMs = 12000, // Increased timeout to 12 seconds
  } = options;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const loadAttemptedRef = useRef(false);

  useEffect(() => {
    // Reset state when URL changes
    setIsLoading(true);
    setIsError(false);
    loadAttemptedRef.current = false;

    // If no URL is provided, set error state
    if (!primaryUrl) {
      setIsLoading(false);
      setIsError(true);
      setImageUrl(fallbackUrl);
      return;
    }

    // If we're skipping validation, just use the URL as-is
    if (skipValidation) {
      setIsLoading(false);
      setIsError(false);
      setImageUrl(primaryUrl);
      return;
    }

    // Validate the image by loading it
    const img = new Image();
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleSuccess = () => {
      if (loadAttemptedRef.current) return;
      loadAttemptedRef.current = true;

      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsError(false);
      setImageUrl(primaryUrl);
    };

    const handleError = () => {
      if (loadAttemptedRef.current) return;
      loadAttemptedRef.current = true;

      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsError(true);
      setImageUrl(fallbackUrl);
    };

    // Set a timeout to catch hanging loads
    timeoutId = setTimeout(() => {
      if (!loadAttemptedRef.current) {
        handleError();
      }
    }, timeoutMs);

    // Set up event handlers
    img.onload = handleSuccess;
    img.onerror = handleError;

    // Start loading the image
    img.src = primaryUrl;

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [primaryUrl, fallbackUrl, skipValidation, timeoutMs]);

  return {
    imageUrl,
    isLoading,
    isError,
  };
}
