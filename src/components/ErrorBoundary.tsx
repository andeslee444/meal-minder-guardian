import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { errorLogger } from '@/services/ErrorLoggingService';
import * as Sentry from '@sentry/react';
import { captureError } from '@/lib/error-tracking';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const componentStack = errorInfo.componentStack ? String(errorInfo.componentStack) : undefined;

    // Attempt to log error using our error logging service
    // This could fail if the DB is unavailable, so we wrap it in try/catch
    try {
      errorLogger.logError(error, componentStack).catch(logError => {
        console.error('Failed to log error to service:', logError);
      });
    } catch (logServiceError) {
      console.error('Error while using error logger:', logServiceError);
    }

    // Also attempt to capture in Sentry as a backup
    // Again, wrapped in try/catch to prevent failures here from causing more issues
    try {
      captureError(error, {
        componentStack: componentStack,
      });
    } catch (sentryError) {
      console.error('Error while logging to Sentry:', sentryError);
    }

    // Always log to console as a final fallback
    console.error('Error caught by ErrorBoundary:', error);
    if (componentStack) {
      console.error('Component Stack:', componentStack);
    }
  }

  handleReload = () => {
    // Force a full page reload
    window.location.reload();
  };

  handleReportFeedback = () => {
    try {
      Sentry.showReportDialog();
    } catch (e) {
      console.error('Failed to show Sentry report dialog:', e);
      alert('Sorry, the error reporting system is not available. Please contact support directly.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>
              <Button variant="outline" onClick={this.handleReportFeedback} className="w-full">
                Report Feedback
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
