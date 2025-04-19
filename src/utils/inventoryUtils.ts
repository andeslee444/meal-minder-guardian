import { InventoryItem } from '@/types/inventory';
import { supabase } from '@/lib/supabase';
import { logger } from './logger';
import { errorHandler } from './errorHandler';
import { cache } from './cache';

// Generate a random date within a range of days from now
export const getRandomDate = (minDays: number, maxDays: number): string => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date(today);
  date.setDate(date.getDate() + randomDays);
  return date.toISOString().split('T')[0];
};

// Generate a random past date for purchase date
export const getRandomPastDate = (maxDaysAgo: number): string => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date(today);
  date.setDate(date.getDate() - randomDays);
  return date.toISOString().split('T')[0];
};

// Create a default item template with reasonable defaults
export const createDefaultInventoryItem = (item: Partial<InventoryItem> = {}): InventoryItem => {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    unit: 'item',
    category: 'Produce',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purchaseDate: new Date().toISOString().split('T')[0],
    price: 0,
    store: '',
    ...item,
  };
};

/**
 * Clears all inventory items from the database
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const clearAllInventory = async (): Promise<boolean> => {
  logger.debug('inventory', 'Starting clearAllInventory process');

  try {
    // First get all inventory items
    console.log('[clearAllInventory] Fetching all inventory items');
    const { data: items, error: fetchError } = await supabase.from('inventory_items').select('id');

    if (fetchError) {
      console.error('[clearAllInventory] Error fetching items:', fetchError);
      logger.error('inventory', 'Error fetching inventory items', `error: ${fetchError.message}`);
      return false;
    }

    console.log('[clearAllInventory] Found items to delete:', items?.length || 0);

    if (!items || items.length === 0) {
      console.log('[clearAllInventory] No items to delete');
      return true;
    }

    // Delete items one by one
    console.log('[clearAllInventory] Starting deletion of items');
    for (const item of items) {
      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', item.id);

      if (deleteError) {
        console.error('[clearAllInventory] Error deleting item:', item.id, deleteError);
        logger.error(
          'inventory',
          `Error deleting item ${item.id}`,
          `error: ${deleteError.message}`
        );
        return false;
      }
    }

    console.log('[clearAllInventory] Successfully deleted all items');

    // Clear all inventory caches
    cache.clear();
    logger.debug('inventory', 'Cleared all inventory caches');

    return true;
  } catch (err) {
    console.error('[clearAllInventory] Unexpected error:', err);
    logger.error(
      'inventory',
      'Unexpected error in clearAllInventory',
      `error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
    return false;
  }
};
