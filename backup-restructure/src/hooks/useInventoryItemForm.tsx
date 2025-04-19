/**
 * @deprecated Use useInventoryDialog from src/hooks/inventory/useInventoryDialog.tsx instead
 */

import { InventoryItem } from '@/context/InventoryContext';
import { useInventoryDialog } from './inventory/useInventoryDialog';

/**
 * This hook is kept for backward compatibility.
 * Please use useInventoryDialog from src/hooks/inventory/useInventoryDialog.tsx for new code.
 */
export const useInventoryItemForm = (
  inventory: InventoryItem[],
  addInventoryItem: (item: Partial<InventoryItem>) => void,
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void
) => {
  return useInventoryDialog(inventory, addInventoryItem, updateInventoryItem);
};

export default useInventoryItemForm;
