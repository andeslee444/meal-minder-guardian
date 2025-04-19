import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ScannerDialogWrapper from './ScannerDialogWrapper';
import { useAppContext } from '@/context/AppContext';
import { importReceiptFromEmail } from '@/services/scanningService';
import { useToast } from '@/hooks/use-toast';

interface EmailReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const EmailReceiptDialog: React.FC<EmailReceiptDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  setIsLoading,
}) => {
  const { addInventoryItem } = useAppContext();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleEmailReceiptImport = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const items = await importReceiptFromEmail(email);
      if (items && items.length > 0) {
        items.forEach(item => addInventoryItem(item));
        toast({
          title: 'Email Receipt Processed',
          description: `${items.length} items have been added to your inventory.`,
        });
        onOpenChange(false);
        setEmail('');
      }
    } catch (error) {
      console.error('Email receipt error:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import receipt from email. Please try again.',
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
      title="Email Receipt Import"
      description="Enter the email address that contains your receipt."
      isLoading={isLoading}
      showFooter={false}
    >
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleEmailReceiptImport} disabled={isLoading || !email}>
          Import
        </Button>
      </div>
    </ScannerDialogWrapper>
  );
};

export default EmailReceiptDialog;
