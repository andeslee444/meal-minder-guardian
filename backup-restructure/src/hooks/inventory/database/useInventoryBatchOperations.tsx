import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory';

export const useInventoryBatchOperations = () => {
  const { toast } = useToast();
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Clear all inventory items
  const clearInventoryInDatabase = async (userId: string) => {
    if (!userId) {
      console.error('Cannot clear inventory: No user ID provided');
      return false;
    }

    setIsBatchProcessing(true);

    try {
      console.log('Clearing inventory for user:', userId);

      // First verify the table exists and user has access
      const { data: checkData, error: checkError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (checkError) {
        console.error('Error checking inventory access:', checkError);
        if (checkError.code === '42P01') {
          console.error("Table 'inventory_items' does not exist");
          return false;
        }
        throw checkError;
      }

      // If we get here, we have access to the table
      const { error } = await supabase.from('inventory_items').delete().eq('user_id', userId);

      if (error) {
        console.error('Error clearing inventory:', error);
        toast({
          title: 'Error clearing inventory',
          description: error.message || 'Could not clear inventory items',
          variant: 'destructive',
        });
        return false;
      }

      console.log('Successfully cleared inventory for user:', userId);
      return true;
    } catch (error) {
      console.error('Error in clearInventoryInDatabase:', error);
      toast({
        title: 'Error clearing inventory',
        description: 'An unexpected error occurred while clearing inventory',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Batch insert inventory items
  const batchInsertItems = async (items: Partial<InventoryItem>[], userId: string) => {
    if (!userId || !items?.length) {
      console.error('Cannot batch insert: No user ID or empty items array');
      return false;
    }

    setIsBatchProcessing(true);

    try {
      console.log(`Batch inserting ${items.length} inventory items for user:`, userId);

      // Make sure all items have the user_id set and required fields
      const itemsWithUserId = items.map(item => ({
        user_id: userId,
        name: item.name || 'Unnamed Item',
        quantity: item.quantity || 0,
        unit: item.unit || 'unit',
        category: item.category || 'Uncategorized',
        price: item.price || 0,
        store: item.store || '',
        notes: item.notes || '',
        // Map camelCase to snake_case
        purchase_date: item.purchaseDate || new Date().toISOString(),
        expiration_date:
          item.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // First verify the table exists and user has access
      const { data: checkData, error: checkError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (checkError) {
        console.error('Error checking inventory access:', checkError);
        if (checkError.code === '42P01') {
          console.error("Table 'inventory_items' does not exist");
          return false;
        }
        throw checkError;
      }

      // If we get here, we have access to the table
      const { error } = await supabase.from('inventory_items').insert(itemsWithUserId);

      if (error) {
        console.error('Error batch inserting inventory items:', error);
        toast({
          title: 'Error adding inventory items',
          description: error.message || 'Could not add inventory items to the database',
          variant: 'destructive',
        });
        return false;
      }

      console.log(`Successfully batch inserted ${items.length} inventory items`);
      return true;
    } catch (error) {
      console.error('Error in batchInsertItems:', error);
      toast({
        title: 'Error adding inventory items',
        description: 'An unexpected error occurred while adding inventory items',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return {
    isBatchProcessing,
    clearInventoryInDatabase,
    batchInsertItems,
  };
};
