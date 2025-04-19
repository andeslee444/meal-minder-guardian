import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInventoryContext } from '@/context/InventoryContext';
import { useUserContext } from '@/context/UserContext';
import { ScanningStage, ScannedItem } from '../types';
import { demoReceiptItems } from '../data/demoReceiptItems';
import {
  simulateUpload,
  simulateOcrProcessing,
  simulateItemProcessing,
  formatInventoryItem,
} from '../utils/scanningUtils';

export const useReceiptScanner = () => {
  const { addItem, reloadInventory } = useInventoryContext();
  const { user } = useUserContext();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [scanningStage, setScanningStage] = useState<ScanningStage>('idle');
  const [progress, setProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Simulate the scanning process step by step
  const handleScan = async () => {
    if (!file) return;

    // Reset state
    setScannedItems([]);
    setScanningStage('uploading');
    setProgress(10);

    // Simulate file upload delay
    await simulateUpload();
    setScanningStage('analyzing');
    setProgress(30);

    // Simulate receipt OCR processing
    await simulateOcrProcessing();
    setProgress(60);

    // Simulate finding items one by one
    setScanningStage('listing');

    // Add items one by one with animation
    for (let i = 0; i < demoReceiptItems.length; i++) {
      const newProgress = 60 + Math.round(((i + 1) / demoReceiptItems.length) * 40);
      setProgress(newProgress);

      // Add the item as processing
      setScannedItems(prev => [
        ...prev,
        {
          ...demoReceiptItems[i],
          added: false,
          processing: true,
        },
      ]);

      // Simulate processing delay (staggered for visual effect)
      await simulateItemProcessing();

      // Mark as processed but not added yet
      setScannedItems(prev =>
        prev.map((item, idx) => (idx === i ? { ...item, processing: false } : item))
      );
    }

    setScanningStage('complete');
  };

  // Add an item to inventory
  const handleAddItem = async (index: number) => {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to add items to your inventory.',
        variant: 'destructive',
      });
      return;
    }

    const item = scannedItems[index];

    if (!item.added) {
      // Create inventory item from scanned item
      const inventoryItem = formatInventoryItem(item);

      // Add to inventory
      const success = await addItem(inventoryItem);

      if (success) {
        // Mark as added
        setScannedItems(prev =>
          prev.map((item, idx) => (idx === index ? { ...item, added: true } : item))
        );

        // Show toast
        toast({
          title: 'Item Added',
          description: `${item.name} has been added to your inventory`,
        });
      } else {
        toast({
          title: 'Error Adding Item',
          description: 'Failed to add item to inventory. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Add all items at once
  const handleAddAll = async () => {
    if (!user) {
      console.log('[ReceiptScanner] User not logged in, cannot add items');
      toast({
        title: 'Not Logged In',
        description: 'Please log in to add items to your inventory.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[ReceiptScanner] Starting to add all items');
      console.log('[ReceiptScanner] Current scanned items:', scannedItems);

      // Get all items that haven't been added yet
      const itemsToAdd = scannedItems.filter(item => !item.added && !item.processing);
      console.log('[ReceiptScanner] Items to add:', itemsToAdd);

      // Process each item sequentially
      for (const item of itemsToAdd) {
        console.log('[ReceiptScanner] Processing item:', item);

        // Find the original index in scannedItems
        const originalIndex = scannedItems.findIndex(
          scannedItem => scannedItem.name === item.name && scannedItem.price === item.price
        );

        if (originalIndex === -1) {
          console.log('[ReceiptScanner] Could not find original index for item:', item);
          continue; // Skip if item not found
        }

        // Create inventory item from scanned item
        const inventoryItem = formatInventoryItem(item);
        console.log('[ReceiptScanner] Formatted inventory item:', inventoryItem);

        // Add to inventory
        console.log('[ReceiptScanner] Attempting to add item to inventory');
        const success = await addItem(inventoryItem);
        console.log('[ReceiptScanner] Add item result:', success);

        if (success) {
          // Mark as added using the original index
          setScannedItems(prev => {
            const updated = prev.map((prevItem, idx) =>
              idx === originalIndex ? { ...prevItem, added: true } : prevItem
            );
            console.log('[ReceiptScanner] Updated scanned items:', updated);
            return updated;
          });

          // Show toast for each successful addition
          toast({
            title: 'Item Added',
            description: `${item.name} has been added to your inventory`,
          });
        } else {
          throw new Error(`Failed to add ${item.name}`);
        }
      }

      // Show a summary toast
      toast({
        title: 'All Items Added',
        description: 'All remaining items have been added to your inventory',
      });

      // Refresh the inventory without page reload
      console.log('[ReceiptScanner] Refreshing inventory');
      await reloadInventory();
    } catch (error) {
      console.error('[ReceiptScanner] Error adding items:', error);
      toast({
        title: 'Error Adding Items',
        description: 'Some items failed to be added. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Reset the scanner
  const handleReset = () => {
    setFile(null);
    setScannedItems([]);
    setScanningStage('idle');
    setProgress(0);
  };

  return {
    file,
    scanningStage,
    progress,
    scannedItems,
    handleFileChange,
    handleScan,
    handleAddItem,
    handleAddAll,
    handleReset,
  };
};
