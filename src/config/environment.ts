/**
 * Environment configuration
 * Centralizes access to environment variables and application settings
 */

/**
 * Environment configuration utilities for accessing env variables
 * Provides type-safe access to Vite env variables
 */

// Environment types
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

// Environment variables interface
export interface EnvironmentVariables {
  // API Keys
  VITE_OPENAI_API_KEY: string;
  VITE_SPOONACULAR_API_KEY: string;

  // Supabase Config
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_SUPABASE_FUNCTIONS_URL: string;

  // Feature Flags
  VITE_ENABLE_MOCK_DATA: boolean;
  VITE_ENABLE_DEBUG_LOGGING: boolean;

  // App Config
  VITE_APP_NAME: string;
  VITE_RECIPE_COUNT: number;
}

/**
 * Get the current environment (development, production, test)
 */
export function getEnvironment(): Environment {
  if (import.meta.env.MODE === 'test') {
    return Environment.Test;
  }

  return import.meta.env.PROD ? Environment.Production : Environment.Development;
}

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = getEnvironment() === Environment.Development;

/**
 * Check if the app is running in production mode
 */
export const isProduction = getEnvironment() === Environment.Production;

/**
 * Check if the app is running in test mode
 */
export const isTest = getEnvironment() === Environment.Test;

/**
 * Get an environment variable with type safety
 * @param key The environment variable key
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv<K extends keyof EnvironmentVariables>(
  key: K,
  defaultValue?: EnvironmentVariables[K]
): EnvironmentVariables[K] {
  const value = import.meta.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (isDevelopment) {
      console.warn(`Environment variable ${key} is not defined`);
    }

    return '' as unknown as EnvironmentVariables[K];
  }

  // Handle boolean conversions
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as unknown as EnvironmentVariables[K];
  }

  // Handle number conversions
  if (typeof defaultValue === 'number') {
    return Number(value) as unknown as EnvironmentVariables[K];
  }

  return value as EnvironmentVariables[K];
}

/**
 * Get all environment variables
 * @returns Object containing all environment variables
 */
export function getAllEnv(): Partial<EnvironmentVariables> {
  return {
    VITE_OPENAI_API_KEY: getEnv('VITE_OPENAI_API_KEY', ''),
    VITE_SPOONACULAR_API_KEY: getEnv('VITE_SPOONACULAR_API_KEY', ''),
    VITE_SUPABASE_URL: getEnv('VITE_SUPABASE_URL', ''),
    VITE_SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY', ''),
    VITE_SUPABASE_FUNCTIONS_URL: getEnv('VITE_SUPABASE_FUNCTIONS_URL', ''),
    VITE_ENABLE_MOCK_DATA: getEnv('VITE_ENABLE_MOCK_DATA', false),
    VITE_ENABLE_DEBUG_LOGGING: getEnv('VITE_ENABLE_DEBUG_LOGGING', false),
    VITE_APP_NAME: getEnv('VITE_APP_NAME', 'Meal Minder Guardian'),
    VITE_RECIPE_COUNT: getEnv('VITE_RECIPE_COUNT', 10),
  };
}

/**
 * API Endpoints configuration
 */
export const endpoints = {
  /**
   * DALL-E Image Generation endpoint
   */
  dalleImageGen: '/dalle-image-generation',

  /**
   * Spoonacular Recipe Search endpoint
   */
  spoonacularSearch: 'https://api.spoonacular.com/recipes/complexSearch',

  /**
   * Spoonacular Recipe Information endpoint
   */
  spoonacularInfo: 'https://api.spoonacular.com/recipes/{id}/information',

  /**
   * Spoonacular Recipe Generation endpoint
   */
  spoonacularGenerate: 'https://api.spoonacular.com/recipes/findByIngredients',
};
