import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://ykxqpvbhqhqzxcnlxmiv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreHFwdmJocWhxenhjbmx4bWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA3MjE2NzAsImV4cCI6MjAyNjI5NzY3MH0.Pu_sBPAQPDQOXr-7jUXLHl0GRPxXDXKZGPtVEbZxPXE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Clearing all inventory items from the database...');

    // Delete all inventory items
    const { error } = await supabase.from('inventory_items').delete().neq('id', '0'); // This will delete all rows

    if (error) {
      console.error('Failed to clear inventory:', error.message);
      process.exit(1);
    }

    console.log('Successfully cleared all inventory items');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
