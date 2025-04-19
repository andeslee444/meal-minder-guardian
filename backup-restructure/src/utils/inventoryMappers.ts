import { InventoryItem } from '@/types/inventory';
import { Database } from '@/integrations/supabase/types';

type InventoryItemDB = Database['public']['Tables']['inventory_items']['Row'];

/**
 * Maps database inventory item to application inventory item
 */
export const mapDbItemToInventoryItem = (dbItem: InventoryItemDB): InventoryItem => {
  return {
    id: dbItem.id,
    name: dbItem.name,
    quantity: Number(dbItem.quantity),
    unit: dbItem.unit,
    category: dbItem.category || 'Uncategorized',
    price: Number(dbItem.price || 0),
    store: dbItem.store || '',
    notes: dbItem.notes || '',
    // Map database snake_case to application camelCase
    expirationDate: dbItem.expiration_date || new Date().toISOString(),
    purchaseDate: dbItem.purchase_date || new Date().toISOString(),
    // Add any other fields as needed
  };
};

/**
 * Maps an array of database items to application inventory items
 */
export const mapDbItemsToInventoryItems = (dbItems: InventoryItemDB[] | null): InventoryItem[] => {
  if (!dbItems) return [];
  return dbItems.map(mapDbItemToInventoryItem);
};

/**
 * Maps application inventory item to database format
 */
export const mapInventoryItemToDbItem = (
  item: InventoryItem,
  userId: string
): Database['public']['Tables']['inventory_items']['Insert'] => {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    price: item.price,
    store: item.store,
    notes: item.notes,
    // Map application camelCase to database snake_case
    expiration_date: item.expirationDate,
    purchase_date: item.purchaseDate,
    user_id: userId,
  };
};
