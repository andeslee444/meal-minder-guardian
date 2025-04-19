import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import InteractiveReceiptScanner from '../receipt-scanner/InteractiveReceiptScanner';

interface InteractiveReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InteractiveReceiptDialog: React.FC<InteractiveReceiptDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Interactive Receipt Scanner</DialogTitle>
          <DialogDescription>
            Watch as we scan and identify items from your receipt in real-time.
          </DialogDescription>
        </DialogHeader>
        <InteractiveReceiptScanner onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveReceiptDialog;
