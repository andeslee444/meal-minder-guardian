import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import ScannerDialogWrapper from './ScannerDialogWrapper';
import { useAppContext } from '@/context/AppContext';
import { scanBarcodeFromImage } from '@/services/scanningService';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  setIsLoading,
}) => {
  const { addInventoryItem } = useAppContext();
  const { toast } = useToast();
  const barcodeScanRef = useRef<HTMLInputElement>(null);

  const handleBarcodeScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    try {
      const file = e.target.files[0];
      const item = await scanBarcodeFromImage(file);
      if (item) {
        addInventoryItem(item);
        toast({
          title: 'Item Added',
          description: `${item.name} has been added to your inventory.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      toast({
        title: 'Scan Failed',
        description: 'Failed to process barcode. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (barcodeScanRef.current) barcodeScanRef.current.value = '';
    }
  };

  return (
    <ScannerDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Scan Barcode"
      description="Take a photo of a barcode to add the item to your inventory."
      isLoading={isLoading}
    >
      <Input
        type="file"
        accept="image/*"
        onChange={handleBarcodeScan}
        ref={barcodeScanRef}
        disabled={isLoading}
      />
    </ScannerDialogWrapper>
  );
};

export default BarcodeScannerDialog;
