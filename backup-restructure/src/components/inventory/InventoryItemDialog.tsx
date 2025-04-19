import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import InventoryItemForm from './InventoryItemForm';

type InventoryItemDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isEditing: boolean;
  formData: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    purchaseDate: string;
    expirationDate: string;
    price: number;
    store: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

const InventoryItemDialog: React.FC<InventoryItemDialogProps> = ({
  isOpen,
  setIsOpen,
  isEditing,
  formData,
  setFormData,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this inventory item.'
              : 'Add a new item to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <InventoryItemForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemDialog;
