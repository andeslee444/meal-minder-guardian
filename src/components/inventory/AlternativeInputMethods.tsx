import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScanIcon, SendIcon, MicIcon, CameraIcon, RadioIcon } from 'lucide-react';

// Import our new dialog components
import BarcodeScannerDialog from './dialogs/BarcodeScannerDialog';
import InteractiveReceiptDialog from './dialogs/InteractiveReceiptDialog';
import EmailReceiptDialog from './dialogs/EmailReceiptDialog';
import VoiceInputDialog from './dialogs/VoiceInputDialog';
import PhotoRecognitionDialog from './dialogs/PhotoRecognitionDialog';

const AlternativeInputMethods: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [barcodeScanOpen, setBarcodeScanOpen] = useState(false);
  const [interactiveReceiptScanOpen, setInteractiveReceiptScanOpen] = useState(false);
  const [emailReceiptOpen, setEmailReceiptOpen] = useState(false);
  const [voiceInputOpen, setVoiceInputOpen] = useState(false);
  const [photoRecognitionOpen, setPhotoRecognitionOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => setBarcodeScanOpen(true)}>
          <ScanIcon className="w-4 h-4 mr-2" /> Scan Barcode
        </Button>
        <Button variant="outline" size="sm" onClick={() => setInteractiveReceiptScanOpen(true)}>
          <RadioIcon className="w-4 h-4 mr-2" /> Import Receipt
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEmailReceiptOpen(true)}>
          <SendIcon className="w-4 h-4 mr-2" /> Email Receipt
        </Button>
        <Button variant="outline" size="sm" onClick={() => setVoiceInputOpen(true)}>
          <MicIcon className="w-4 h-4 mr-2" /> Voice Input
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPhotoRecognitionOpen(true)}>
          <CameraIcon className="w-4 h-4 mr-2" /> Photo Recognition
        </Button>
      </div>

      {/* All dialog components */}
      <BarcodeScannerDialog
        open={barcodeScanOpen}
        onOpenChange={setBarcodeScanOpen}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <InteractiveReceiptDialog
        open={interactiveReceiptScanOpen}
        onOpenChange={setInteractiveReceiptScanOpen}
      />

      <EmailReceiptDialog
        open={emailReceiptOpen}
        onOpenChange={setEmailReceiptOpen}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <VoiceInputDialog
        open={voiceInputOpen}
        onOpenChange={setVoiceInputOpen}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <PhotoRecognitionDialog
        open={photoRecognitionOpen}
        onOpenChange={setPhotoRecognitionOpen}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default AlternativeInputMethods;
