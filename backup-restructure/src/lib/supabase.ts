import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './auth-helper';

// Log the environment variables for debugging
console.log('Supabase URL (hardcoded):', SUPABASE_URL);
console.log('Supabase Anon Key (first 10 chars):', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// Parse and log the contents of the API key
try {
  const [headerEncoded, payloadEncoded] = SUPABASE_ANON_KEY.split('.');
  const payload = JSON.parse(atob(payloadEncoded));
  console.log('API key parsed contents:', {
    issuer: payload.iss,
    role: payload.role,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    referenceId: payload.ref,
  });
} catch (err) {
  console.error('Error parsing API key:', err);
}

// Debug: Log environment variables (redacted for security)
console.log('Supabase initialization - DETAILED DEBUG:', {
  url: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0,
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Extract the project reference from the URL
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || 'default';

console.log('Creating Supabase client with URL and key...');

// Create a fresh Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

// Test query to verify connection
export const testSupabaseConnection = async () => {
  try {
    // Direct REST test
    const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log('Direct REST test:', { status: restResponse.status, ok: restResponse.ok });

    // Client query test
    const { data, error } = await supabase.from('_test_connection_').select('count').limit(1);

    if (error) {
      console.error('Supabase client test error:', error);
    } else {
      console.log('Supabase connection test: successful');
    }

    return { data, error };
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return { data: null, error: err };
  }
};

// Run the test
testSupabaseConnection();

// Create an admin client with service role key for server-side operations
const serviceRoleKey = import.meta.env.SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
