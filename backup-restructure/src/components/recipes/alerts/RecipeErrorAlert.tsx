import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RecipeErrorAlertProps {
  error: {
    type: string;
    message: string;
    source?: string;
    recoverable?: boolean;
    retryable?: boolean;
  } | null;
}

const RecipeErrorAlert: React.FC<RecipeErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Recipe Generation Error</AlertTitle>
      <AlertDescription>
        {error.message}
        {error.recoverable && (
          <div className="mt-2 text-sm">Trying alternative recipe sources...</div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default RecipeErrorAlert;
