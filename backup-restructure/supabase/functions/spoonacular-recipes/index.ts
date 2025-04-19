import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { load } from 'https://deno.land/std@0.208.0/dotenv/mod.ts';

// Load environment variables from .env.local
try {
  const envPath = new URL('../.env.local', import.meta.url);
  await load({ envPath: envPath.pathname });
} catch (error) {
  console.warn('[Warn] Failed to load .env.local file:', error.message);
}

const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define error response types for consistent error handling
interface ErrorResponse {
  error: string;
  status: number;
  code?: string;
  source?: string;
  recoverable?: boolean;
  retryable?: boolean;
}

// Function to create standardized error responses
function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = 'unknown_error',
  source: string = 'spoonacular',
  recoverable: boolean = true,
  retryable: boolean = true
): Response {
  const errorData: ErrorResponse = {
    error: message,
    status,
    code,
    source,
    recoverable,
    retryable,
  };

  console.error(`Error [${code}]: ${message}`);

  return new Response(JSON.stringify(errorData), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// Track Spoonacular API quota status in memory to prevent repeated calls when quota is exceeded
let spoonacularQuotaExceeded = false;
let quotaExceededTimestamp = 0;

// Reset quota status after midnight to allow for new day's quota
function checkAndResetQuotaStatus() {
  const now = new Date();
  const lastQuotaDate = new Date(quotaExceededTimestamp);

  // If it's a new day (after midnight), reset the quota status
  if (
    now.getDate() !== lastQuotaDate.getDate() ||
    now.getMonth() !== lastQuotaDate.getMonth() ||
    now.getFullYear() !== lastQuotaDate.getFullYear()
  ) {
    spoonacularQuotaExceeded = false;
  }
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if we need to reset quota status
    checkAndResetQuotaStatus();

    // If quota was previously exceeded, immediately return quota error
    if (spoonacularQuotaExceeded) {
      return createErrorResponse(
        'Daily Spoonacular API limit reached. Please try again tomorrow.',
        402,
        'quota_exceeded',
        'spoonacular',
        true, // recoverable (can use OpenAI)
        false // not retryable (need to wait for quota reset)
      );
    }

    if (!spoonacularApiKey) {
      console.error('Spoonacular API key is missing. Environment variables:', Deno.env.toObject());
      return createErrorResponse(
        'Spoonacular API key is not configured',
        500,
        'missing_api_key',
        'spoonacular',
        true, // recoverable (can use OpenAI)
        false // not retryable (need to fix config)
      );
    }

    const { endpoint, params } = await req.json();
    console.log('Received request:', { endpoint, params });
    console.log('Using Spoonacular API key:', spoonacularApiKey.substring(0, 4) + '...');

    // Construct the full Spoonacular API URL
    const urlWithParams = new URL(`https://api.spoonacular.com/${endpoint}`);
    // Add API key
    urlWithParams.searchParams.append('apiKey', spoonacularApiKey);
    // Add other params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlWithParams.searchParams.append(key, String(value));
      });
    }

    console.log('Making request to Spoonacular API:', urlWithParams.toString());
    const response = await fetch(urlWithParams.toString());
    console.log('Spoonacular API response status:', response.status);

    if (!response.ok) {
      // Get more details from the error response
      const errorData = await response.json().catch(() => ({}));
      console.error('Spoonacular API error:', errorData);

      // Handle specific error codes
      if (
        response.status === 402 ||
        (errorData && errorData.code === 402) ||
        (errorData && errorData.message && errorData.message.includes('limit'))
      ) {
        // Mark quota as exceeded to prevent further calls
        spoonacularQuotaExceeded = true;
        quotaExceededTimestamp = Date.now();

        return createErrorResponse(
          'Daily Spoonacular API limit reached. Please try again tomorrow.',
          402,
          'quota_exceeded',
          'spoonacular',
          true, // recoverable with OpenAI
          false // not retryable today
        );
      } else if (response.status === 401) {
        return createErrorResponse(
          'Invalid Spoonacular API key or authorization error.',
          401,
          'auth_error',
          'spoonacular',
          true, // recoverable with OpenAI
          false // not retryable without fixing API key
        );
      } else if (response.status === 429) {
        return createErrorResponse(
          'Too many requests to Spoonacular API. Please try again later.',
          429,
          'rate_limit',
          'spoonacular',
          true, // recoverable with OpenAI
          true // retryable after waiting
        );
      }

      // Generic error for other status codes
      return createErrorResponse(
        `Spoonacular API error: ${response.status}`,
        response.status,
        'api_error',
        'spoonacular',
        true,
        response.status < 500 // Only retry server errors, not client errors
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in spoonacular-recipes function:', error);

    let errorMessage = 'An unexpected error occurred while fetching recipes.';
    let errorCode = 'internal_error';
    let recoverable = true;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error while connecting to Spoonacular.';
      errorCode = 'network_error';
      recoverable = true;
    }

    return createErrorResponse(errorMessage, 500, errorCode, 'spoonacular', recoverable, true);
  }
});
