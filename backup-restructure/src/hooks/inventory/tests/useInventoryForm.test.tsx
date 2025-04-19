import { renderHook, act } from '@testing-library/react';
import { useInventoryForm, defaultFormState } from '../useInventoryForm';

describe('useInventoryForm', () => {
  test('initializes with default values when no initial data provided', () => {
    const { result } = renderHook(() => useInventoryForm());

    expect(result.current.formData).toEqual(defaultFormState);
  });

  test('initializes with provided initial data', () => {
    const initialData = {
      ...defaultFormState,
      name: 'Test Item',
      category: 'Dairy',
      quantity: 2,
    };

    const { result } = renderHook(() => useInventoryForm(initialData));

    expect(result.current.formData).toEqual(initialData);
  });

  test('updates field correctly', () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.updateField('name', 'New Test Item');
    });

    expect(result.current.formData.name).toBe('New Test Item');
  });

  test('resets form to default state', () => {
    const initialData = {
      ...defaultFormState,
      name: 'Test Item',
      category: 'Dairy',
    };

    const { result } = renderHook(() => useInventoryForm(initialData));

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(defaultFormState);
  });

  test('resets form to provided state', () => {
    const { result } = renderHook(() => useInventoryForm());
    const newState = {
      ...defaultFormState,
      name: 'Reset Item',
      category: 'Bakery',
    };

    act(() => {
      result.current.resetForm(newState);
    });

    expect(result.current.formData).toEqual(newState);
  });

  test('handles input change for text fields', () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.handleChange({
        target: { id: 'name', value: 'Changed Name', type: 'text' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('Changed Name');
  });

  test('handles input change for number fields', () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.handleChange({
        target: { id: 'quantity', value: '5', type: 'number' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.quantity).toBe(5);
  });

  test('handles invalid number input by setting to 0', () => {
    const { result } = renderHook(() => useInventoryForm());

    act(() => {
      result.current.handleChange({
        target: { id: 'quantity', value: 'not-a-number', type: 'number' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.quantity).toBe(0);
  });
});
