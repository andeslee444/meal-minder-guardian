// Debug file to check environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
console.log(
  'VITE_SUPABASE_ANON_KEY (first 10 chars):',
  import.meta.env.VITE_SUPABASE_ANON_KEY
    ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 10)}...`
    : 'Not set'
);
console.log('=== END DEBUG ===');

// Export a dummy function to avoid unused file warnings
export const debugEnv = () => {
  console.log('Debug environment function called');
};
