// Hard-coded, verified API keys for testing purposes only
// Remove in production and use environment variables
export const SUPABASE_URL = 'https://ingcacsuikgwvnqjwnpw.supabase.co';

// Latest key from user
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ2NhY3N1aWtnd3ZucWp3bnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTMwNDgsImV4cCI6MjA1ODU4OTA0OH0.NcyNL3kSFzTAaIPAHXB4Y2uPPI8dC_35kqk6KIKZGCU';

// Original key - not working
export const ORIGINAL_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZ2NhY3N1aWtnd3ZucWp3bnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjE5NzAsImV4cCI6MjAyNjE5Nzk3MH0.Rl5zTFXgkBGOKkNYBXQDgMZ_hQkEVY2eqfXhkzMO1Qw';

// Direct authentication function - modified to simplify
export async function directAuth(email: string, password: string) {
  console.log('Attempting direct auth with latest key');

  try {
    // Use a slightly different endpoint format to test
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        grant_type: 'password',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Auth error details:', data);
      console.error('Status code:', response.status);
      console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));
      throw new Error(data.error || data.message || 'Authentication failed');
    }

    console.log('Auth successful!');
    return { success: true, data };
  } catch (error) {
    console.error('Direct auth error:', error);
    return { success: false, error };
  }
}

// Function to test if the API key is valid - using GET rest/v1
export async function testApiKeyValidity() {
  console.log('Testing API key validity with latest key');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log('API key test result:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
    });

    return response.ok;
  } catch (error) {
    console.error('API key test error:', error);
    return false;
  }
}
