import { useState } from 'react';
import { InventoryItem } from '@/context/InventoryContext';
import { useInventoryForm, defaultFormState } from './useInventoryForm';

/**
 * Hook for managing inventory dialog state and interactions
 */
export const useInventoryDialog = (
  inventory: InventoryItem[],
  addInventoryItem: (item: Partial<InventoryItem>) => void,
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);

  const { formData, setFormData, resetForm } = useInventoryForm();

  // Open dialog for editing an existing item
  const handleEditItem = (id: string) => {
    const item = inventory.find(item => item.id === id);
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: item.purchaseDate,
        expirationDate: item.expirationDate,
        price: item.price,
        store: item.store || '',
      });
      setCurrentItemId(id);
      setIsEditing(true);
      setIsDialogOpen(true);
    }
  };

  // Open dialog for adding a new item
  const openAddItemDialog = () => {
    resetForm();
    setIsEditing(false);
    setCurrentItemId(null);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentItemId) {
      updateInventoryItem(currentItemId, formData);
    } else {
      addInventoryItem(formData);
    }

    // Reset form and close dialog
    resetFormAndClose();
  };

  // Reset form and close dialog
  const resetFormAndClose = () => {
    resetForm();
    setCurrentItemId(null);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    currentItemId,
    formData,
    setFormData,
    handleEditItem,
    openAddItemDialog,
    handleSubmit,
    resetFormAndClose,
  };
};
