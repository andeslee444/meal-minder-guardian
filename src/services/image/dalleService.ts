import { statusService } from '../status/status-service';

// Debug mode flag - set to false in production
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

// Improved logger function that respects debug mode
const log = {
  info: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`[DALL-E] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    // Always log errors, but with different levels of detail
    if (DEBUG_MODE) {
      console.error(`[DALL-E] ${message}`, error || '');
    } else {
      // In production, just log the error message without the full stack trace
      console.error(`[DALL-E] ${message}`);
    }
  },
  warn: (message: string) => {
    if (DEBUG_MODE) {
      console.log(`[DALL-E] ${message}`);
    }
  },
};

// Track ongoing DALL-E requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<string | null>>();

export interface DalleOptions {
  retryCount?: number;
  title?: string;
  tags?: string[];
  timeout?: number;
  maxAttempts?: number;
}

/**
 * Test function to verify DALL-E image generation
 */
export async function testDalleImageGeneration(
  title: string,
  tags: string[] = []
): Promise<string | null> {
  log.info(`Testing image generation for: ${title}`);

  try {
    const imageUrl = await generateDalleImage(
      `A professional food photography image of ${title}, photorealistic, high resolution, appetizing presentation, on a beautiful plate, with perfect lighting, no text`,
      {
        title,
        tags,
        timeout: 60000,
        maxAttempts: 3,
      }
    );

    if (imageUrl) {
      log.info(`Successfully generated image for ${title}: ${imageUrl.substring(0, 40)}...`);
      return imageUrl;
    } else {
      log.warn(`Failed to generate image for ${title}, falling back to Unsplash`);
      return null;
    }
  } catch (error) {
    log.error(`Error generating image for ${title}:`, error);
    return null;
  }
}

/**
 * Generates a DALL-E image with retries and fallback handling
 */
export async function generateDalleImage(
  prompt: string,
  options: DalleOptions = {}
): Promise<string | null> {
  const {
    retryCount = 0,
    title = '',
    tags = [],
    timeout = 60000, // Increased timeout to 60 seconds
    maxAttempts = 3,
  } = options;

  // Create a unique key for this request
  const requestKey = `${prompt}:${title}:${tags.join(',')}`;

  // Check if there's already an ongoing request for this prompt
  if (ongoingRequests.has(requestKey)) {
    log.info(`Reusing ongoing request for: ${prompt}`);
    return ongoingRequests.get(requestKey) || null;
  }

  // Create the request promise
  const requestPromise = generateDalleImageInternal(prompt, options);

  // Store the promise in ongoing requests
  ongoingRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clean up the ongoing request
    ongoingRequests.delete(requestKey);
  }
}

/**
 * Internal function to generate a DALL-E image with retries
 */
async function generateDalleImageInternal(
  prompt: string,
  options: DalleOptions
): Promise<string | null> {
  const {
    retryCount = 0,
    title = '',
    tags = [],
    timeout = 60000, // Increased timeout to 60 seconds
    maxAttempts = 3,
  } = options;

  // Use the correct Supabase URL based on environment
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      log.info(`Attempt ${attempt + 1}/${maxAttempts} for: ${prompt}`);

      if (attempt > 0 && DEBUG_MODE) {
        statusService.showInfo(
          `Retrying DALL-E generation (${attempt + 1}/${maxAttempts})...`,
          'DALL-E'
        );
      }

      // Create an AbortController for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          prompt: `high quality photo of ${prompt}, food photography style, on a beautiful plate, studio lighting`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `DALL-E API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('Empty response from DALL-E API');
      }

      // Cache the successful image URL
      const cacheKey = `dalle:${title}:${tags.join(',')}`;
      localStorage.setItem(cacheKey, data.url);

      return data.url;
    } catch (error) {
      log.error(`Attempt ${attempt + 1} failed:`, error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          log.warn(`Request timed out after ${timeout}ms`);
        } else if (error.message.includes('API error')) {
          log.warn(`API error occurred: ${error.message}`);
        }
      }

      if (attempt === maxAttempts - 1) {
        log.warn('All attempts failed, falling back to Unsplash');
        if (DEBUG_MODE) {
          statusService.showWarning('DALL-E generation failed, using fallback image', 'DALL-E');
        }
        return null; // Return null to trigger Unsplash fallback
      }

      // Exponential backoff between retries
      const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
      log.info(`Waiting ${backoffTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }

  return null;
}
