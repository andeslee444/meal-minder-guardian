import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.script
config({ path: resolve(__dirname, '../.env.script') });

import { supabase } from './supabase-client';

async function main() {
  try {
    // First, try to get the existing user
    console.log('Getting existing user...');
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const testUser = users.find(user => user.email === 'test@example.com');
    let userId: string;

    if (testUser) {
      userId = testUser.id;
      console.log('Found existing user with ID:', userId);
    } else {
      // Create a new user if it doesn't exist
      console.log('Creating new test user...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'test@example.com',
        password: 'testpassword123',
        email_confirm: true,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error('Failed to get user ID from auth response');
      }

      userId = authData.user.id;
      console.log('Created new user with ID:', userId);
    }

    console.log('Clearing existing inventory...');
    const { error: deleteError } = await supabase
      .from('inventory_items')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    console.log('Generating new inventory items...');
    const items = Array.from({ length: 10 }, (_, i) => ({
      user_id: userId,
      name: `Test Item ${i + 1}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      unit: ['pieces', 'grams', 'kg', 'ml', 'liters'][Math.floor(Math.random() * 5)],
      category: ['fruits', 'vegetables', 'meat', 'dairy', 'grains'][Math.floor(Math.random() * 5)],
      price: parseFloat((Math.random() * 100).toFixed(2)),
      store: ['Walmart', 'Target', 'Costco', 'Whole Foods'][Math.floor(Math.random() * 4)],
      notes: `Test note for item ${i + 1}`,
      expiration_date: new Date(
        Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      purchase_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    console.log('Inserting new items...');
    const { error: insertError } = await supabase.from('inventory_items').insert(items);

    if (insertError) {
      throw insertError;
    }

    console.log('Successfully inserted inventory items!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
