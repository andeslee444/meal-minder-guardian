import { v4 as uuidv4 } from 'uuid';
import { InventoryItem } from '@/types/inventory';

// Sample inventory data
export const sampleInventory: InventoryItem[] = [
  {
    id: uuidv4(),
    name: 'Chicken Breast',
    quantity: 2,
    unit: 'lbs',
    category: 'Meat',
    price: 8.99,
    store: 'Whole Foods',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    notes: 'Organic free-range',
  },
  {
    id: uuidv4(),
    name: 'Broccoli',
    quantity: 1,
    unit: 'head',
    category: 'Vegetables',
    price: 2.49,
    store: 'Kroger',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    notes: 'Fresh and green',
  },
  {
    id: uuidv4(),
    name: 'Almonds',
    quantity: 8,
    unit: 'oz',
    category: 'Snacks',
    price: 6.79,
    store: "Trader Joe's",
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    notes: 'Unsalted',
  },
  {
    id: uuidv4(),
    name: 'Cheddar Cheese',
    quantity: 1,
    unit: 'block',
    category: 'Dairy',
    price: 7.29,
    store: 'Safeway',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    notes: 'Sharp cheddar',
  },
  {
    id: uuidv4(),
    name: 'Whole Wheat Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    price: 3.19,
    store: 'Whole Foods',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    notes: 'Freshly baked',
  },
  {
    id: uuidv4(),
    name: 'Salmon Fillet',
    quantity: 2,
    unit: 'lbs',
    category: 'Seafood',
    price: 15.99,
    store: 'Costco',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    notes: 'Wild-caught',
  },
  {
    id: uuidv4(),
    name: 'Avocado',
    quantity: 3,
    unit: 'pcs',
    category: 'Produce',
    price: 2.29,
    store: "Trader Joe's",
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    notes: 'Ready to eat',
  },
  {
    id: uuidv4(),
    name: 'Pasta',
    quantity: 1,
    unit: 'box',
    category: 'Pantry',
    price: 1.79,
    store: 'Safeway',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 365)).toISOString(),
    notes: 'Spaghetti',
  },
  {
    id: uuidv4(),
    name: 'Olive Oil',
    quantity: 1,
    unit: 'bottle',
    category: 'Pantry',
    price: 9.49,
    store: 'Whole Foods',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 730)).toISOString(),
    notes: 'Extra virgin',
  },
  {
    id: uuidv4(),
    name: 'Canned Tomatoes',
    quantity: 3,
    unit: 'cans',
    category: 'Canned Goods',
    price: 1.19,
    store: 'Kroger',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 600)).toISOString(),
    notes: 'Diced',
  },
  {
    id: uuidv4(),
    name: 'Milk',
    quantity: 1,
    unit: 'gallon',
    category: 'Dairy',
    price: 3.99,
    store: 'Costco',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    notes: '2% Reduced Fat',
  },
  {
    id: uuidv4(),
    name: 'Eggs',
    quantity: 12,
    unit: 'count',
    category: 'Dairy',
    price: 4.5,
    store: "Trader Joe's",
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    notes: 'Large, Grade A',
  },
  {
    id: uuidv4(),
    name: 'Apples',
    quantity: 5,
    unit: 'count',
    category: 'Fruit',
    price: 3.0,
    store: 'Whole Foods',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    notes: 'Fuji',
  },
  {
    id: uuidv4(),
    name: 'Bananas',
    quantity: 6,
    unit: 'count',
    category: 'Fruit',
    price: 2.0,
    store: 'Kroger',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    notes: 'Organic',
  },
  {
    id: uuidv4(),
    name: 'Rice',
    quantity: 1,
    unit: 'bag',
    category: 'Pantry',
    price: 6.75,
    store: 'Safeway',
    purchaseDate: new Date().toISOString(),
    expirationDate: new Date(new Date().setDate(new Date().getDate() + 500)).toISOString(),
    notes: 'Long Grain',
  },
];

// Function to generate random expiration dates
const getRandomExpirationDate = (): string => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 15) + 1;
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + randomDays);
  return expirationDate.toISOString();
};

// Function to generate random purchase dates
const getRandomPurchaseDate = (): string => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 7);
  const purchaseDate = new Date(today);
  purchaseDate.setDate(today.getDate() - randomDays);
  return purchaseDate.toISOString();
};

// Function to generate random inventory items
export const generateSampleInventory = (count: number = 10): InventoryItem[] => {
  // Use the first 'count' items from the sample inventory
  return sampleInventory.slice(0, count).map(item => ({
    ...item,
    id: uuidv4(), // Generate new IDs for each item
    purchaseDate: getRandomPurchaseDate(),
    expirationDate: getRandomExpirationDate(),
  }));
};
