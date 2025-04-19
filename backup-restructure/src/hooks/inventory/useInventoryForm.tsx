import { useState } from 'react';
import { InventoryItem } from '@/context/InventoryContext';

// Default state for the inventory form
export const defaultFormState = {
  name: '',
  category: 'Produce',
  quantity: 1,
  unit: 'item',
  purchaseDate: new Date().toISOString().split('T')[0],
  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  price: 0,
  store: '',
};

/**
 * Hook for managing inventory form state and validation
 */
export const useInventoryForm = (initialData = defaultFormState) => {
  const [formData, setFormData] = useState(initialData);

  // Reset form to default or provided values
  const resetForm = (data = defaultFormState) => {
    setFormData(data);
  };

  // Update a specific field in the form
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;

    // Handle number inputs
    if (type === 'number') {
      updateField(id, parseFloat(value) || 0);
    } else {
      updateField(id, value);
    }
  };

  return {
    formData,
    setFormData,
    resetForm,
    updateField,
    handleChange,
  };
};
