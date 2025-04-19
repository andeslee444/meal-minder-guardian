import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';

export interface IngredientSelection {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  selected: boolean;
}

export const useIngredientSelection = (inventory: InventoryItem[]) => {
  const [selectedItems, setSelectedItems] = useState<IngredientSelection[]>([]);
  const [customIngredient, setCustomIngredient] = useState('');

  useEffect(() => {
    const mappedItems = inventory.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      selected: false,
    }));
    setSelectedItems(mappedItems);
  }, [inventory]);

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim()) {
      const newItem: IngredientSelection = {
        id: crypto.randomUUID(),
        name: customIngredient.trim(),
        quantity: 1,
        unit: 'item',
        selected: true,
      };
      setSelectedItems(prev => [...prev, newItem]);
      setCustomIngredient('');
    }
  };

  return {
    selectedItems,
    customIngredient,
    setCustomIngredient,
    toggleItemSelection,
    addCustomIngredient,
  };
};
