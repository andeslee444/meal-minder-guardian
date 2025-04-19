import { useState } from 'react';

export const useInventoryCallbacks = () => {
  const [inventoryCallbacks, setInventoryCallbacks] = useState<(() => void)[]>([]);

  const addInventoryCallback = (callback: () => void) => {
    setInventoryCallbacks(prev => [...prev, callback]);
  };

  const removeInventoryCallback = (callback: () => void) => {
    setInventoryCallbacks(prev => prev.filter(cb => cb !== callback));
  };

  const executeCallbacks = () => {
    inventoryCallbacks.forEach(callback => callback());
  };

  return {
    addInventoryCallback,
    removeInventoryCallback,
    executeCallbacks,
  };
};
