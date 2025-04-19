import { ScannedItem } from '../types';

// Demo items that would be extracted from a receipt
export const demoReceiptItems: Omit<ScannedItem, 'added' | 'processing'>[] = [
  {
    name: 'Organic Milk',
    quantity: 1,
    unit: 'gallon',
    price: 4.99,
    category: 'Dairy',
  },
  {
    name: 'Whole Wheat Bread',
    quantity: 1,
    unit: 'loaf',
    price: 3.49,
    category: 'Bakery',
  },
  {
    name: 'Bananas',
    quantity: 1,
    unit: 'bunch',
    price: 1.99,
    category: 'Produce',
  },
  {
    name: 'Chicken Breast',
    quantity: 1.5,
    unit: 'lb',
    price: 7.99,
    category: 'Meat',
  },
  {
    name: 'Spinach',
    quantity: 1,
    unit: 'package',
    price: 2.99,
    category: 'Produce',
  },
];
