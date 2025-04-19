import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ScanningStage } from './types';

interface ScanningProgressProps {
  scanningStage: ScanningStage;
  progress: number;
}

const ScanningProgress: React.FC<ScanningProgressProps> = ({ scanningStage, progress }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span>
          {scanningStage === 'uploading' && 'Uploading receipt...'}
          {scanningStage === 'analyzing' && 'Analyzing receipt...'}
          {scanningStage === 'listing' && 'Extracting items...'}
        </span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};

export default ScanningProgress;
