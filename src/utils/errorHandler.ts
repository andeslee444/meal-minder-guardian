import { logger } from './logger';

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_ERRORS_PER_KEY = 5;
  private readonly ERROR_RESET_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Reset error counts periodically
    setInterval(() => this.resetErrorCounts(), this.ERROR_RESET_INTERVAL);
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | unknown, context: ErrorContext = {}): void {
    const errorKey = this.getErrorKey(error, context);
    const count = this.getErrorCount(errorKey);

    if (count >= this.MAX_ERRORS_PER_KEY) {
      logger.error('error', `Max error count exceeded for ${errorKey}`, {
        error,
        context,
        count,
      });
      return;
    }

    this.incrementErrorCount(errorKey);
    this.logError(error, context);
  }

  private getErrorKey(error: Error | unknown, context: ErrorContext): string {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const component = context.component || 'unknown';
    const action = context.action || 'unknown';
    return `${errorName}:${component}:${action}`;
  }

  private getErrorCount(key: string): number {
    return this.errorCount.get(key) || 0;
  }

  private incrementErrorCount(key: string): void {
    const currentCount = this.getErrorCount(key);
    this.errorCount.set(key, currentCount + 1);
  }

  private resetErrorCounts(): void {
    this.errorCount.clear();
    logger.debug('error', 'Error counts reset');
  }

  private logError(error: Error | unknown, context: ErrorContext): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const stackTrace = error instanceof Error ? error.stack : undefined;

    logger.error('error', errorMessage, {
      error,
      stackTrace,
      ...context,
    });
  }

  // Method to destroy the handler instance (useful for testing)
  destroy(): void {
    this.errorCount.clear();
    // @ts-ignore
    ErrorHandler.instance = null;
  }
}

export const errorHandler = ErrorHandler.getInstance();
