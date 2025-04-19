export type ScannedItem = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  added: boolean;
  processing: boolean;
};

export type ScanningStage = 'idle' | 'uploading' | 'analyzing' | 'listing' | 'complete';
