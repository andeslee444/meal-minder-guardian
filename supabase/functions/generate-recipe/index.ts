/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createPrompt } from './prompt-builder.ts';
import { callOpenAIWithRetry } from './openai-client.ts';
import { callGeminiWithRetry } from './gemini-client.ts';
import { handleRecipeGenerationRequest } from './recipe-processor.ts';
import { GenerateRecipeRequest, GenerateRecipeResponse } from './types.ts';
import { ENV } from './env.ts';

console.log('[Info] Starting generate-recipe function');

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check for API key in either apikey or Authorization header
    const apiKey =
      req.headers.get('apikey') || req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      console.error('[Error] Missing API key');
      return new Response(
        JSON.stringify({
          recipes: [],
          error: {
            message: 'Missing API key',
            status: 401,
            code: 'MISSING_API_KEY',
            source: 'generate-recipe',
            recoverable: true,
            retryable: true,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Local development keys
    const localAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const localServiceRoleKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    // Verify API key
    if (
      apiKey !== localAnonKey &&
      apiKey !== localServiceRoleKey &&
      apiKey !== ENV.ANON_KEY &&
      apiKey !== ENV.SERVICE_ROLE_KEY
    ) {
      console.error('[Error] Invalid API key');
      return new Response(
        JSON.stringify({
          recipes: [],
          error: {
            message: 'Invalid API key',
            status: 401,
            code: 'INVALID_API_KEY',
            source: 'generate-recipe',
            recoverable: true,
            retryable: true,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Parse request body
    let requestData: GenerateRecipeRequest;
    try {
      requestData = await req.json();
      console.log('[Info] Request data:', requestData);
    } catch (error) {
      console.error('[Error] Failed to parse request body:', error);
      return new Response(
        JSON.stringify({
          recipes: [],
          error: {
            message: 'Invalid request body',
            status: 400,
            code: 'INVALID_REQUEST',
            source: 'generate-recipe',
            recoverable: true,
            retryable: true,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Process the recipe generation request
    const recipes = await handleRecipeGenerationRequest(requestData);

    // Return the response
    const response: GenerateRecipeResponse = {
      recipes,
      error: null,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Error] Failed to generate recipes:', error);

    const errorResponse: GenerateRecipeResponse = {
      recipes: [],
      error: {
        message: error.message || 'Internal server error',
        status: error.message.includes('Missing') || error.message.includes('Invalid') ? 401 : 500,
        code:
          error.message.includes('Missing') || error.message.includes('Invalid')
            ? 'AUTH_ERROR'
            : 'INTERNAL_ERROR',
        source: 'generate-recipe',
        recoverable: true,
        retryable: true,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: errorResponse.error.status,
    });
  }
});
