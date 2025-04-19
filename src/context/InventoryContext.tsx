import React, { createContext, useContext, useEffect, useState } from 'react';
// Import types directly
import type { InventoryItem, InventoryContextType } from '@/types/inventory';
import { inventoryStore } from '@/stores/inventoryStore';
import { useUser } from './UserContext';
import { errorHandler } from '@/utils/errorHandler';
import { cache } from '@/utils/cache';

const InventoryContext = createContext<InventoryContextType>({
  items: [],
  isLoading: false,
  error: null,
  connectionError: false,
  addItem: async () => false,
  updateItem: async () => false,
  removeItem: async () => false,
  clearInventory: async () => false,
  reloadInventory: async () => {},
  isFetchingInventory: false,
});

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isUserLoading } = useUser();
  const [isFetchingInventory, setIsFetchingInventory] = useState(false);
  const [storeState, setStoreState] = useState(inventoryStore.getState());

  useEffect(() => {
    // Set up the store with the current user
    inventoryStore.setUserId(user?.id || null);

    // Only fetch inventory if user is logged in and not loading
    if (user?.id && !isUserLoading) {
      reloadInventoryStore();
    }

    // Subscribe to store state changes
    const unsubscribe = inventoryStore.subscribe(newState => {
      setStoreState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, isUserLoading]);

  const reloadInventoryStore = async () => {
    if (isFetchingInventory) return; // Prevent multiple simultaneous fetches

    try {
      setIsFetchingInventory(true);
      await inventoryStore.fetchInventory();
    } catch (error) {
      errorHandler.handleError(error);
    } finally {
      setIsFetchingInventory(false);
    }
  };

  const addItem = async (item: InventoryItem): Promise<boolean> => {
    try {
      console.log('[InventoryContext] Starting to add item:', {
        itemName: item.name,
        itemDetails: item,
      });

      const success = await inventoryStore.addItem(item);

      if (success) {
        console.log('[InventoryContext] Successfully added item:', item.name);
        await reloadInventoryStore(); // Refresh the inventory after adding an item
      } else {
        console.error('[InventoryContext] Failed to add item:', item.name);
      }

      return success;
    } catch (error) {
      console.error('[InventoryContext] Error in addItem:', error);
      errorHandler.handleError(error);
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>): Promise<boolean> => {
    try {
      const success = await inventoryStore.updateItem(id, updates);
      if (success) {
        await reloadInventoryStore(); // Refresh the inventory after updating an item
      }
      return success;
    } catch (error) {
      errorHandler.handleError(error);
      return false;
    }
  };

  const removeItem = async (id: string): Promise<boolean> => {
    try {
      const success = await inventoryStore.removeItem(id);
      if (success) {
        await reloadInventoryStore(); // Refresh the inventory after removing an item
      }
      return success;
    } catch (error) {
      errorHandler.handleError(error);
      return false;
    }
  };

  const clearInventoryStore = async (): Promise<boolean> => {
    try {
      console.log('[InventoryContext] Starting to clear inventory');
      console.log('[InventoryContext] Current store state:', storeState);

      // Update UI state immediately
      setStoreState(prev => {
        console.log('[InventoryContext] Updating store state from:', prev);
        const newState = {
          ...prev,
          items: [],
          isLoading: false,
          error: null,
          connectionError: false,
        };
        console.log('[InventoryContext] New store state:', newState);
        return newState;
      });

      // Clear persisted state from localStorage
      localStorage.removeItem('inventory_store');
      console.log('[InventoryContext] Cleared inventory_store from localStorage');

      // Clear from database in the background
      const success = await inventoryStore.clearInventory();

      if (success) {
        console.log('[InventoryContext] Successfully cleared inventory from database');
        console.log('[InventoryContext] Final store state:', storeState);
      } else {
        console.error('[InventoryContext] Failed to clear inventory from database');
        // If database clear failed, reload the inventory to restore state
        await reloadInventoryStore();
      }

      return success;
    } catch (error) {
      console.error('[InventoryContext] Error in clearInventoryStore:', error);
      errorHandler.handleError(error);
      // If there was an error, reload the inventory to restore state
      await reloadInventoryStore();
      return false;
    }
  };

  const reloadInventory = async () => {
    if (!user?.id) return;

    try {
      console.log('[InventoryContext] Starting to reload inventory');
      setStoreState(prev => ({ ...prev, isLoading: true }));

      // Clear cache to force fresh data
      const cacheKey = `inventory:${user.id}`;
      cache.clear();

      // Fetch fresh data
      const items = await inventoryStore.fetchInventory();

      // Update state with fresh data
      setStoreState(prev => ({
        ...prev,
        items,
        isLoading: false,
        error: null,
      }));

      console.log('[InventoryContext] Successfully reloaded inventory with', items.length, 'items');
    } catch (error) {
      console.error('[InventoryContext] Error reloading inventory:', error);
      setStoreState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to reload inventory'),
      }));
    }
  };

  const value = {
    items: storeState.items,
    isLoading: storeState.isLoading,
    error: storeState.error,
    connectionError: storeState.connectionError,
    addItem,
    updateItem,
    removeItem,
    clearInventory: clearInventoryStore,
    reloadInventory,
    isFetchingInventory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
// For backward compatibility
export const useInventoryContext = useInventory;
