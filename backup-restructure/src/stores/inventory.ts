import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import type { InventoryItem } from '@/types/inventory';

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchItems() {
    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      items.value = data || [];
    } catch (err) {
      console.error('Error fetching inventory:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch inventory';
    } finally {
      isLoading.value = false;
    }
  }

  async function updateItem(item: InventoryItem) {
    try {
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          quantity: item.quantity,
          unit: item.unit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Update local state
      const index = items.value.findIndex(i => i.id === item.id);
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...item };
      }
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    updateItem,
  };
});
