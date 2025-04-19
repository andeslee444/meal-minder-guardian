import { ScannedItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Simulate uploading a receipt image
export const simulateUpload = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
};

// Simulate OCR processing of the receipt
export const simulateOcrProcessing = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
};

// Simulate processing a single item
export const simulateItemProcessing = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Format inventory item from scanned item
export const formatInventoryItem = (item: ScannedItem) => {
  const now = new Date();
  const expirationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: uuidv4(),
    name: item.name,
    quantity: item.quantity || 1,
    unit: item.unit || 'item',
    price: item.price || 0,
    category: item.category || 'Uncategorized',
    store: 'Receipt Scan',
    purchaseDate: now.toISOString().split('T')[0],
    expirationDate: expirationDate.toISOString().split('T')[0],
    notes: `Added from receipt scan on ${now.toLocaleDateString()}`,
  };
};
