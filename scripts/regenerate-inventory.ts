import { inventoryStore } from '../src/stores/inventoryStore';

async function main() {
  const store = inventoryStore.getInstance();
  store.setUserId('test-user'); // Set a test user ID

  console.log('Regenerating inventory with 10 items...');
  const success = await store.regenerateInventory(10);

  if (success) {
    console.log('Successfully regenerated inventory!');
  } else {
    console.error('Failed to regenerate inventory.');
  }
}

main().catch(console.error);
