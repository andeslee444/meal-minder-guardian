import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { inventoryItemSchema, validateData, formatValidationErrors } from '@/lib/validation';
import { useToast } from '@/components/ui/use-toast';

type InventoryItemFormProps = {
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
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  formData,
  setFormData,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Helper function to handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user makes changes
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data using Zod
    const result = validateData(inventoryItemSchema, formData);

    if (!result.success) {
      const validationErrors = formatValidationErrors(result.errors);
      setErrors(validationErrors);

      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });

      return;
    }

    // If validation passes, proceed with the onSubmit function
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <div className="col-span-3">
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <div className="col-span-3">
            <Select
              value={formData.category}
              onValueChange={value => handleChange('category', value)}
            >
              <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produce">Produce</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Meat">Meat</SelectItem>
                <SelectItem value="Seafood">Seafood</SelectItem>
                <SelectItem value="Bakery">Bakery</SelectItem>
                <SelectItem value="Pantry">Pantry</SelectItem>
                <SelectItem value="Frozen">Frozen</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity}
            onChange={e => handleChange('quantity', parseFloat(e.target.value) || 0)}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unit" className="text-right">
            Unit
          </Label>
          <Select value={formData.unit} onValueChange={value => handleChange('unit', value)}>
            <SelectTrigger id="unit" className="col-span-3">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="item">Item(s)</SelectItem>
              <SelectItem value="lb">Pound (lb)</SelectItem>
              <SelectItem value="oz">Ounce (oz)</SelectItem>
              <SelectItem value="g">Gram (g)</SelectItem>
              <SelectItem value="kg">Kilogram (kg)</SelectItem>
              <SelectItem value="cup">Cup(s)</SelectItem>
              <SelectItem value="bottle">Bottle(s)</SelectItem>
              <SelectItem value="can">Can(s)</SelectItem>
              <SelectItem value="box">Box(es)</SelectItem>
              <SelectItem value="bag">Bag(s)</SelectItem>
              <SelectItem value="carton">Carton(s)</SelectItem>
              <SelectItem value="package">Package(s)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="purchaseDate" className="text-right">
            Purchase Date
          </Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={e => handleChange('purchaseDate', e.target.value)}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="expirationDate" className="text-right">
            Expiration Date
          </Label>
          <Input
            id="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={e => handleChange('expirationDate', e.target.value)}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price ($)
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={e => handleChange('price', parseFloat(e.target.value) || 0)}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="store" className="text-right">
            Store
          </Label>
          <Input
            id="store"
            value={formData.store}
            onChange={e => handleChange('store', e.target.value)}
            className="col-span-3"
            placeholder="Optional"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? 'Update' : 'Add'}</Button>
      </DialogFooter>
    </form>
  );
};

export default InventoryItemForm;
