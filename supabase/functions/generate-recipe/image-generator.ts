import { corsHeaders } from './index.ts';

// Timeout configuration
const IMAGE_REQUEST_TIMEOUT = 20000; // Increased to 20 seconds for more reliable generation
const MAX_RETRIES = 2;
const BACKOFF_BASE = 1500; // Starting backoff time in ms

/**
 * Check if a recipe is of a problematic type known to have image issues
 */
function isProblematicRecipe(recipeTitle: string): boolean {
  if (!recipeTitle) return false;

  const title = recipeTitle.toLowerCase();

  // Check for problematic recipe types
  const problematicKeywords = [
    'chocolate',
    'cocoa',
    'brownie',
    'cupcake',
    'ganache',
    'fudge',
    'molten',
    'cookie',
    'cake',
    'dessert',
    'pudding',
    'sweet',
  ];

  // Check if any problematic keyword is in the title
  if (problematicKeywords.some(keyword => title.includes(keyword))) {
    return true;
  }

  // Check for "peanut butter" combination
  if (title.includes('peanut') && title.includes('butter')) {
    return true;
  }

  return false;
}

/**
 * Creates an optimized prompt for food image generation
 */
function createFoodImagePrompt(recipeTitle: string): string {
  const basePrompt = `A professional food photography image of ${recipeTitle}`;

  // Build description based on recipe type
  const title = recipeTitle.toLowerCase();
  let description = '';

  if (title.includes('soup') || title.includes('stew')) {
    description = 'in a beautiful ceramic bowl, steam rising, with a garnish on top';
  } else if (title.includes('salad')) {
    description = 'in a wide bowl, vibrant fresh ingredients, with a light dressing';
  } else if (title.includes('pasta')) {
    description = 'in a white plate, perfectly cooked, with herbs and parmesan';
  } else if (title.includes('chicken') || title.includes('beef') || title.includes('pork')) {
    description = 'on a wooden serving board, perfectly cooked, with garnish';
  } else if (title.includes('breakfast') || title.includes('toast')) {
    description = 'on a rustic plate, with perfect presentation, morning light';
  } else if (title.includes('sandwich') || title.includes('burger')) {
    description = 'on a wooden board, with ingredients visible, appetizing';
  } else {
    description = 'on a beautiful plate, with perfect garnish';
  }

  // Photography attributes
  const attributes =
    'with professional lighting, shallow depth of field, high-end food magazine quality, no text, photorealistic, high resolution';

  return `${basePrompt} ${description}, ${attributes}`;
}

/**
 * Get an optimized fallback image URL from Unsplash
 */
function getUnsplashFallbackUrl(title: string): string {
  const keywords = extractKeywords(title);
  const normalizedTitle = title.toLowerCase();

  // Use specialized URLs for common recipe types
  if (
    normalizedTitle.includes('chocolate') ||
    normalizedTitle.includes('cocoa') ||
    normalizedTitle.includes('brownie')
  ) {
    return `https://source.unsplash.com/featured/?chocolate,dessert,cake,food,gourmet`;
  }

  if (normalizedTitle.includes('soup')) {
    return `https://source.unsplash.com/featured/?soup,bowl,food,gourmet`;
  }

  if (normalizedTitle.includes('salad')) {
    return `https://source.unsplash.com/featured/?salad,fresh,food,gourmet`;
  }

  if (normalizedTitle.includes('pasta')) {
    return `https://source.unsplash.com/featured/?pasta,italian,food,gourmet`;
  }

  if (normalizedTitle.includes('chicken')) {
    return `https://source.unsplash.com/featured/?chicken,dish,food,gourmet`;
  }

  if (normalizedTitle.includes('cupcake')) {
    return `https://source.unsplash.com/featured/?cupcake,dessert,baking,food`;
  }

  if (normalizedTitle.includes('peanut') && normalizedTitle.includes('butter')) {
    return `https://source.unsplash.com/featured/?peanut,butter,food,dessert`;
  }

  // For other recipes, use keywords from the title
  const encodedKeywords = encodeURIComponent(keywords.slice(0, 3).join(',') + ',food,gourmet');

  // Use the featured collection for higher quality images
  return `https://source.unsplash.com/featured/?${encodedKeywords}`;
}

/**
 * Extract keywords from a recipe title
 */
function extractKeywords(title: string): string[] {
  // Remove common words and keep only significant food-related terms
  const words = title
    .toLowerCase()
    .replace(/and|with|the|a|an|of|for|in|on|by|to|from/g, ' ')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Get unique words
  return [...new Set(words)];
}

/**
 * Implements exponential backoff retry logic
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }

      const backoffTime = BACKOFF_BASE * Math.pow(2, retries);
      console.log(
        `Retry attempt ${retries + 1}/${maxRetries}. Waiting ${backoffTime}ms before next attempt.`
      );

      await new Promise(resolve => setTimeout(resolve, backoffTime));
      retries++;
    }
  }
}

/**
 * Generates an image for a recipe using OpenAI
 * @param recipeTitle The title of the recipe
 * @returns The URL of the generated image, or null if generation failed
 */
export async function generateRecipeImage(recipeTitle: string): Promise<string | null> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  // Use the centralized function to detect problematic recipes
  const isProblematic = isProblematicRecipe(recipeTitle);

  // Skip DALL-E for problematic recipes and use Unsplash directly
  if (isProblematic) {
    console.log(`Skipping DALL-E for problematic recipe type: ${recipeTitle}`);
    return getUnsplashFallbackUrl(recipeTitle);
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key is not configured');
    return getUnsplashFallbackUrl(recipeTitle);
  }

  try {
    // Create an optimized prompt for better image quality
    const prompt = createFoodImagePrompt(recipeTitle);

    console.log(`Generating image for recipe: ${recipeTitle}`);
    console.log(`Using optimized prompt: ${prompt}`);

    // Retry with exponential backoff
    return await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT);

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIApiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'natural',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Image generation failed with status ${response.status}: ${errorBody}`);
          throw new Error(`Image generation failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data[0] || !data.data[0].url) {
          console.error('OpenAI response missing image URL:', data);
          throw new Error('Missing image URL in response');
        }

        console.log(`Successfully generated image: ${data.data[0].url}`);

        // Verify the URL is valid by making a HEAD request
        try {
          const urlCheckResponse = await fetch(data.data[0].url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
          });

          if (!urlCheckResponse.ok) {
            console.warn(`Generated image URL failed validation: ${data.data[0].url}`);
            return getUnsplashFallbackUrl(recipeTitle);
          }
        } catch (urlError) {
          console.warn(`Error validating image URL: ${urlError.message}`);
          // Continue anyway - we'll trust the OpenAI URL
        }

        return data.data[0].url;
      } catch (abortError) {
        clearTimeout(timeoutId);
        if (abortError.name === 'AbortError') {
          console.error(`Image generation request timed out after ${IMAGE_REQUEST_TIMEOUT}ms`);
          throw abortError; // Let the retry mechanism handle it
        }
        throw abortError;
      }
    }, MAX_RETRIES);
  } catch (error) {
    console.error('Error generating recipe image after all retries:', error);
    return getUnsplashFallbackUrl(recipeTitle);
  }
}
