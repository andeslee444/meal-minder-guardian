import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScannerDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isLoading?: boolean;
  showFooter?: boolean;
  onCancel?: () => void;
  children: React.ReactNode;
}

const ScannerDialogWrapper: React.FC<ScannerDialogWrapperProps> = ({
  open,
  onOpenChange,
  title,
  description,
  isLoading = false,
  showFooter = true,
  onCancel,
  children,
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {children}

          {isLoading && (
            <div className="flex justify-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {showFooter && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScannerDialogWrapper;
