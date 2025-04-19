/**
 * Standard API error format
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  data?: unknown;
  originalError?: Error;
}

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  UNKNOWN = 'UNKNOWN_ERROR',
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  PERMISSION = 'PERMISSION_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  SERVER = 'SERVER_ERROR',
  DATABASE = 'DATABASE_ERROR',
  STORAGE = 'STORAGE_ERROR',
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public code: string;
  public status?: number;
  public details?: string;
  public data?: unknown;
  public originalError?: Error;

  constructor(message: string, options: Partial<ApiError> = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || ErrorCode.UNKNOWN;
    this.status = options.status;
    this.details = options.details;
    this.data = options.data;
    this.originalError = options.originalError;

    // Ensure correct prototype chain for instanceof to work
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert to a plain object for logging or serialization
   */
  toJSON(): ApiError {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      data: this.data,
      originalError: this.originalError,
    };
  }
}

/**
 * Create an appropriate error instance
 */
export function createError(
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN,
  options: Partial<ApiError> = {}
): AppError {
  return new AppError(message, {
    code,
    status: options.status,
    details: options.details,
    data: options.data,
    originalError: options.originalError,
  });
}

/**
 * Create a network error
 */
export function createNetworkError(
  message = 'Network error occurred',
  originalError?: Error
): AppError {
  return createError(message, ErrorCode.NETWORK, { originalError });
}

/**
 * Create an API error
 */
export function createApiError(message: string, status?: number, originalError?: Error): AppError {
  return createError(message, ErrorCode.API, { status, originalError });
}

/**
 * Process an unknown error into a standardized AppError
 */
export function handleError(error: unknown): AppError {
  // Already an AppError, just return it
  if (error instanceof AppError) {
    return error;
  }

  // Error object, extract message and other properties
  if (error instanceof Error) {
    const options: Partial<ApiError> = {
      originalError: error,
    };

    // Some error objects may have additional properties
    const anyError = error as any;

    if (anyError.code) options.code = anyError.code;
    if (anyError.status) options.status = anyError.status;
    if (anyError.details) options.details = anyError.details;
    if (anyError.data) options.data = anyError.data;

    // Check for network errors
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network error') ||
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      return createNetworkError(error.message, error);
    }

    return new AppError(error.message, options);
  }

  // Handle string error
  if (typeof error === 'string') {
    return new AppError(error);
  }

  // Default case: unknown error type
  return createError('An unknown error occurred', ErrorCode.UNKNOWN, { data: error });
}

/**
 * Log an error to the console with additional context
 */
export function logError(
  error: unknown,
  context?: string,
  additionalInfo?: Record<string, unknown>
): AppError {
  const appError = handleError(error);

  const errorData = {
    message: appError.message,
    code: appError.code,
    status: appError.status,
    details: appError.details,
    context,
    additionalInfo,
    timestamp: new Date().toISOString(),
  };

  // Format the error message with context if provided
  const contextMsg = context ? `[${context}] ` : '';
  console.error(`${contextMsg}Error:`, errorData);

  // Log original error
  if (appError.originalError) {
    console.error(`${contextMsg}Original error:`, appError.originalError);
  }

  return appError;
}

/**
 * Simple try/catch wrapper with consistent error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options: {
    fallback?: T;
    errorMessage?: string;
    errorCode?: ErrorCode;
    transformError?: (error: unknown) => AppError;
    errorHandler?: (error: AppError) => void;
  } = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    let appError: AppError;

    if (options.transformError) {
      appError = options.transformError(error);
    } else if (options.errorMessage) {
      appError = createError(options.errorMessage, options.errorCode || ErrorCode.UNKNOWN, {
        originalError: error instanceof Error ? error : undefined,
      });
    } else {
      appError = handleError(error);
    }

    if (options.errorHandler) {
      options.errorHandler(appError);
    } else {
      logError(appError);
    }

    if ('fallback' in options) {
      return options.fallback as T;
    }

    throw appError;
  }
}

/**
 * Create a timeout promise that rejects after the specified time
 */
export function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        createError(`Operation timed out after ${ms}ms`, ErrorCode.TIMEOUT, {
          status: 408,
        })
      );
    }, ms);
  });
}

/**
 * Wrap a promise with a timeout
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(ms)]);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const initialDelay = options.initialDelay ?? 300;
  const maxDelay = options.maxDelay ?? 3000;
  const factor = options.factor ?? 2;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've reached max retries or if shouldRetry returns false
      if (attempt >= retries || !shouldRetry(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);

      // Add some jitter to avoid multiple retries hitting at exactly the same time
      const jitter = Math.random() * 100;

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw handleError(lastError);
}
