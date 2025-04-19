import { stateManager } from '@/utils/stateManager';
import { cache } from '@/utils/cache';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/utils/errorHandler';
import { performanceMonitor } from '@/utils/performance';
import { InventoryItem } from '@/types/inventory';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
import { mapDbItemsToInventoryItems, mapInventoryItemToDbItem } from '@/utils/inventoryMappers';
import { PostgrestResponse } from '@supabase/supabase-js';
import { clearAllInventory } from '@/utils/inventoryUtils';
import { create } from 'zustand';

const CACHE_KEY_PREFIX = 'inventory:';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type InventoryItemDB = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  connectionError: boolean;
}

class InventoryStore {
  private static instance: InventoryStore;
  private userId: string | null = null;
  private lastFetchedUserId: string | null = null;
  private subscribers: ((state: InventoryState) => void)[] = [];

  private constructor() {
    const [state, setState] = stateManager.createState<InventoryState>(
      'inventory_store',
      {
        items: [],
        isLoading: false,
        error: null,
        connectionError: false,
      },
      {
        persist: true,
        storageKey: 'inventory_store',
      }
    );

    this.state = state;
    this.setState = setState;
  }

  private state: InventoryState;
  private setState: (state: InventoryState) => void;

  static getInstance(): InventoryStore {
    if (!InventoryStore.instance) {
      InventoryStore.instance = new InventoryStore();
    }
    return InventoryStore.instance;
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  private getCacheKey(userId: string): string {
    return `${CACHE_KEY_PREFIX}${userId}`;
  }

  async fetchInventory(): Promise<InventoryItem[]> {
    if (!this.userId || this.state.isLoading) return [];

    try {
      this.setState({
        ...this.state,
        isLoading: true,
        error: null,
        connectionError: false,
      });

      // Check cache first
      const cacheKey = this.getCacheKey(this.userId);
      const cachedItems = cache.get<InventoryItem[]>(cacheKey);
      if (cachedItems) {
        this.setState({
          ...this.state,
          items: cachedItems,
          isLoading: false,
        });
        this.lastFetchedUserId = this.userId;
        return cachedItems;
      }

      // First verify the table exists and user has access
      const checkResponse = (await performanceMonitor.measureAsync(
        'inventory_check_access',
        async () => {
          const { data, error } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('user_id', this.userId)
            .limit(1);
          return { data, error };
        }
      )) as PostgrestResponse<Pick<InventoryItemDB, 'id'>[]>;

      if (checkResponse.error) {
        throw checkResponse.error;
      }

      // Fetch all items for the user
      const { data, error } = (await performanceMonitor.measureAsync(
        'inventory_fetch',
        async () => {
          const response = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', this.userId)
            .order('created_at', { ascending: false });
          return response;
        }
      )) as { data: InventoryItemDB[] | null; error: any };

      if (error) {
        throw error;
      }

      const items = mapDbItemsToInventoryItems(data || []);

      // Update cache
      cache.set(cacheKey, items, CACHE_TTL);

      // Update state
      this.setState({
        ...this.state,
        items,
        isLoading: false,
        error: null,
        connectionError: false,
      });

      this.lastFetchedUserId = this.userId;
      return items;
    } catch (error) {
      logger.error('Error fetching inventory:', error);
      this.setState({
        ...this.state,
        isLoading: false,
        error: error as Error,
        connectionError: true,
      });
      return [];
    }
  }

  async addItem(item: InventoryItem): Promise<boolean> {
    if (!this.userId) return false;

    try {
      console.log('[InventoryStore] Starting to add item:', {
        itemName: item.name,
        userId: this.userId,
        itemDetails: item,
      });

      // Format item for database
      const dbItem = mapInventoryItemToDbItem(item, this.userId);
      console.log('[InventoryStore] Formatted database item:', dbItem);

      // Insert into database
      const { data, error } = await performanceMonitor.measureAsync(
        'inventory_add_item',
        async () => {
          return await supabase.from('inventory_items').insert(dbItem).select();
        }
      );

      if (error) {
        errorHandler.handleError(error, {
          component: 'InventoryStore',
          action: 'add_item',
          metadata: { userId: this.userId, itemName: item.name },
        });
        return false;
      }

      console.log('[InventoryStore] Successfully added item to database:', {
        itemName: item.name,
        responseData: data,
      });

      // Update local state with the new item
      const newItem = mapDbItemsToInventoryItems(data)[0];
      this.setState({
        ...this.state,
        items: [...this.state.items, newItem],
      });

      // Update cache
      const cacheKey = this.getCacheKey(this.userId);
      const cachedItems = cache.get<InventoryItem[]>(cacheKey) || [];
      cache.set(cacheKey, [...cachedItems, newItem], CACHE_TTL);

      // Notify subscribers of the state change
      this.notifySubscribers();

      return true;
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'InventoryStore',
        action: 'add_item',
        metadata: { userId: this.userId, itemName: item.name },
      });
      return false;
    }
  }

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await performanceMonitor.measureAsync('inventory_update_item', async () => {
        return await supabase
          .from('inventory_items')
          .update({
            name: updates.name,
            quantity: updates.quantity,
            unit: updates.unit,
            category: updates.category,
            price: updates.price,
            store: updates.store,
            notes: updates.notes,
            expiration_date: updates.expirationDate,
            purchase_date: updates.purchaseDate,
          })
          .eq('id', id)
          .eq('user_id', this.userId);
      });

      if (error) {
        errorHandler.handleError(error, {
          component: 'InventoryStore',
          action: 'update_item',
          metadata: { userId: this.userId, itemId: id },
        });
        return false;
      }

      // Update local state and cache
      const updatedItems = this.state.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      this.setState({
        ...this.state,
        items: updatedItems,
      });

      const cacheKey = this.getCacheKey(this.userId);
      cache.set(cacheKey, updatedItems, CACHE_TTL);

      // Notify subscribers of the state change
      this.notifySubscribers();

      return true;
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'InventoryStore',
        action: 'update_item',
        metadata: { userId: this.userId, itemId: id },
      });
      return false;
    }
  }

  async removeItem(id: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await performanceMonitor.measureAsync('inventory_remove_item', async () => {
        return await supabase
          .from('inventory_items')
          .delete()
          .eq('id', id)
          .eq('user_id', this.userId);
      });

      if (error) {
        errorHandler.handleError(error, {
          component: 'InventoryStore',
          action: 'remove_item',
          metadata: { userId: this.userId, itemId: id },
        });
        return false;
      }

      // Update local state and cache
      const updatedItems = this.state.items.filter(item => item.id !== id);
      this.setState({
        ...this.state,
        items: updatedItems,
      });

      const cacheKey = this.getCacheKey(this.userId);
      cache.set(cacheKey, updatedItems, CACHE_TTL);

      // Notify subscribers of the state change
      this.notifySubscribers();

      return true;
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'InventoryStore',
        action: 'remove_item',
        metadata: { userId: this.userId, itemId: id },
      });
      return false;
    }
  }

  async clearInventory(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      console.log('[InventoryStore] Starting to clear inventory from database');

      // Clear from database
      const success = await clearAllInventory();

      if (success) {
        console.log('[InventoryStore] Successfully cleared inventory from database');

        // Clear local state
        const emptyState = {
          items: [],
          isLoading: false,
          error: null,
          connectionError: false,
        };

        // Update state
        this.setState(emptyState);

        // Clear cache
        const cacheKey = this.getCacheKey(this.userId);
        cache.clear();

        // Notify subscribers of the state change
        this.notifySubscribers();

        console.log('[InventoryStore] Cleared local state, persisted state, and cache');
        return true;
      } else {
        console.error('[InventoryStore] Failed to clear inventory from database');
        return false;
      }
    } catch (error) {
      console.error('[InventoryStore] Error in clearInventory:', error);
      errorHandler.handleError(error, {
        component: 'inventoryStore',
        action: 'clear_inventory',
      });
      return false;
    }
  }

  async regenerateInventory(count: number): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // First clear existing inventory
      await this.clearInventory();

      // Generate new items
      const newItems = Array.from({ length: count }, (_, index) => ({
        name: `Item ${index + 1}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unit: ['kg', 'g', 'l', 'ml', 'pcs'][Math.floor(Math.random() * 5)],
        category: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen'][Math.floor(Math.random() * 5)],
        price: Math.floor(Math.random() * 100),
        store: ['Supermarket', 'Local Market', 'Bakery', 'Butcher', 'Farm'][
          Math.floor(Math.random() * 5)
        ],
        notes: `Sample item ${index + 1}`,
        expiration_date: new Date(
          Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        purchase_date: new Date().toISOString(),
        user_id: this.userId,
      }));

      // Insert new items
      const { data, error } = await performanceMonitor.measureAsync(
        'inventory_regenerate',
        async () => {
          return await supabase.from('inventory_items').insert(newItems).select();
        }
      );

      if (error) {
        errorHandler.handleError(error, {
          component: 'InventoryStore',
          action: 'regenerate_inventory',
          metadata: { userId: this.userId },
        });
        return false;
      }

      // Update local state and cache
      const inventoryItems = mapDbItemsToInventoryItems(data);
      this.setState({
        ...this.state,
        items: inventoryItems,
      });

      const cacheKey = this.getCacheKey(this.userId);
      cache.set(cacheKey, inventoryItems, CACHE_TTL);

      return true;
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'InventoryStore',
        action: 'regenerate_inventory',
        metadata: { userId: this.userId },
      });
      return false;
    }
  }

  getState(): InventoryState {
    return this.state;
  }

  // Method to destroy the store instance (useful for testing)
  destroy(): void {
    this.userId = null;
    this.lastFetchedUserId = null;
    this.setState({
      items: [],
      isLoading: false,
      error: null,
      connectionError: false,
    });
    // @ts-ignore
    InventoryStore.instance = null;
  }

  subscribe(callback: (state: InventoryState) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

export const inventoryStore = InventoryStore.getInstance();
