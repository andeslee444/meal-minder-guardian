/**
 * Module for centralized error handling in the recipe generation API
 */

import { CONFIG } from './config.ts';

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be dynamically set based on request origin
  'Access-Control-Allow-Headers': 'x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': CONFIG.CORS.MAX_AGE.toString(),
};

/**
 * Interface for standardized API error responses
 */
export interface ErrorResponse {
  message: string;
  status: number;
  code: string;
  source: string;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: Error): ErrorResponse {
  console.error('[Error] Creating error response:', error);

  // Handle timeout errors
  if (error.name === 'AbortError') {
    return {
      message: 'Request timed out. Please try again.',
      status: 504,
      code: 'timeout_error',
      source: 'edge_function',
      recoverable: true,
      retryable: true,
    };
  }

  // Handle API errors
  if (error.message.includes('OpenAI API error')) {
    return {
      message: 'Failed to generate recipe. Please try again later.',
      status: 502,
      code: 'api_error',
      source: 'edge_function',
      recoverable: true,
      retryable: true,
    };
  }

  // Handle validation errors
  if (error.message.includes('Invalid ingredients')) {
    return {
      message: 'Invalid ingredients provided. Please check your input.',
      status: 400,
      code: 'validation_error',
      source: 'edge_function',
      recoverable: true,
      retryable: false,
    };
  }

  // Handle rate limit errors
  if (error.message.includes('rate limit')) {
    return {
      message: 'Too many requests. Please try again later.',
      status: 429,
      code: 'rate_limit_error',
      source: 'edge_function',
      recoverable: true,
      retryable: true,
    };
  }

  // Default error response
  return {
    message: 'An unexpected error occurred. Please try again.',
    status: 500,
    code: 'internal_error',
    source: 'edge_function',
    recoverable: false,
    retryable: false,
  };
}

/**
 * Handles OpenAI specific errors and maps them to appropriate responses
 */
export function handleOpenAIError(error: Error): Response {
  console.error('[Error Handler] OpenAI error:', error);

  // Extract more specific error information
  const errorMessage = error.message;
  const isRateLimit = errorMessage.toLowerCase().includes('rate limit');
  const isTimeout = errorMessage.toLowerCase().includes('timeout');
  const isInvalidRequest = errorMessage.toLowerCase().includes('invalid request');

  const errorResponse = {
    error: errorMessage,
    code: isRateLimit
      ? 'rate_limit'
      : isTimeout
        ? 'timeout'
        : isInvalidRequest
          ? 'invalid_request'
          : 'openai_error',
    recoverable: isRateLimit || isTimeout,
    retryable: isTimeout || !isInvalidRequest,
  };

  return new Response(JSON.stringify(errorResponse), {
    status: isRateLimit ? 429 : isTimeout ? 504 : isInvalidRequest ? 400 : 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Handles general errors in the edge function
 */
export function handleGeneralError(error: Error): Response {
  console.error('[Error Handler] General error:', error);

  const errorResponse = {
    error: error.message,
    code: 'general_error',
    recoverable: false,
    retryable: false,
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function handleValidationError(error: Error): Response {
  console.error('[Error Handler] Validation error:', error);

  const errorResponse = {
    error: error.message,
    code: 'validation_error',
    recoverable: false,
    retryable: false,
  };

  return new Response(JSON.stringify(errorResponse), {
    status: 400,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
