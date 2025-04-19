/// <reference lib="deno.ns" />

// Edge Function configuration
export const CONFIG = {
  // Timeouts
  EDGE_FUNCTION_TIMEOUT: 180, // seconds - increased to handle larger responses
  OPENAI_TIMEOUT: 120, // seconds - increased to handle larger responses

  // Request limits
  MAX_INGREDIENTS: 10,
  MAX_RECIPES: 6,
  MAX_REQUESTS_PER_MINUTE: 20,

  // OpenAI settings
  OPENAI: {
    API_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-4',
    TEMPERATURE: 0.3,
    TOP_P: 0.8,
    MAX_TOKENS: 2500,
    TIMEOUT: 60, // Increased from 30 to 60 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // Base delay in ms
    BATCH_SIZE: 3, // Process recipes in smaller batches
  },

  // Cache settings
  CACHE: {
    TTL: 3600, // 1 hour
    MAX_ITEMS: 100,
    CLEANUP_INTERVAL: 300, // 5 minutes in seconds
  },

  // Progress tracking
  PROGRESS: {
    STAGES: {
      VALIDATING: { current: 1, total: 5, percentage: 20 },
      PREPARING: { current: 2, total: 5, percentage: 40 },
      GENERATING: { current: 3, total: 5, percentage: 60 },
      PROCESSING: { current: 4, total: 5, percentage: 80 },
      COMPLETING: { current: 5, total: 5, percentage: 100 },
    },
  },

  // Error codes
  ERROR_CODES: {
    TIMEOUT: 'timeout_error',
    RATE_LIMIT: 'rate_limit_error',
    VALIDATION_ERROR: 'validation_error',
    OPENAI_ERROR: 'openai_error',
    AUTHENTICATION_ERROR: 'authentication_error',
    SERVER_ERROR: 'server_error',
    GENERAL_ERROR: 'general_error',
  },

  // CORS settings
  CORS: {
    ALLOWED_ORIGINS: ['*'],
    MAX_AGE: 86400,
  },

  // New fields
  MIN_INGREDIENTS: 1,
  MAX_INSTRUCTIONS: 10,
  MIN_INSTRUCTIONS: 3,
  MAX_PREP_TIME: 120,
  MAX_COOK_TIME: 180,
  MAX_SERVINGS: 12,
  MIN_SERVINGS: 1,
} as const;
