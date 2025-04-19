import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { IngredientSelection } from '@/hooks/useIngredientSelection';

interface IngredientSelectorProps {
  selectedItems: IngredientSelection[];
  customIngredient: string;
  setCustomIngredient: (value: string) => void;
  toggleItemSelection: (id: string) => void;
  addCustomIngredient: () => void;
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  selectedItems,
  customIngredient,
  setCustomIngredient,
  toggleItemSelection,
  addCustomIngredient,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Select ingredients from your inventory:</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {selectedItems.length > 0 ? (
            selectedItems.map(item => (
              <div
                key={item.id}
                className={`border rounded-md p-2 cursor-pointer transition-colors ${
                  item.selected ? 'bg-primary/10 border-primary' : 'bg-card border-input'
                }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              No inventory items available. Add items to your inventory first.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="custom-ingredient" className="mb-2 block">
            Add custom ingredient:
          </Label>
          <Input
            id="custom-ingredient"
            value={customIngredient}
            onChange={e => setCustomIngredient(e.target.value)}
            placeholder="e.g., rice, tomatoes, chicken"
            onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
          />
        </div>
        <Button onClick={addCustomIngredient} type="button" variant="outline">
          Add
        </Button>
      </div>
    </div>
  );
};

export default IngredientSelector;
