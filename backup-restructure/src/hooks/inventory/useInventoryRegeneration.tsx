import { useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { generateSampleInventory } from '../../utils/sampleData';
import { useInventoryDatabase } from './database/useInventoryDatabase';
import { useToast } from '@/hooks/use-toast';

export const useInventoryRegeneration = () => {
  const { user } = useUserContext();
  const { clearInventory, saveInventoryItems } = useInventoryDatabase();
  const { toast } = useToast();

  const regenerateInventory = useCallback(async () => {
    console.log('Starting inventory regeneration process...');
    console.log('Current user:', user);

    if (!user?.id) {
      console.warn('Cannot regenerate inventory: No user logged in');
      toast({
        title: 'Not logged in',
        description: 'Please log in to regenerate your inventory',
        variant: 'destructive',
      });
      return false;
    }

    try {
      console.log('Starting inventory regeneration for user:', user.id);

      // Clear existing inventory
      console.log('Clearing existing inventory...');
      const cleared = await clearInventory(user.id);
      if (!cleared) {
        console.error('Failed to clear existing inventory');
        toast({
          title: 'Error clearing inventory',
          description: 'Could not clear existing inventory items',
          variant: 'destructive',
        });
        return false;
      }
      console.log('Successfully cleared existing inventory');

      // Generate new items
      console.log('Generating new inventory items...');
      const newItems = generateSampleInventory(10);
      console.log(`Generated ${newItems.length} new inventory items:`, newItems);

      // Save new items
      console.log('Saving new inventory items to database...');
      const saved = await saveInventoryItems(newItems, user.id);
      if (!saved) {
        console.error('Failed to save new inventory items');
        toast({
          title: 'Error saving inventory',
          description: 'Could not save new inventory items',
          variant: 'destructive',
        });
        return false;
      }
      console.log('Successfully saved new inventory items');

      console.log('Successfully completed inventory regeneration');
      toast({
        title: 'Inventory regenerated',
        description: 'Your inventory has been refreshed with new items',
      });

      return true;
    } catch (error) {
      console.error('Error in regenerateInventory:', error);
      toast({
        title: 'Error regenerating inventory',
        description: 'An unexpected error occurred while regenerating your inventory',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, clearInventory, saveInventoryItems, toast]);

  return {
    regenerateInventory,
  };
};
