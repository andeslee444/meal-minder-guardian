import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

export const useInventoryMutations = () => {
  const { toast } = useToast();

  // Add an item to the database
  const addItemToDatabase = async (item: InventoryItem, userId: string) => {
    try {
      console.log('[InventoryMutations] Starting to add item to database:', {
        itemName: item.name,
        userId: userId,
        itemDetails: item,
      });

      const dbItem = {
        user_id: userId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        price: item.price,
        store: item.store,
        purchase_date: item.purchaseDate,
        expiration_date: item.expirationDate || null,
        notes: item.notes,
      };

      console.log('[InventoryMutations] Formatted database item:', dbItem);

      const { data, error } = await supabase.from('inventory_items').insert([dbItem]).select();

      if (error) {
        console.error('[InventoryMutations] Error adding inventory item:', error);
        toast({
          title: 'Error adding item',
          description: error.message || 'Could not add item to inventory',
          variant: 'destructive',
        });
        return false;
      }

      console.log('[InventoryMutations] Successfully added inventory item:', {
        itemName: item.name,
        responseData: data,
      });
      return true;
    } catch (error) {
      console.error('[InventoryMutations] Error in addItemToDatabase:', error);
      toast({
        title: 'Error adding item',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove an item from the database
  const removeItemFromDatabase = async (itemId: string, userId: string) => {
    try {
      console.log('Removing inventory item from database:', itemId);
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing inventory item:', error);
        toast({
          title: 'Error removing item',
          description: error.message || 'Could not remove item from inventory',
          variant: 'destructive',
        });
        return false;
      }

      console.log('Successfully removed inventory item:', itemId);
      return true;
    } catch (error) {
      console.error('Error in removeItemFromDatabase:', error);
      toast({
        title: 'Error removing item',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update an item in the database
  const updateItemInDatabase = async (
    itemId: string,
    updates: Partial<InventoryItem>,
    userId: string
  ) => {
    try {
      console.log('Updating inventory item in database:', itemId);
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: updates.name,
          quantity: updates.quantity,
          unit: updates.unit,
          category: updates.category,
          price: updates.price,
          store: updates.store,
          purchase_date: updates.purchaseDate,
          expiration_date: updates.expirationDate || null,
          notes: updates.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating inventory item:', error);
        toast({
          title: 'Error updating item',
          description: error.message || 'Could not update inventory item',
          variant: 'destructive',
        });
        return false;
      }

      console.log('Successfully updated inventory item:', itemId);
      return true;
    } catch (error) {
      console.error('Error in updateItemInDatabase:', error);
      toast({
        title: 'Error updating item',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    addItemToDatabase,
    removeItemFromDatabase,
    updateItemInDatabase,
  };
};
