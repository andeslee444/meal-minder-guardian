import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import type { Database } from '../src/integrations/supabase/types';

// Load environment variables from .env.script
config({ path: join(process.cwd(), '.env.script') });

const isDevelopment = process.env.NODE_ENV === 'development';

// Use local URL for development, production URL otherwise
const supabaseUrl = isDevelopment
  ? 'http://127.0.0.1:54321'
  : 'https://ingcacsuikgwvnqjwnpw.supabase.co';

// Use local service role key for development, production key otherwise
const serviceRoleKey = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error('Missing Supabase service role key');
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Service Role Key:', serviceRoleKey.substring(0, 10) + '...');

// Create a client with the correct configuration
export const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
