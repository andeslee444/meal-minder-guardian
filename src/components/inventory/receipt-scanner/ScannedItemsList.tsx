import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderIcon, CheckIcon } from 'lucide-react';
import { ScannedItem } from './types';

interface ScannedItemsListProps {
  items: ScannedItem[];
  onAddItem: (index: number) => void;
  scanComplete: boolean;
}

const ScannedItemsList: React.FC<ScannedItemsListProps> = ({ items, onAddItem, scanComplete }) => {
  if (items.length === 0) return null;

  return (
    <div className="border rounded-md mt-2">
      <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
        <h4 className="font-medium">Detected Items</h4>
        <span className="text-sm text-muted-foreground">
          {items.filter(item => item.added).length}/{items.length} added
        </span>
      </div>
      <ul className="divide-y">
        {items.map((item, index) => (
          <li key={index} className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {item.processing ? (
                <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
              ) : item.added ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <Checkbox checked={false} onCheckedChange={() => onAddItem(index)} />
              )}
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit} · ${item.price.toFixed(2)} · {item.category}
                </div>
              </div>
            </div>
            {!item.processing && !item.added && (
              <Button variant="ghost" size="sm" onClick={() => onAddItem(index)}>
                Add
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScannedItemsList;
