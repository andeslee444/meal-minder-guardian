import React from 'react';
import { Button } from '@/components/ui/button';
import { ScannedItem } from './types';

interface CompletionActionsProps {
  items: ScannedItem[];
  onAddAll: () => void;
  onReset: () => void;
  onClose: () => void;
}

const CompletionActions: React.FC<CompletionActionsProps> = ({
  items,
  onAddAll,
  onReset,
  onClose,
}) => {
  const allItemsAdded = items.every(item => item.added);

  return (
    <div className="flex justify-between gap-2 mt-2">
      <Button variant="outline" onClick={onReset}>
        Scan Another
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onAddAll} disabled={allItemsAdded}>
          Add All Remaining
        </Button>
      </div>
    </div>
  );
};

export default CompletionActions;
