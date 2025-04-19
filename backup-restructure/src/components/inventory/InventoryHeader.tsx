import React from 'react';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/InventoryContext';

type InventoryHeaderProps = {
  onOpenAddItemDialog: () => void;
};

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onOpenAddItemDialog }) => {
  const { toast } = useToast();
  const { clearInventory } = useInventory();

  const handleClearAll = async () => {
    console.log('[InventoryHeader] Clear all button clicked');
    if (
      window.confirm('Are you sure you want to clear all inventory items? This cannot be undone.')
    ) {
      console.log('[InventoryHeader] User confirmed clear all');
      try {
        const success = await clearInventory();
        console.log('[InventoryHeader] Clear all result:', success);
        if (success) {
          toast({
            title: 'Inventory cleared',
            description: 'All inventory items have been removed.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to clear inventory. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[InventoryHeader] Error in handleClearAll:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while clearing inventory.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('[InventoryHeader] User cancelled clear all');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-display font-semibold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">
          Keep track of your food items and their expiration dates.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="destructive" onClick={handleClearAll}>
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear All
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onOpenAddItemDialog}>
              <PlusIcon className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};

export default InventoryHeader;
