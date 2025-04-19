import React from 'react';
import { Button } from '@/components/ui/button';
import { MicIcon, LoaderIcon } from 'lucide-react';
import ScannerDialogWrapper from './ScannerDialogWrapper';
import { useAppContext } from '@/context/AppContext';
import { processVoiceInput } from '@/services/scanningService';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  setIsLoading,
}) => {
  const { addInventoryItem } = useAppContext();
  const { toast } = useToast();

  const handleVoiceInput = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would record audio here
      // For demo purposes, we'll just pass an empty blob
      const audioBlob = new Blob([], { type: 'audio/webm' });
      const item = await processVoiceInput(audioBlob);
      if (item) {
        addInventoryItem(item);
        toast({
          title: 'Voice Input Processed',
          description: `${item.name} has been added to your inventory.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      toast({
        title: 'Voice Processing Failed',
        description: 'Failed to process voice input. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScannerDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Voice Input"
      description="Speak clearly to add an item to your inventory."
      isLoading={isLoading}
    >
      <div className="flex flex-col gap-4 items-center">
        <Button
          size="lg"
          className="rounded-full h-16 w-16"
          onClick={handleVoiceInput}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderIcon className="h-8 w-8 animate-spin" />
          ) : (
            <MicIcon className="h-8 w-8" />
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {isLoading ? 'Listening...' : 'Press to start speaking'}
        </p>
      </div>
    </ScannerDialogWrapper>
  );
};

export default VoiceInputDialog;
