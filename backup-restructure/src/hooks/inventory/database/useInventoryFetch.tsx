import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useUserContext } from '@/context/UserContext';
import { InventoryItem } from '@/types/inventory';
import { mapDbItemsToInventoryItems } from '@/utils/inventoryMappers';
import { logger } from '@/utils/logger';
import { cache } from '@/utils/cache';
import { performanceMonitor } from '@/utils/performance';
import { errorHandler } from '@/utils/errorHandler';
import { stateManager } from '@/utils/stateManager';
import { PostgrestResponse } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

const CACHE_KEY_PREFIX = 'inventory:';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type InventoryItemDB = Tables<'inventory_items'>;

export const useInventoryFetch = () => {
  const { user } = useUserContext();
  const { toast } = useToast();

  // Use stateManager for state management
  const [inventory, setInventory] = stateManager.createState<InventoryItem[]>('inventory', []);
  const [isLoading, setIsLoading] = stateManager.createState<boolean>('inventory_loading', false);
  const [error, setError] = stateManager.createState<Error | null>('inventory_error', null);
  const [connectionError, setConnectionError] = stateManager.createState<boolean>(
    'inventory_connection',
    false
  );

  // Add a ref to track if we've already fetched for this user
  const lastFetchedUserIdRef = useRef<string | null>(null);

  const getCacheKey = useCallback((userId: string): string => {
    return `${CACHE_KEY_PREFIX}${userId}`;
  }, []);

  const fetchInventory = useCallback(async () => {
    if (!user || isLoading) return [];

    try {
      setIsLoading(true);
      setError(null);
      setConnectionError(false);

      // Check cache first
      const cacheKey = getCacheKey(user.id);
      const cachedItems = cache.get<InventoryItem[]>(cacheKey);
      if (cachedItems) {
        setInventory(cachedItems);
        lastFetchedUserIdRef.current = user.id;
        return cachedItems;
      }

      // First verify the table exists and user has access
      const checkResponse = (await performanceMonitor.measureAsync(
        'inventory_check_access',
        async () => {
          const { data, error } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          return { data, error };
        }
      )) as PostgrestResponse<{ id: string }[]>;

      if (checkResponse.error) {
        if (checkResponse.error.code === '42P01') {
          setConnectionError(true);
          return [];
        }
        throw checkResponse.error;
      }

      // If we get here, we have access to the table
      const response = (await performanceMonitor.measureAsync('inventory_fetch', async () => {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        return { data, error };
      })) as PostgrestResponse<InventoryItemDB[]>;

      if (response.error) {
        setError(response.error);
        setConnectionError(true);

        if (response.error.code !== '42P01') {
          toast({
            title: 'Failed to load inventory',
            description: response.error.message,
            variant: 'destructive',
          });
        }
        return [];
      }

      // Transform database items to application model
      const inventoryItems = mapDbItemsToInventoryItems(response.data || []);
      setInventory(inventoryItems);
      lastFetchedUserIdRef.current = user.id;

      // Update cache
      cache.set(cacheKey, inventoryItems, CACHE_TTL);

      return inventoryItems;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      errorHandler.handleError(error, {
        component: 'useInventoryFetch',
        action: 'fetch_inventory',
        metadata: { userId: user?.id },
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    isLoading,
    getCacheKey,
    setInventory,
    setIsLoading,
    setError,
    setConnectionError,
    toast,
  ]);

  // Only fetch when user changes or cache expires
  useEffect(() => {
    if (user?.id) {
      const cacheKey = getCacheKey(user.id);
      const cachedItems = cache.get<InventoryItem[]>(cacheKey);

      if (cachedItems) {
        setInventory(cachedItems);
        lastFetchedUserIdRef.current = user.id;
      } else if (user.id !== lastFetchedUserIdRef.current) {
        fetchInventory();
      }
    }
  }, [user?.id, fetchInventory, getCacheKey, setInventory]);

  const refreshInventory = useCallback(() => {
    if (user?.id) {
      const cacheKey = getCacheKey(user.id);
      cache.delete(cacheKey);
    }
    return fetchInventory();
  }, [user?.id, fetchInventory, getCacheKey]);

  // Function to initialize inventory with sample data
  const initializeWithSampleInventory = async (sampleData: InventoryItem[]) => {
    if (!user) return false;

    try {
      // First, make sure there's no existing inventory
      const existingItems = await fetchInventory();
      if (existingItems && existingItems.length > 0) {
        return false;
      }

      // Prepare the sample data with user_id
      const itemsWithUserId = sampleData.map(item => ({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        price: item.price,
        store: item.store,
        notes: item.notes,
        // Map camelCase to snake_case
        purchase_date: item.purchaseDate,
        expiration_date: item.expirationDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert the sample data
      const response = (await performanceMonitor.measureAsync('inventory_initialize', async () => {
        const { data, error } = await supabase.from('inventory_items').insert(itemsWithUserId);
        return { data, error };
      })) as PostgrestResponse<InventoryItemDB[]>;

      if (response.error) {
        errorHandler.handleError(response.error, {
          component: 'useInventoryFetch',
          action: 'initialize_inventory',
          metadata: { userId: user.id },
        });
        return false;
      }

      return true;
    } catch (err) {
      errorHandler.handleError(err, {
        component: 'useInventoryFetch',
        action: 'initialize_inventory',
        metadata: { userId: user.id },
      });
      return false;
    }
  };

  return {
    inventory,
    isLoading,
    error,
    connectionError,
    refreshInventory,
    fetchInventory,
    initializeWithSampleInventory,
  };
};
