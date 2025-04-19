/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { load } from 'https://deno.land/std@0.208.0/dotenv/mod.ts';

declare global {
  interface Window {
    Deno: typeof Deno;
  }
}

// Development fallbacks - used when values aren't found in environment
const DEV_FALLBACKS = {
  PROJECT_URL: 'https://ingcacsuikgwvnqjwnpw.supabase.co',
  SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ2NhY3N1aWtnd3ZucWp3bnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDYyMTY3MCwiZXhwIjoyMDI2MTk3NjcwfQ.FMQmnVDiR5Zxb6s20rdyQPuqcFSdlb1o5fQbKhiNzvU',
  OPENAI_API_KEY: 'sk-your-openai-api-key',
  GOOGLE_API_KEY: 'your-google-api-key',
  ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ2NhY3N1aWtnd3ZucWp3bnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjE2NzAsImV4cCI6MjAyNjE5NzY3MH0.yEOkQT1zDdlcPqQR0YxcVNnm9o_Px-dKXDcNfUXotyc',
  DENO_ENV: 'development',
  SPOONACULAR_API_KEY: 'your-spoonacular-api-key',
};

// More flexible schema for development
const envSchema = z.object({
  PROJECT_URL: z.string().url().optional().default(DEV_FALLBACKS.PROJECT_URL),
  SERVICE_ROLE_KEY: z.string().optional().default(DEV_FALLBACKS.SERVICE_ROLE_KEY),
  OPENAI_API_KEY: z.string().optional().default(DEV_FALLBACKS.OPENAI_API_KEY),
  GOOGLE_API_KEY: z.string().optional().default(DEV_FALLBACKS.GOOGLE_API_KEY),
  SPOONACULAR_API_KEY: z.string().optional().default(DEV_FALLBACKS.SPOONACULAR_API_KEY),
  ANON_KEY: z.string().optional().default(DEV_FALLBACKS.ANON_KEY),
  DENO_ENV: z.enum(['development', 'production']).default('development'),
});

// Set up environment variables from multiple possible locations
async function loadEnvVars() {
  console.log('[Info] Loading environment variables');

  try {
    // First try to load from .env.local in parent directory
    try {
      console.log('[Info] Trying to load from .env.local');
      const envPath = new URL('../.env.local', import.meta.url);
      await load({ envPath: envPath.pathname });
      console.log('[Info] Successfully loaded .env.local file');
    } catch (envError) {
      console.warn('[Warn] Failed to load .env.local file:', envError.message);

      // Then try to load from .env in the current directory
      try {
        console.log('[Info] Trying to load from .env');
        await load({ export: true });
        console.log('[Info] Successfully loaded .env file');
      } catch (secondEnvError) {
        console.warn('[Warn] Failed to load .env file:', secondEnvError.message);
        console.log('[Info] Using environment variables from Deno.env');
      }
    }
  } catch (error) {
    console.warn('[Warn] Error during environment variable loading:', error.message);
    console.log('[Info] Will attempt to use existing Deno.env or fallbacks');
  }
}

// Extract a value from environment with proper fallback handling
function getEnvVar(name: string): string {
  try {
    console.log(`[Debug] Attempting to get environment variable: ${name}`);
    const value = Deno.env.get(name);

    if (!value) {
      console.warn(`[Warning] Missing environment variable: ${name}, checking fallbacks`);
      // In development, use fallbacks
      if (Deno.env.get('DENO_ENV') !== 'production') {
        const fallback = DEV_FALLBACKS[name as keyof typeof DEV_FALLBACKS];
        if (fallback) {
          console.log(`[Info] Using fallback for ${name} in development mode`);
          return fallback;
        }

        // Return empty string as last resort for development
        console.warn(`[Warning] Using empty string for ${name} in development mode`);
        return '';
      }

      // Only throw in production
      console.error(`[Error] Critical environment variable ${name} missing in production`);
      throw new Error(
        `Missing required environment variable: ${name}. Please set it in .env.local file.`
      );
    }

    // Mask sensitive values in logs
    const maskedValue = name.toLowerCase().includes('key')
      ? value.substring(0, 4) + '...'
      : value.substring(0, 10) + '...';
    console.log(`[Debug] Value for ${name}: ${maskedValue}`);

    return value;
  } catch (error) {
    if (Deno.env.get('DENO_ENV') !== 'production') {
      console.warn(
        `[Warning] Error getting ${name}, using fallback in development: ${error.message}`
      );
      return DEV_FALLBACKS[name as keyof typeof DEV_FALLBACKS] || '';
    }
    throw error;
  }
}

// Initialize environment
try {
  // Load dotenv files
  await loadEnvVars();

  // Set a default environment value if not present
  if (!Deno.env.get('DENO_ENV')) {
    Deno.env.set('DENO_ENV', 'development');
  }

  // Get all environment variables with fallbacks for development
  const rawEnv = {
    PROJECT_URL: getEnvVar('PROJECT_URL'),
    SERVICE_ROLE_KEY: getEnvVar('SERVICE_ROLE_KEY'),
    OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
    GOOGLE_API_KEY: getEnvVar('GOOGLE_API_KEY'),
    SPOONACULAR_API_KEY: getEnvVar('SPOONACULAR_API_KEY'),
    ANON_KEY: getEnvVar('ANON_KEY'),
    DENO_ENV: getEnvVar('DENO_ENV') || 'development',
  };

  // Log environment status (sanitized)
  console.log('[Info] Environment variables loaded:', {
    hasProjectUrl: !!rawEnv.PROJECT_URL,
    hasServiceKey: !!rawEnv.SERVICE_ROLE_KEY,
    hasOpenAIKey: !!rawEnv.OPENAI_API_KEY,
    hasGoogleKey: !!rawEnv.GOOGLE_API_KEY,
    hasSpoonacularKey: !!rawEnv.SPOONACULAR_API_KEY,
    hasAnonKey: !!rawEnv.ANON_KEY,
    denoEnv: rawEnv.DENO_ENV,
    projectUrl: rawEnv.PROJECT_URL,
    serviceKeyPrefix: rawEnv.SERVICE_ROLE_KEY
      ? rawEnv.SERVICE_ROLE_KEY.substring(0, 4) + '...'
      : 'missing',
    openAIKeyPrefix: rawEnv.OPENAI_API_KEY
      ? rawEnv.OPENAI_API_KEY.substring(0, 4) + '...'
      : 'missing',
    googleKeyPrefix: rawEnv.GOOGLE_API_KEY
      ? rawEnv.GOOGLE_API_KEY.substring(0, 4) + '...'
      : 'missing',
    spoonacularKeyPrefix: rawEnv.SPOONACULAR_API_KEY
      ? rawEnv.SPOONACULAR_API_KEY.substring(0, 4) + '...'
      : 'missing',
    anonKeyPrefix: rawEnv.ANON_KEY ? rawEnv.ANON_KEY.substring(0, 4) + '...' : 'missing',
  });

  // Validate environment variables with fallbacks for development
  let ENV;
  try {
    ENV = envSchema.parse(rawEnv);
    console.log('[Info] Environment variables validated successfully');
  } catch (error) {
    console.error('[Error] Environment validation failed:', error);
    if (Deno.env.get('DENO_ENV') === 'production') {
      throw error;
    }
    console.warn('[Warning] Using default values in development mode due to validation failure');
    ENV = DEV_FALLBACKS;
  }

  // Export the environment object
  export { ENV };
} catch (error) {
  console.error('[Error] Failed to initialize environment:', error);

  // In development, provide fallback values instead of crashing
  if (Deno.env.get('DENO_ENV') !== 'production') {
    console.warn('[Warning] Using fallback values in development mode');
    export const ENV = DEV_FALLBACKS;
  } else {
    // In production, rethrow the error to fail safely
    throw error;
  }
}
