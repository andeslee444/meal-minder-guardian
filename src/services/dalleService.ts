import { Recipe } from '@/types/recipe';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Choose the API endpoint based on environment
const IS_LOCAL_FUNCTION =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const LOCAL_FUNCTION_URL = 'http://127.0.0.1:54321/functions/v1/dalle-image-gen';
const DEPLOYED_FUNCTION_URL = 'http://127.0.0.1:54321/functions/v1/dalle-image-gen';

// Use the appropriate URL based on environment
const DALLE_FUNCTION_URL = IS_LOCAL_FUNCTION ? LOCAL_FUNCTION_URL : DEPLOYED_FUNCTION_URL;

// Always use the current window origin for requests
const ORIGIN_HEADER = window.location.origin;

console.log(`[DALL-E Service] Using function URL: ${DALLE_FUNCTION_URL}`);
console.log(
  `[DALL-E Service] Environment: ${window.location.hostname}, Using local: ${IS_LOCAL_FUNCTION}`
);
console.log(`[DALL-E Service] Using origin header: ${ORIGIN_HEADER}`);

// Use a production-ready approach by using recipe-specific fallback images
const FALLBACK_IMAGES = {
  pasta:
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop',
  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2999&auto=format&fit=crop',
  stew: 'https://images.unsplash.com/photo-1608500218890-c7b437f094f7?q=80&w=2070&auto=format&fit=crop',
  stirFry:
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop',
  vegetable:
    'https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?q=80&w=2070&auto=format&fit=crop',
  breakfast:
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=2070&auto=format&fit=crop',
  dinner:
    'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?q=80&w=2070&auto=format&fit=crop',
  salad:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
  default:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2070&auto=format&fit=crop',
};

// Get fallback image based on recipe title
const getFallbackImage = (recipe: Recipe): string => {
  const lowerTitle = recipe.title.toLowerCase();

  if (
    lowerTitle.includes('pasta') ||
    lowerTitle.includes('spaghetti') ||
    lowerTitle.includes('noodle')
  )
    return FALLBACK_IMAGES.pasta;
  if (lowerTitle.includes('burger') || lowerTitle.includes('sandwich'))
    return FALLBACK_IMAGES.burger;
  if (lowerTitle.includes('stew') || lowerTitle.includes('soup')) return FALLBACK_IMAGES.stew;
  if (lowerTitle.includes('stir-fry') || lowerTitle.includes('stir fry'))
    return FALLBACK_IMAGES.stirFry;
  if (
    lowerTitle.includes('vegetable') ||
    lowerTitle.includes('roasted') ||
    lowerTitle.includes('baked')
  )
    return FALLBACK_IMAGES.vegetable;
  if (
    lowerTitle.includes('breakfast') ||
    lowerTitle.includes('scramble') ||
    lowerTitle.includes('egg')
  )
    return FALLBACK_IMAGES.breakfast;
  if (lowerTitle.includes('dinner') || lowerTitle.includes('pot')) return FALLBACK_IMAGES.dinner;
  if (lowerTitle.includes('salad')) return FALLBACK_IMAGES.salad;

  return FALLBACK_IMAGES.default;
};

// Track pending requests to avoid duplicate generation attempts
const pendingRequests = new Map<string, Promise<string>>();
const MAX_CONCURRENT_REQUESTS = 2;
const MAX_RETRIES = 2;

interface DalleResponse {
  imageUrl: string;
}

// SVG fallback for when everything fails
const SVG_FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIHVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

// Cache management helpers
const getFromCache = (key: string): string | null => {
  try {
    const cached = localStorage.getItem(`dalle-cache:${key}`);
    if (cached) {
      // Only return the cached value if it's a data URL or our fallback
      if (cached.startsWith('data:') || cached.startsWith('http')) {
        return cached;
      }
      // Remove invalid cache entries
      localStorage.removeItem(`dalle-cache:${key}`);
    }
  } catch (error) {
    console.error('[DALL-E] Cache error:', error);
  }
  return null;
};

const saveToCache = (key: string, dataUrl: string): void => {
  try {
    if (dataUrl && (dataUrl.startsWith('data:') || dataUrl.startsWith('http'))) {
      localStorage.setItem(`dalle-cache:${key}`, dataUrl);
    }
  } catch (error) {
    console.error('[DALL-E] Cache save error:', error);
  }
};

// A debug mode function to test the DALL-E service directly without using a recipe
export const testDalleService = async (): Promise<string> => {
  console.log('[DALL-E] Testing service with debug mode');

  const testPrompt = 'A delicious burger with fries';
  const cachedUrl = getFromCache(testPrompt);
  if (cachedUrl) return cachedUrl;

  try {
    const response = await fetch(DALLE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-application-name': 'meal-minder-guardian',
        Origin: window.location.origin,
      },
      body: JSON.stringify({
        prompt: testPrompt,
        debug: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DALL-E test failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as DalleResponse;
    if (!data.imageUrl) {
      throw new Error('No image URL in test response');
    }

    saveToCache(testPrompt, data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('[DALL-E] Test error:', error);
    return FALLBACK_IMAGES.burger;
  }
};

const generateImage = async (prompt: string): Promise<string> => {
  // Don't allow empty prompts
  if (!prompt || prompt.trim() === '') {
    console.error('[DALL-E] Empty prompt provided');
    return SVG_FALLBACK_IMAGE;
  }

  // Check for cached image first
  const cachedImage = getFromCache(prompt);
  if (cachedImage) {
    console.log('[DALL-E] Using cached image');
    return cachedImage;
  }

  // Check if we're already generating this image
  if (pendingRequests.has(prompt)) {
    console.log('[DALL-E] Already generating image for:', prompt.substring(0, 30) + '...');
    return pendingRequests.get(prompt)!;
  }

  // Check if we have too many concurrent requests
  if (pendingRequests.size >= MAX_CONCURRENT_REQUESTS) {
    console.log('[DALL-E] Too many concurrent requests, using fallback');
    return SVG_FALLBACK_IMAGE;
  }

  // Create a new request promise
  const requestPromise = (async () => {
    try {
      const doRequest = async (): Promise<string> => {
        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
          try {
            console.log(`[DALL-E] Generating new image for prompt: ${prompt.substring(0, 30)}...`);
            console.log(`[DALL-E] Making request to: ${DALLE_FUNCTION_URL}`);
            console.log(`[DALL-E] With headers:`, {
              'Content-Type': 'application/json',
              'x-application-name': 'meal-minder-guardian',
              Origin: window.location.origin,
            });

            const response = await fetch(DALLE_FUNCTION_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-application-name': 'meal-minder-guardian',
                Origin: window.location.origin,
              },
              body: JSON.stringify({ prompt, debug: true }), // Use debug mode to avoid OpenAI API calls
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`[DALL-E] Generation failed: ${response.status} - ${errorText}`);
              throw new Error(`Request failed with status ${response.status}`);
            }

            const data = (await response.json()) as DalleResponse;
            if (!data.imageUrl) {
              console.error('[DALL-E] No image URL in response');
              throw new Error('No image URL in response');
            }

            // Cache and return the image URL
            saveToCache(prompt, data.imageUrl);
            return data.imageUrl;
          } catch (error) {
            console.error(
              `[DALL-E] Generation error (attempt ${attempt}/${MAX_RETRIES + 1}):`,
              error
            );

            if (attempt <= MAX_RETRIES) {
              // Exponential backoff: 1s, 2s
              const delay = attempt * 1000;
              console.log(`[DALL-E] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms delay`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              console.log('[DALL-E] All retries failed, using fallback image');
              return SVG_FALLBACK_IMAGE;
            }
          }
        }

        // This should never be reached due to the loop structure, but TypeScript needs it
        return SVG_FALLBACK_IMAGE;
      };

      return await doRequest();
    } finally {
      // Always remove from pending requests when done
      pendingRequests.delete(prompt);
    }
  })();

  // Store the promise so we can reuse it for duplicate requests
  pendingRequests.set(prompt, requestPromise);
  return requestPromise;
};

export const generateRecipeImage = async (recipe: Recipe): Promise<string> => {
  if (!recipe || !recipe.title) {
    console.error('[DALL-E] Invalid recipe provided');
    return SVG_FALLBACK_IMAGE;
  }

  // Use a recipe-specific unique key
  const recipeId = recipe.id || `recipe-${recipe.title.replace(/\s+/g, '-').toLowerCase()}`;
  const cacheKey = `recipe:${recipeId}`;

  // Check for cached image first
  const cachedImage = getFromCache(cacheKey);
  if (cachedImage) {
    console.log(`[DALL-E] Using cached image for recipe: ${recipe.title}`);
    return cachedImage;
  }

  try {
    // Create a prompt using available ingredients or just the title
    let ingredientsText = '';
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      ingredientsText = recipe.ingredients.map(ing => ing.name).join(', ');
    } else {
      ingredientsText = 'fresh ingredients';
    }

    const prompt = `Professional food photography of ${recipe.title}. A delicious dish with ${ingredientsText}. Vibrant colors, studio lighting, shallow depth of field, mouth-watering presentation on a beautiful plate, 4k HD.`;

    console.log(`[DALL-E] Generating image for recipe: ${recipe.title}`);

    // Try to use the DALL-E function, with retry logic
    try {
      const imageUrl = await generateImage(prompt);

      // Always store in cache with recipe-specific key
      saveToCache(cacheKey, imageUrl);

      return imageUrl;
    } catch (dalleError) {
      console.error(
        `[DALL-E] Error generating image through API for "${recipe.title}":`,
        dalleError
      );

      // If DALL-E generation fails, fall back to a relevant image based on recipe type
      const fallbackImageUrl = getFallbackImage(recipe);

      // Cache the fallback image
      saveToCache(cacheKey, fallbackImageUrl);
      console.log(`[DALL-E] Using fallback image for recipe: ${recipe.title}`);

      return fallbackImageUrl;
    }
  } catch (error) {
    console.error(`[DALL-E] Recipe image error for "${recipe.title}":`, error);
    return SVG_FALLBACK_IMAGE;
  }
};

export default {
  generateImage,
  generateRecipeImage,
  testDalleService,
};
