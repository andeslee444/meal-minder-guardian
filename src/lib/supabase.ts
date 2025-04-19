import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './auth-helper';

// Log the environment variables for debugging
console.log('Supabase URL (hardcoded):', SUPABASE_URL);
console.log('Supabase Anon Key (first 10 chars):', SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Check if we have valid credentials before proceeding
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Parse and log the contents of the API key
try {
  const [headerEncoded, payloadEncoded] = SUPABASE_ANON_KEY.split('.');
  if (headerEncoded && payloadEncoded) {
    try {
      const payload = JSON.parse(atob(payloadEncoded));
      console.log('API key parsed contents:', {
        issuer: payload.iss,
        role: payload.role,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        referenceId: payload.ref,
      });
    } catch (err) {
      console.warn('Error parsing API key payload:', err);
    }
  } else {
    console.warn('API key does not have the expected JWT format');
  }
} catch (err) {
  console.warn('Error processing API key:', err);
}

// Debug: Log environment variables (redacted for security)
console.log('Supabase initialization - DETAILED DEBUG:', {
  url: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0,
});

// Extract the project reference from the URL
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'default';

console.log('Creating Supabase client with URL and key...');

// Create a fresh Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: `sb-${PROJECT_REF}-auth-token`,
    debug: false, // Change from true to false to disable verbose logging
    flowType: 'implicit',
  },
  global: {
    headers: {
      'x-application-name': 'meal-minder-guardian',
    },
  },
});

console.log('Supabase client successfully initialized');

// Create an admin client with the service role key
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Only create the admin client if the service role key is available
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'x-application-name': 'meal-minder-guardian-admin',
        },
      },
    })
  : null;

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Supabase admin client successfully initialized');
} else {
  console.warn('Supabase admin client not initialized - service role key not available');
}

// Test query to verify connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');

    // Create abort controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      // Direct REST test without relying on a specific table
      const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const connectionStatus = {
        rest: { status: restResponse.status, ok: restResponse.ok },
      };

      console.log('Supabase connection test results:', connectionStatus);

      return { success: restResponse.ok, connectionStatus };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.warn('Supabase connection test timed out');
        return { success: false, error: 'Connection timed out' };
      }

      console.warn('Direct REST test failed:', error);
      return { success: false, error };
    }
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return { success: false, error: err };
  }
};

// Test the connection but don't block the app initialization
setTimeout(() => {
  testSupabaseConnection().then(result => {
    if (!result.success) {
      console.warn(
        'Initial Supabase connection test failed. The app may have limited functionality.'
      );
    }
  });
}, 1000);
