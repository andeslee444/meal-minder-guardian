import React from 'react';
import UploadStage from './UploadStage';
import ScanningProgress from './ScanningProgress';
import ScannedItemsList from './ScannedItemsList';
import CompletionActions from './CompletionActions';
import { useReceiptScanner } from './hooks/useReceiptScanner';

const InteractiveReceiptScanner: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const {
    file,
    scanningStage,
    progress,
    scannedItems,
    handleFileChange,
    handleScan,
    handleAddItem,
    handleAddAll,
    handleReset,
  } = useReceiptScanner();

  return (
    <div className="flex flex-col gap-4">
      {scanningStage === 'idle' && (
        <UploadStage
          onFileChange={handleFileChange}
          onScan={handleScan}
          onClose={onClose}
          file={file}
        />
      )}

      {(scanningStage === 'uploading' ||
        scanningStage === 'analyzing' ||
        scanningStage === 'listing') && (
        <div className="flex flex-col gap-4">
          <ScanningProgress scanningStage={scanningStage} progress={progress} />
          <ScannedItemsList items={scannedItems} onAddItem={handleAddItem} scanComplete={false} />
        </div>
      )}

      {scanningStage === 'complete' && (
        <div className="flex flex-col gap-4">
          <ScannedItemsList items={scannedItems} onAddItem={handleAddItem} scanComplete={true} />
          <CompletionActions
            items={scannedItems}
            onAddAll={handleAddAll}
            onReset={handleReset}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
};

export default InteractiveReceiptScanner;
