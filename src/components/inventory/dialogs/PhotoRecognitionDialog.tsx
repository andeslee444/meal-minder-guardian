import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import ScannerDialogWrapper from './ScannerDialogWrapper';
import { useAppContext } from '@/context/AppContext';
import { recognizeFoodFromImage } from '@/services/scanningService';
import { useToast } from '@/hooks/use-toast';

interface PhotoRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const PhotoRecognitionDialog: React.FC<PhotoRecognitionDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  setIsLoading,
}) => {
  const { addInventoryItem } = useAppContext();
  const { toast } = useToast();
  const photoRecognitionRef = useRef<HTMLInputElement>(null);

  const handlePhotoRecognition = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    try {
      const file = e.target.files[0];
      const item = await recognizeFoodFromImage(file);
      if (item) {
        addInventoryItem(item);
        toast({
          title: 'Food Recognized',
          description: `${item.name} has been added to your inventory.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Photo recognition error:', error);
      toast({
        title: 'Recognition Failed',
        description: 'Failed to recognize food from photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (photoRecognitionRef.current) photoRecognitionRef.current.value = '';
    }
  };

  return (
    <ScannerDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Food Recognition"
      description="Take a photo of a food item to add it to your inventory."
      isLoading={isLoading}
    >
      <Input
        type="file"
        accept="image/*"
        onChange={handlePhotoRecognition}
        ref={photoRecognitionRef}
        disabled={isLoading}
      />
    </ScannerDialogWrapper>
  );
};

export default PhotoRecognitionDialog;
