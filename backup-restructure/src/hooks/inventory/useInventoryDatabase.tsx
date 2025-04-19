import { useInventoryFetch } from './database/useInventoryFetch';
import { useInventoryMutations } from './database/useInventoryMutations';
import { useInventoryBatchOperations } from './database/useInventoryBatchOperations';

export const useInventoryDatabase = () => {
  const {
    isLoading,
    error,
    connectionError,
    refreshInventory,
    fetchInventoryItems,
    initializeWithSampleInventory,
  } = useInventoryFetch();

  const { addItemToDatabase, removeItemFromDatabase, updateItemInDatabase } =
    useInventoryMutations();

  const { clearInventoryInDatabase, batchInsertItems } = useInventoryBatchOperations();

  return {
    // Data fetching
    isLoading,
    error,
    connectionError,
    fetchInventoryItems,
    refreshInventory,
    initializeWithSampleInventory,

    // Single item mutations
    addItemToDatabase,
    removeItemFromDatabase,
    updateItemInDatabase,

    // Batch operations
    clearInventoryInDatabase,
    batchInsertItems,
  };
};
