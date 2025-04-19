import { InventoryItem } from '@/types/inventory';

const categories = [
  'Produce',
  'Dairy',
  'Meat',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Household',
];

const units = ['kg', 'g', 'l', 'ml', 'pcs', 'box', 'bottle', 'pack'];

const stores = ['Walmart', 'Target', 'Costco', 'Whole Foods', "Trader Joe's", 'Local Market'];

const foodItems = [
  { name: 'Apples', category: 'Produce', unit: 'kg' },
  { name: 'Milk', category: 'Dairy', unit: 'l' },
  { name: 'Chicken Breast', category: 'Meat', unit: 'kg' },
  { name: 'Rice', category: 'Pantry', unit: 'kg' },
  { name: 'Frozen Vegetables', category: 'Frozen', unit: 'kg' },
  { name: 'Orange Juice', category: 'Beverages', unit: 'l' },
  { name: 'Chips', category: 'Snacks', unit: 'pack' },
  { name: 'Paper Towels', category: 'Household', unit: 'roll' },
  { name: 'Bananas', category: 'Produce', unit: 'kg' },
  { name: 'Yogurt', category: 'Dairy', unit: 'g' },
  { name: 'Ground Beef', category: 'Meat', unit: 'kg' },
  { name: 'Pasta', category: 'Pantry', unit: 'kg' },
  { name: 'Ice Cream', category: 'Frozen', unit: 'l' },
  { name: 'Coffee', category: 'Beverages', unit: 'g' },
  { name: 'Cookies', category: 'Snacks', unit: 'pack' },
  { name: 'Dish Soap', category: 'Household', unit: 'bottle' },
];

export const generateSampleInventory = (count: number = 10): Partial<InventoryItem>[] => {
  const items: Partial<InventoryItem>[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const price = (Math.random() * 20 + 1).toFixed(2);
    const purchaseDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const expirationDate = new Date(
      purchaseDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000
    );

    items.push({
      name: foodItem.name,
      quantity,
      unit: foodItem.unit,
      category: foodItem.category,
      price: parseFloat(price),
      store: stores[Math.floor(Math.random() * stores.length)],
      purchaseDate: purchaseDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      notes: `Sample item ${i + 1}`,
    });
  }

  return items;
};
