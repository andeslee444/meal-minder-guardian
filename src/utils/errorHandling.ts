/**
 * Determine if an error should trigger fallback to another service
 * @param error The error to check
 */
export function shouldUseFallbackForError(error: any): boolean {
  if (!error) return false;

  // Check if it's already a processed error with a type field
  if (error.type === 'api_rate_limit') {
    return true;
  }

  // Check for specific HTTP status codes
  if (error.status === 402 || error.code === 402) {
    return true;
  }

  // Check error message for keywords
  if (error.message && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    if (
      message.includes('limit') ||
      message.includes('quota') ||
      message.includes('exceeded') ||
      message.includes('rate limit')
    ) {
      return true;
    }
  }

  // Check if it's a supabase error response
  if (error.error) {
    const errorMsg =
      typeof error.error === 'string'
        ? error.error.toLowerCase()
        : JSON.stringify(error.error).toLowerCase();

    if (
      errorMsg.includes('limit') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('exceeded') ||
      errorMsg.includes('rate limit')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Handle recipe API errors and standardize their format
 * @param error The original error
 * @param silent Whether to show a toast notification
 * @param source The source of the error
 */
export function handleRecipeAPIError(
  error: any,
  silent: boolean = false,
  source: string = 'generic'
): {
  type: string;
  message: string;
  source: string;
  retryable: boolean;
  recoverable: boolean;
} {
  console.log(`Handling ${source} API error:`, error);

  // Default error to return if we can't parse the input
  const defaultError = {
    type: 'unknown_error',
    message: 'An unknown error occurred. Please try again.',
    source,
    retryable: true,
    recoverable: false,
  };

  // If it's already in our format, return it
  if (error && error.type && error.message && error.source) {
    console.log('Error is already in standardized format');
    return error;
  }

  // Handle Spoonacular-specific API limit errors
  if (source === 'spoonacular' && shouldUseFallbackForError(error)) {
    console.log('Detected Spoonacular API limit error');
    return {
      type: 'api_rate_limit',
      message: 'Daily API limit reached. Switching to AI generation.',
      source: 'spoonacular',
      retryable: false,
      recoverable: true,
    };
  }

  // Handle OpenAI specific errors
  if (source === 'openai') {
    if (error && error.message && typeof error.message === 'string') {
      const message = error.message.toLowerCase();

      // API limit errors
      if (message.includes('rate limit') || message.includes('quota')) {
        console.log('Detected OpenAI API limit error');
        return {
          type: 'api_rate_limit',
          message: 'OpenAI API rate limit reached. Please try again later.',
          source: 'openai',
          retryable: false,
          recoverable: false,
        };
      }

      // Invalid request errors
      if (message.includes('invalid') || message.includes('missing')) {
        console.log('Detected OpenAI invalid request error');
        return {
          type: 'invalid_request',
          message: 'Invalid request to OpenAI API. Please try again with different parameters.',
          source: 'openai',
          retryable: false,
          recoverable: false,
        };
      }

      // Connection errors
      if (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection')
      ) {
        console.log('Detected OpenAI network error');
        return {
          type: 'network_error',
          message:
            'Network error connecting to OpenAI. Please check your connection and try again.',
          source: 'openai',
          retryable: true,
          recoverable: false,
        };
      }
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    console.log('Processing standard Error object');
    return {
      type: 'generic_error',
      message: error.message || defaultError.message,
      source,
      retryable: true,
      recoverable: false,
    };
  }

  // Handle object errors with message field
  if (error && error.message) {
    console.log('Processing error object with message field');
    return {
      type: 'generic_error',
      message: error.message,
      source,
      retryable: true,
      recoverable: false,
    };
  }

  // If we can't parse the error, return the default
  console.log('Unable to parse error, returning default');
  return defaultError;
}

/**
 * Helper function to check if an error is related to API rate limits
 */
export function isApiLimitError(error: any): boolean {
  if (!error) return false;

  // Check for status/code fields
  if (error.status === 402 || error.code === 402) {
    return true;
  }

  // Check for common limit error messages
  if (error.message && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    return (
      message.includes('limit') ||
      message.includes('quota') ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('exceeded') ||
      message.includes('points limit') ||
      message.includes('api limit')
    );
  }

  // Check for specific type flag
  if (error.type === 'api_rate_limit' || error.type === 'limit_error') {
    return true;
  }

  // Check for source and message combination (Spoonacular specific)
  if (
    error.source === 'spoonacular' &&
    error.message &&
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('points limit')
  ) {
    return true;
  }

  return false;
}

/**
 * Alias for isApiLimitError for backward compatibility
 */
export const isRecipeAPILimitError = isApiLimitError;
