import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCORSPreflight, setCORSHeaders } from '../_shared/cors.ts';
import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts';

// Log function start - helpful for debugging
console.log('DALL-E Image Generation Function starting up...');

// Load environment variables
const env = await config({ path: './.env.local', safe: true, defaults: './.env' });
console.log('Environment loaded');

// Function configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || env.OPENAI_API_KEY;
const MODEL = Deno.env.get('MODEL') || env.MODEL || 'dall-e-3';
const QUALITY = Deno.env.get('QUALITY') || env.QUALITY || 'standard';
const SIZE = Deno.env.get('SIZE') || env.SIZE || '1024x1024';
const IS_DEV = Deno.env.get('SUPABASE_ENV') === 'dev' || true; // Always true for local development

// Log configuration (without exposing API key)
console.log('Configuration:', {
  model: MODEL,
  quality: QUALITY,
  size: SIZE,
  isDev: IS_DEV,
  hasApiKey: !!OPENAI_API_KEY,
});

// Cache for generated images to prevent duplicate requests
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up expired cache entries periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of imageCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        imageCache.delete(key);
      }
    }
  },
  60 * 60 * 1000
); // Clean up every hour

// Function to implement exponential backoff for retries
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let retries = 0;

  while (true) {
    try {
      const response = await fetch(url, options);

      if (response.ok || retries >= maxRetries) {
        return response;
      }

      // If it's a rate limit error, wait longer
      const retryAfter = response.headers.get('retry-after');
      let waitTime = Math.pow(2, retries) * 1000; // Exponential backoff

      if (retryAfter) {
        waitTime = parseInt(retryAfter, 10) * 1000;
      }

      console.log(`Retry ${retries + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      retries++;
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }

      const waitTime = Math.pow(2, retries) * 1000;
      console.log(`Error, retry ${retries + 1}/${maxRetries} after ${waitTime}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      retries++;
    }
  }
}

// Function to check authorization
function checkAuthorization(req: Request): boolean {
  // In development mode, skip strict auth check
  if (IS_DEV) {
    const origin = req.headers.get('origin');
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('Development mode: relaxed authentication for local request');
      return true;
    }
  }

  // Check for any authorization header for local dev
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    return true;
  }

  // Allow requests with x-application-name header in development
  const appNameHeader = req.headers.get('x-application-name');
  if (IS_DEV && appNameHeader === 'meal-minder-guardian') {
    console.log('Development mode: authorized via application name');
    return true;
  }

  return false;
}

// Main request handler
serve(async req => {
  console.log(
    `Received ${req.method} request from ${req.headers.get('origin') || 'unknown origin'}`
  );

  // CORS preflight request handling
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return handleCORSPreflight();
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.log(`Method not allowed: ${req.method}`);
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
          allowedMethods: ['POST', 'OPTIONS'],
        }),
        {
          status: 405,
          headers: corsHeaders,
        }
      );
    }

    // Check authorization
    if (!checkAuthorization(req)) {
      console.log('Missing authorization');
      return new Response(
        JSON.stringify({
          error: 'Missing authorization header',
          message:
            'In development mode, make sure your request is coming from localhost with proper headers',
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    let prompt;
    try {
      const body = await req.json();
      prompt = body.prompt;
    } catch (error) {
      console.log('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: error.message,
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate request parameters
    if (!prompt) {
      console.log('Missing required parameter: prompt');
      return new Response(
        JSON.stringify({
          error: 'Missing required parameter: prompt',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Check API key
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key is not configured',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log(`Generating image for prompt: ${prompt.substring(0, 50)}...`);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        n: 1,
        quality: QUALITY,
        response_format: 'url',
        size: SIZE,
      }),
    });

    // Handle OpenAI response
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);

      return new Response(
        JSON.stringify({
          error: 'Failed to generate image',
          details: errorData,
        }),
        {
          status: response.status,
          headers: corsHeaders,
        }
      );
    }

    // Extract image URL from response
    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL in OpenAI response:', data);
      return new Response(
        JSON.stringify({
          error: 'No image URL returned from OpenAI',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log('Successfully generated image');

    // Return successful response
    return setCORSHeaders(
      new Response(
        JSON.stringify({
          imageUrl: imageUrl,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
