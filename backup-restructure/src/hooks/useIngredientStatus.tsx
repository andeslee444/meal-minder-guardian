import { useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';

export function useIngredientStatus(inventory: InventoryItem[] | undefined) {
  // Create a memoized function to determine ingredient status
  const getIngredientStatus = useMemo(() => {
    // Handle undefined inventory
    if (!inventory) {
      return (name: string): 'available' | 'missing' | 'expired' | 'expiring-soon' => {
        return 'missing';
      };
    }

    // Create a normalized map of inventory items for faster lookup
    const inventoryMap = new Map(inventory.map(item => [item.name.toLowerCase().trim(), item]));

    return (name: string): 'available' | 'missing' | 'expired' | 'expiring-soon' => {
      if (!name) return 'missing';

      // Normalize the ingredient name for comparison
      const normalizedName = name.toLowerCase().trim();

      // Try exact match first
      let ingredient = inventoryMap.get(normalizedName);

      // If no exact match, try to find a partial match
      if (!ingredient) {
        // Check if any inventory item name contains this ingredient or vice versa
        for (const [itemName, item] of inventoryMap.entries()) {
          if (normalizedName.includes(itemName) || itemName.includes(normalizedName)) {
            ingredient = item;
            break;
          }
        }
      }

      if (!ingredient) return 'missing';

      const expDate = new Date(ingredient.expirationDate);
      const today = new Date();
      const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration <= 0) return 'expired';
      if (daysUntilExpiration <= 3) return 'expiring-soon';
      return 'available';
    };
  }, [inventory]);

  return { getIngredientStatus };
}
