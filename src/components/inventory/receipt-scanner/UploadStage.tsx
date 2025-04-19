import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioIcon } from 'lucide-react';

interface UploadStageProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: () => void;
  onClose: () => void;
  file: File | null;
}

const UploadStage: React.FC<UploadStageProps> = ({ onFileChange, onScan, onClose, file }) => {
  return (
    <>
      <p className="text-sm text-muted-foreground mb-2">
        Upload a photo of your receipt to scan and add items to your inventory.
      </p>
      <Input type="file" accept="image/*" onChange={onFileChange} className="mb-4" />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onScan} disabled={!file} className="flex items-center gap-2">
          <RadioIcon className="w-4 h-4" />
          Scan Receipt
        </Button>
      </div>
    </>
  );
};

export default UploadStage;
