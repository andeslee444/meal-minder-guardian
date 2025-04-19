import { apiPost, type ApiResponse } from '@/api/client';
import { getEnv } from '@/config/environment';

export interface DalleGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}

export interface DalleGenerationResponse {
  created: number;
  data: {
    url: string;
    b64_json?: string;
  }[];
}

/**
 * DALL-E API endpoints
 */
export const DALLE_ENDPOINTS = {
  // Function that returns the appropriate endpoint based on environment
  GENERATE_IMAGE: () => `${getEnv('VITE_SUPABASE_FUNCTIONS_URL', '')}/dalle-image-generation`,
};

/**
 * Generate an image using DALL-E
 */
export async function generateImage(
  prompt: string,
  options: Partial<DalleGenerationRequest> = {}
): Promise<ApiResponse<DalleGenerationResponse>> {
  const requestData: DalleGenerationRequest = {
    prompt,
    size: options.size || '1024x1024',
    n: options.n || 1,
  };

  const response = await apiPost<DalleGenerationResponse>(
    DALLE_ENDPOINTS.GENERATE_IMAGE(),
    requestData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getEnv('VITE_SUPABASE_ANON_KEY', '')}`,
      },
      // Increase retries for image generation due to occasional timeouts
      retries: 2,
      retryDelay: 2000,
    }
  );

  return response;
}

/**
 * Preset of fallback images by category
 */
export const FALLBACK_IMAGES = {
  DEFAULT: '/images/fallback/default-recipe.jpg',
  VEGETARIAN: '/images/fallback/vegetarian-recipe.jpg',
  DESSERT: '/images/fallback/dessert-recipe.jpg',
  BREAKFAST: '/images/fallback/breakfast-recipe.jpg',
  LUNCH: '/images/fallback/lunch-recipe.jpg',
  DINNER: '/images/fallback/dinner-recipe.jpg',
  SNACK: '/images/fallback/snack-recipe.jpg',
  DRINK: '/images/fallback/drink-recipe.jpg',
};

/**
 * Get an appropriate fallback image based on recipe title or category
 */
export function getFallbackImage(title: string = '', category: string = ''): string {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Check category first
  if (
    lowerCategory.includes('dessert') ||
    lowerTitle.includes('dessert') ||
    lowerTitle.includes('cake') ||
    lowerTitle.includes('cookie') ||
    lowerTitle.includes('pie') ||
    lowerTitle.includes('sweet')
  ) {
    return FALLBACK_IMAGES.DESSERT;
  }

  if (
    lowerCategory.includes('vegetarian') ||
    lowerCategory.includes('vegan') ||
    lowerTitle.includes('vegetarian') ||
    lowerTitle.includes('vegan') ||
    lowerTitle.includes('salad')
  ) {
    return FALLBACK_IMAGES.VEGETARIAN;
  }

  if (
    lowerCategory.includes('breakfast') ||
    lowerTitle.includes('breakfast') ||
    lowerTitle.includes('pancake') ||
    lowerTitle.includes('waffle') ||
    lowerTitle.includes('egg') ||
    lowerTitle.includes('oatmeal')
  ) {
    return FALLBACK_IMAGES.BREAKFAST;
  }

  if (
    lowerCategory.includes('lunch') ||
    lowerTitle.includes('lunch') ||
    lowerTitle.includes('sandwich') ||
    lowerTitle.includes('wrap')
  ) {
    return FALLBACK_IMAGES.LUNCH;
  }

  if (
    lowerCategory.includes('dinner') ||
    lowerTitle.includes('dinner') ||
    lowerTitle.includes('roast') ||
    lowerTitle.includes('steak') ||
    lowerTitle.includes('pasta')
  ) {
    return FALLBACK_IMAGES.DINNER;
  }

  if (
    lowerCategory.includes('snack') ||
    lowerTitle.includes('snack') ||
    lowerTitle.includes('bite') ||
    lowerTitle.includes('chip')
  ) {
    return FALLBACK_IMAGES.SNACK;
  }

  if (
    lowerCategory.includes('drink') ||
    lowerCategory.includes('beverage') ||
    lowerTitle.includes('drink') ||
    lowerTitle.includes('beverage') ||
    lowerTitle.includes('smoothie') ||
    lowerTitle.includes('juice') ||
    lowerTitle.includes('cocktail') ||
    lowerTitle.includes('tea') ||
    lowerTitle.includes('coffee')
  ) {
    return FALLBACK_IMAGES.DRINK;
  }

  // Default fallback
  return FALLBACK_IMAGES.DEFAULT;
}

/**
 * Generate an image with fallback handling
 */
export async function generateImageWithFallback(
  prompt: string,
  options: {
    title?: string;
    category?: string;
    size?: '256x256' | '512x512' | '1024x1024';
  } = {}
): Promise<string> {
  try {
    const response = await generateImage(prompt, {
      size: options.size,
    });

    if (response.error || !response.data || !response.data.data[0]?.url) {
      console.warn('DALL-E image generation failed, using fallback image', response.error);
      return getFallbackImage(options.title, options.category);
    }

    return response.data.data[0].url;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    return getFallbackImage(options.title, options.category);
  }
}
