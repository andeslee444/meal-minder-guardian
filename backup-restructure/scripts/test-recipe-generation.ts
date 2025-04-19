import { config } from 'dotenv';
import { join } from 'path';
import { RecipeGenerationService } from './recipe-generation-service';
import { inventoryStore } from './inventory-store';
import { supabase } from './supabase-client';

// Load environment variables from .env.script
config({ path: join(process.cwd(), '.env.script') });

async function getTestUser() {
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const testUser = users.find(user => user.email === 'test@example.com');
  if (!testUser) {
    throw new Error('Test user not found');
  }

  return testUser.id;
}

async function main() {
  try {
    // Get test user
    console.log('Getting test user...');
    const userId = await getTestUser();
    console.log('Using test user ID:', userId);

    // Set user and fetch their inventory
    inventoryStore.setUserId(userId);
    await inventoryStore.fetchInventory();

    const items = inventoryStore.getItems();
    console.log('Fetched inventory items:', items);

    // Try generating recipes with both services
    console.log('\nTrying Spoonacular recipe generation...');
    const spoonacularRecipe = await RecipeGenerationService.generateWithSpoonacular(items);
    console.log('Spoonacular recipe result:', spoonacularRecipe);

    console.log('\nTrying OpenAI recipe generation...');
    const openAIRecipe = await RecipeGenerationService.generateWithOpenAI(items);
    console.log('OpenAI recipe result:', openAIRecipe);
  } catch (error) {
    console.error('Error in recipe generation test:', error);
  }
}

main();
