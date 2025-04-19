import { useState, useCallback } from 'react';
import { InventoryItem } from '@/types/inventory';
import { useUserContext } from '@/context/UserContext';
import { useInventoryDatabase } from './useInventoryDatabase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useInventoryOperations = (initialInventory: InventoryItem[] = []) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [connectionError, setConnectionError] = useState(false);
  const { user } = useUserContext();
  const {
    addItemToDatabase,
    removeItemFromDatabase,
    updateItemInDatabase,
    clearInventoryInDatabase,
    batchInsertItems,
  } = useInventoryDatabase();
  const { toast } = useToast();

  // Add an item to the inventory
  const addInventoryItem = useCallback(
    async (item: Partial<InventoryItem>) => {
      if (!user) {
        console.warn('Cannot add inventory item: No user logged in');
        return;
      }

      try {
        // Create a complete item with defaults
        const newItem: InventoryItem = {
          id: uuidv4(),
          name: item.name || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'pcs',
          category: item.category || 'Uncategorized',
          price: item.price || 0,
          store: item.store || '',
          purchaseDate: item.purchaseDate || new Date().toISOString(),
          expirationDate:
            item.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: item.notes || '',
        };

        // First update local state for immediate feedback
        setInventory(prev => [...prev, newItem]);

        // Then persist to database
        const success = await addItemToDatabase(newItem, user.id);

        if (!success) {
          // Rollback on error
          setInventory(prev => prev.filter(i => i.id !== newItem.id));
          toast({
            title: 'Error adding item',
            description: 'Changes were not saved to the database. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in addInventoryItem:', error);
        toast({
          title: 'Error adding item',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [user, addItemToDatabase, toast]
  );

  // Remove an item from the inventory
  const removeInventoryItem = useCallback(
    async (itemId: string) => {
      if (!user) {
        console.warn('Cannot remove inventory item: No user logged in');
        return;
      }

      try {
        // Store a backup of the current inventory
        const previousInventory = [...inventory];

        // First update local state for immediate feedback
        setInventory(prev => prev.filter(item => item.id !== itemId));

        // Then persist to database
        const success = await removeItemFromDatabase(itemId, user.id);

        if (!success) {
          // Rollback on error
          setInventory(previousInventory);
          toast({
            title: 'Error removing item',
            description: 'Changes were not saved to the database. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in removeInventoryItem:', error);
        toast({
          title: 'Error removing item',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [user, inventory, removeItemFromDatabase, toast]
  );

  // Update an item in the inventory
  const updateInventoryItem = useCallback(
    async (itemId: string, updates: Partial<InventoryItem>) => {
      if (!user) {
        console.warn('Cannot update inventory item: No user logged in');
        return;
      }

      try {
        // Store a backup of the current inventory
        const previousInventory = [...inventory];

        // First update local state for immediate feedback
        setInventory(prev =>
          prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
        );

        // Then persist to database
        const success = await updateItemInDatabase(itemId, updates, user.id);

        if (!success) {
          // Rollback on error
          setInventory(previousInventory);
          toast({
            title: 'Error updating item',
            description: 'Changes were not saved to the database. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in updateInventoryItem:', error);
        toast({
          title: 'Error updating item',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [user, inventory, updateItemInDatabase, toast]
  );

  // Clear all inventory items
  const clearInventory = useCallback(async () => {
    if (!user) {
      console.warn('Cannot clear inventory: No user logged in');
      return false;
    }

    try {
      // Store a backup of the current inventory
      const previousInventory = [...inventory];

      // First clear local state for immediate feedback
      setInventory([]);

      // Then persist to database
      const success = await clearInventoryInDatabase(user.id);

      if (!success) {
        // Rollback on error
        setInventory(previousInventory);
        toast({
          title: 'Error clearing inventory',
          description: 'Your inventory could not be cleared. Please try again.',
          variant: 'destructive',
        });
        return false;
      } else {
        toast({
          title: 'Inventory cleared',
          description: 'All items have been removed from your inventory.',
        });
        return true;
      }
    } catch (error) {
      console.error('Error in clearInventory:', error);
      toast({
        title: 'Error clearing inventory',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, inventory, clearInventoryInDatabase, toast]);

  return {
    inventory,
    setInventory,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    clearInventory,
    connectionError,
    setConnectionError,
  };
};
