import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory';
import { useInventoryBatchOperations } from './useInventoryBatchOperations';

export const useInventoryDatabase = () => {
  const { toast } = useToast();
  const { clearInventoryInDatabase, batchInsertItems, isBatchProcessing } =
    useInventoryBatchOperations();

  const clearInventory = useCallback(
    async (userId: string) => {
      if (!userId) {
        console.error('Cannot clear inventory: No user ID provided');
        return false;
      }

      try {
        console.log('Clearing inventory for user:', userId);
        return await clearInventoryInDatabase(userId);
      } catch (error) {
        console.error('Error in clearInventory:', error);
        toast({
          title: 'Error clearing inventory',
          description: 'An unexpected error occurred while clearing inventory',
          variant: 'destructive',
        });
        return false;
      }
    },
    [clearInventoryInDatabase, toast]
  );

  const saveInventoryItems = useCallback(
    async (items: Partial<InventoryItem>[], userId: string) => {
      if (!userId || !items?.length) {
        console.error('Cannot save inventory items: No user ID or empty items array');
        return false;
      }

      try {
        console.log(`Saving ${items.length} inventory items for user:`, userId);
        return await batchInsertItems(items, userId);
      } catch (error) {
        console.error('Error in saveInventoryItems:', error);
        toast({
          title: 'Error saving inventory',
          description: 'An unexpected error occurred while saving inventory items',
          variant: 'destructive',
        });
        return false;
      }
    },
    [batchInsertItems, toast]
  );

  return {
    clearInventory,
    saveInventoryItems,
    isBatchProcessing,
  };
};
