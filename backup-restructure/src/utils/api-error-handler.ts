import { statusService } from '../services/status/status-service';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private readonly defaultErrorMessage = 'An unexpected error occurred';

  private constructor() {}

  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  public handleError(error: unknown, source: string, context?: Record<string, unknown>): void {
    const apiError = this.normalizeError(error);

    // Log the error for debugging
    console.error(`[${source}] Error:`, apiError);

    // Show user-friendly error message
    const message = this.getUserFriendlyMessage(apiError);
    statusService.showError(message, source, {
      ...context,
      originalError: apiError,
    });
  }

  private normalizeError(error: unknown): ApiError {
    if (error instanceof Error) {
      return error as ApiError;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error && typeof error === 'object') {
      const apiError = new Error(
        (error as { message?: string }).message || this.defaultErrorMessage
      ) as ApiError;

      apiError.status = (error as { status?: number }).status;
      apiError.code = (error as { code?: string }).code;
      apiError.details = (error as { details?: unknown }).details;

      return apiError;
    }

    return new Error(this.defaultErrorMessage);
  }

  private getUserFriendlyMessage(error: ApiError): string {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }

    if (error.name === 'NetworkError') {
      return 'Network connection error. Please check your internet connection.';
    }

    // Handle HTTP status codes
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested item may have been removed.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || this.defaultErrorMessage;
    }
  }
}

export const apiErrorHandler = ApiErrorHandler.getInstance();
