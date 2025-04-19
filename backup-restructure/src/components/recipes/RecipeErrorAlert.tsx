import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecipeErrorAlertProps {
  error:
    | {
        type?: string;
        message: string;
        source?: string;
        recoverable?: boolean;
        retryable?: boolean;
      }
    | string
    | null;
  onTryAlternative?: () => Promise<void>;
  isRetrying?: boolean;
}

const RecipeErrorAlert: React.FC<RecipeErrorAlertProps> = ({
  error,
  onTryAlternative,
  isRetrying = false,
}) => {
  if (!error) return null;

  // Handle string error
  if (typeof error === 'string') {
    const isQuotaError =
      error.toLowerCase().includes('quota') ||
      error.toLowerCase().includes('limit') ||
      error.toLowerCase().includes('api key');

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <div className="flex-1">
          <AlertTitle>Recipe Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>

          {isQuotaError && onTryAlternative && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onTryAlternative(); // Use void to ignore the Promise
                }}
                disabled={isRetrying}
                className="flex items-center"
              >
                {isRetrying && <RefreshCw className="h-3 w-3 mr-2 animate-spin" />}
                Try AI Generation Instead
              </Button>
            </div>
          )}
        </div>
      </Alert>
    );
  }

  // Handle error object with more details
  const isServiceError =
    error.source === 'spoonacular' ||
    error.type === 'api_rate_limit' ||
    error.message.toLowerCase().includes('limit') ||
    error.message.toLowerCase().includes('quota');

  return (
    <Alert variant={isServiceError ? 'default' : 'destructive'} className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div className="flex-1">
        <AlertTitle>
          {isServiceError ? 'Recipe Service Limit Reached' : 'Recipe Generation Error'}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error.message}</p>

          {error.recoverable && (
            <div className="text-sm text-muted-foreground">
              {isRetrying
                ? 'Switching to AI-powered recipe generation...'
                : 'We can try an alternative recipe source.'}
            </div>
          )}

          {error.recoverable && onTryAlternative && !isRetrying && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onTryAlternative(); // Use void to ignore the Promise
              }}
              className="mt-2"
            >
              Use AI Generation
            </Button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default RecipeErrorAlert;
