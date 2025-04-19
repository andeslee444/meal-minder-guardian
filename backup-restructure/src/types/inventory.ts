export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  expirationDate: string;
  purchaseDate: string;
  category: string;
  price: number;
  store: string;
  notes?: string;
}

export interface InventoryContextType {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  connectionError: boolean;
  addItem: (item: InventoryItem) => Promise<boolean>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  clearInventory: () => Promise<boolean>;
  reloadInventory: () => Promise<void>;
  isFetchingInventory: boolean;
}
