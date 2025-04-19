import { renderHook } from '@testing-library/react';
import { useInventoryItemForm } from '@/hooks/useInventoryItemForm';
import { useInventoryDialog } from '../useInventoryDialog';
import { InventoryItem } from '@/types/inventory';

// Mock the imported hook
jest.mock('../useInventoryDialog');

describe('useInventoryItemForm', () => {
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Test Item',
      category: 'Test',
      quantity: 1,
      unit: 'item',
      purchaseDate: '2023-01-01',
      expirationDate: '2023-01-07',
      price: 1.99,
      store: 'Test Store',
    },
  ];

  const mockAddItem = jest.fn();
  const mockUpdateItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the implementation to return test values
    (useInventoryDialog as jest.Mock).mockReturnValue({
      isDialogOpen: false,
      setIsDialogOpen: jest.fn(),
      isEditing: false,
      currentItemId: null,
      formData: { name: 'Test' },
      setFormData: jest.fn(),
      handleEditItem: jest.fn(),
      openAddItemDialog: jest.fn(),
      handleSubmit: jest.fn(),
      resetFormAndClose: jest.fn(),
    });
  });

  test('returns values from useInventoryDialog', () => {
    const { result } = renderHook(() =>
      useInventoryItemForm(mockInventory, mockAddItem, mockUpdateItem)
    );

    // Verify it returns the same values from useInventoryDialog
    expect(result.current).toHaveProperty('isDialogOpen');
    expect(result.current).toHaveProperty('setIsDialogOpen');
    expect(result.current).toHaveProperty('isEditing');
    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('handleEditItem');
    expect(result.current).toHaveProperty('openAddItemDialog');
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('resetFormAndClose');
  });

  test('calls useInventoryDialog with correct parameters', () => {
    renderHook(() => useInventoryItemForm(mockInventory, mockAddItem, mockUpdateItem));

    // Verify it passes the correct parameters
    expect(useInventoryDialog).toHaveBeenCalledWith(mockInventory, mockAddItem, mockUpdateItem);
  });
});
