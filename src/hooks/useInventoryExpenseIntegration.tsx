import { useEffect, useState, useRef } from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { useExpenseContext } from '@/context/ExpenseContext';
import { InventoryItem } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { addStatusMessage } from '@/components/ui/status';

export const useInventoryExpenseIntegration = () => {
  const { items: inventory = [] } = useInventoryContext();
  const { addExpense } = useExpenseContext();
  const { toast } = useToast();
  const previousInventoryRef = useRef<InventoryItem[]>([]);

  useEffect(() => {
    // Skip if inventory is undefined or empty
    if (!inventory || inventory.length === 0) {
      previousInventoryRef.current = [];
      return;
    }

    // Skip first render (when previousInventory is empty)
    if (previousInventoryRef.current.length === 0) {
      previousInventoryRef.current = [...inventory];
      return;
    }

    // Find new items that weren't in the previous inventory
    const newItems = inventory.filter(
      currentItem => !previousInventoryRef.current.some(prevItem => prevItem.id === currentItem.id)
    );

    // Skip if no new items
    if (newItems.length === 0) {
      previousInventoryRef.current = [...inventory];
      return;
    }

    console.log(`Detected ${newItems.length} new inventory items for expense tracking`);

    // Group by store
    const storeGroups: Record<string, InventoryItem[]> = {};
    newItems.forEach(item => {
      const store = item.store || 'Unknown Store';
      if (!storeGroups[store]) {
        storeGroups[store] = [];
      }
      storeGroups[store].push(item);
    });

    // Create expenses for each store group
    Object.entries(storeGroups).forEach(([store, items]) => {
      // Calculate total amount
      const totalAmount = items.reduce((total, item) => total + item.price, 0);

      // Skip if total is 0
      if (totalAmount === 0) return;

      // Create the expense
      addExpense({
        name: `Grocery Purchase - ${store}`,
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        category: 'Grocery',
        store: store,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
        })),
      });

      // Use the status indicator system instead of toast
      addStatusMessage(
        'info',
        `Added $${totalAmount.toFixed(2)} expense from ${items.length} items at ${store}`,
        'Expense Tracker'
      );

      console.log(
        `Created expense for ${store} with ${items.length} items totaling $${totalAmount.toFixed(2)}`
      );
    });

    // Update reference to current inventory
    previousInventoryRef.current = [...inventory];
  }, [inventory, addExpense]);

  return null; // No need to return anything as this is just a side effect
};
