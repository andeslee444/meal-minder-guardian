import { supabase } from './supabase-client';
import { InventoryItem } from '../src/types/inventory';

export class InventoryStore {
  private userId: string | null = null;
  private items: InventoryItem[] = [];

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async fetchInventory(): Promise<InventoryItem[]> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', this.userId);

    if (error) {
      throw error;
    }

    this.items = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || '',
      price: item.price || 0,
      store: item.store || '',
      notes: item.notes || '',
      expirationDate: item.expiration_date || '',
      purchaseDate: item.purchase_date || '',
      userId: item.user_id,
      severity: 'normal',
    }));

    return this.items;
  }

  getItems(): InventoryItem[] {
    return this.items;
  }
}

export const inventoryStore = new InventoryStore();
