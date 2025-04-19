import { config } from 'dotenv';
import { join } from 'path';
import { supabase, supabaseAdmin } from './supabase-client';

// Load environment variables from .env.script
config({ path: join(process.cwd(), '.env.script') });

async function createTestUser() {
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return null;
  }

  const testUser = users.find(user => user.email === 'test@example.com');
  if (testUser) {
    console.log('Test user already exists:', testUser.id);
    return testUser.id;
  }

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: 'test@example.com',
    password: 'test-password-123',
    email_confirm: true,
  });

  if (createError) {
    console.error('Error creating test user:', createError);
    return null;
  }

  console.log('Created new test user:', newUser.user.id);
  return newUser.user.id;
}

async function insertTestInventory(userId: string) {
  const testItems = [
    {
      name: 'Chicken Breast',
      quantity: 2,
      unit: 'lbs',
      category: 'Meat',
      price: 5.99,
      store: 'Walmart',
      notes: 'Fresh chicken breast',
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      purchase_date: new Date().toISOString(),
      user_id: userId,
    },
    {
      name: 'Brown Rice',
      quantity: 1,
      unit: 'bag',
      category: 'Grains',
      price: 3.99,
      store: 'Walmart',
      notes: 'Organic brown rice',
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      purchase_date: new Date().toISOString(),
      user_id: userId,
    },
    {
      name: 'Broccoli',
      quantity: 1,
      unit: 'head',
      category: 'Vegetables',
      price: 2.99,
      store: 'Walmart',
      notes: 'Fresh broccoli',
      expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      purchase_date: new Date().toISOString(),
      user_id: userId,
    },
    {
      name: 'Olive Oil',
      quantity: 1,
      unit: 'bottle',
      category: 'Condiments',
      price: 8.99,
      store: 'Walmart',
      notes: 'Extra virgin olive oil',
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      purchase_date: new Date().toISOString(),
      user_id: userId,
    },
  ];

  const { data, error } = await supabaseAdmin.from('inventory_items').insert(testItems).select();

  if (error) {
    console.error('Error inserting test inventory:', error);
    return;
  }

  console.log('Successfully inserted test inventory items:', data);
}

async function main() {
  try {
    // Create or get test user
    const userId = await createTestUser();
    if (!userId) {
      console.error('Failed to create or get test user');
      return;
    }

    // Insert test inventory
    await insertTestInventory(userId);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
