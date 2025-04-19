import { renderHook, act } from '@testing-library/react';
import { useInventoryDialog } from '../useInventoryDialog';
import { InventoryItem } from '@/types/inventory';
import { defaultFormState } from '../useInventoryForm';

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'carton',
    purchaseDate: '2023-01-01',
    expirationDate: '2023-01-07',
    price: 3.99,
    store: 'Grocery Store',
  },
  {
    id: '2',
    name: 'Apples',
    category: 'Produce',
    quantity: 5,
    unit: 'item',
    purchaseDate: '2023-01-02',
    expirationDate: '2023-01-15',
    price: 4.99,
    store: 'Farmers Market',
  },
];

// Mock functions
const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();

describe('useInventoryDialog', () => {
  const defaultFormData = {
    name: 'New Item',
    category: 'Snacks',
    quantity: 3,
    unit: 'box',
    price: 2.99,
    store: 'Convenience Store',
    purchaseDate: '2023-01-10',
    expirationDate: '2023-02-10',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with dialog closed', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.currentItemId).toBeNull();
  });

  test('opens add item dialog correctly', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    act(() => {
      result.current.openAddItemDialog();
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.currentItemId).toBeNull();
  });

  test('handles edit item correctly', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    act(() => {
      result.current.handleEditItem('1');
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.isEditing).toBe(true);
    expect(result.current.currentItemId).toBe('1');
    expect(result.current.formData.name).toBe('Milk');
    expect(result.current.formData.category).toBe('Dairy');
  });

  test('ignores edit for non-existent item', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    act(() => {
      result.current.handleEditItem('non-existent-id');
    });

    // Should not open dialog for non-existent item
    expect(result.current.isDialogOpen).toBe(false);
  });

  test('submits form with add item', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    // Open dialog for adding
    act(() => {
      result.current.openAddItemDialog();
    });

    // Submit form
    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn(),
        currentTarget: document.createElement('form'),
        target: document.createElement('form'),
        type: 'submit',
        nativeEvent: new Event('submit'),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        isPropagationStopped: () => false,
        isDefaultPrevented: () => false,
        persist: jest.fn(),
        timeStamp: 0,
        eventPhase: 0,
        isTrusted: true,
        stopPropagation: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // Verify the add function was called with correct data
    expect(mockAddItem).toHaveBeenCalledWith(defaultFormState);
    expect(mockUpdateItem).not.toHaveBeenCalled();

    // Dialog should be closed
    expect(result.current.isDialogOpen).toBe(false);
  });

  test('submits form with update item', () => {
    const existingItem: InventoryItem = {
      id: '2',
      name: 'Apples',
      category: 'Produce',
      quantity: 5,
      unit: 'item',
      purchaseDate: '2023-01-02',
      expirationDate: '2023-01-15',
      price: 4.99,
      store: 'Farmers Market',
    };

    mockInventory.push(existingItem);

    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    // Open dialog for editing
    act(() => {
      result.current.handleEditItem('2');
    });

    // Submit form
    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn(),
        currentTarget: document.createElement('form'),
        target: document.createElement('form'),
        type: 'submit',
        nativeEvent: new Event('submit'),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        isPropagationStopped: () => false,
        isDefaultPrevented: () => false,
        persist: jest.fn(),
        timeStamp: 0,
        eventPhase: 0,
        isTrusted: true,
        stopPropagation: jest.fn(),
      } as unknown as React.FormEvent);
    });

    // Verify the update function was called with correct ID and data
    expect(mockUpdateItem).toHaveBeenCalledWith('2', {
      name: 'Apples',
      category: 'Produce',
      quantity: 5,
      unit: 'item',
      purchaseDate: '2023-01-02',
      expirationDate: '2023-01-15',
      price: 4.99,
      store: 'Farmers Market',
    });
    expect(mockAddItem).not.toHaveBeenCalled();

    // Dialog should be closed
    expect(result.current.isDialogOpen).toBe(false);
  });

  test('resets form and closes dialog', () => {
    const { result } = renderHook(() =>
      useInventoryDialog(mockInventory, mockAddItem, mockUpdateItem)
    );

    // Open dialog and set some data
    act(() => {
      result.current.openAddItemDialog();
      result.current.setFormData({
        ...result.current.formData,
        name: 'Test Reset',
      });
    });

    // Reset and close
    act(() => {
      result.current.resetFormAndClose();
    });

    // Verify dialog is closed and form is reset
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.formData.name).toBe(''); // Default value
  });
});
