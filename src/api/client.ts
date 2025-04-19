import { isDevelopment } from '@/lib/utils';

/**
 * API request options extending the standard fetch RequestInit
 */
export interface ApiRequestOptions extends RequestInit {
  skipCache?: boolean;
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  status: number;
  headers: Headers;
}

/**
 * Default API request options
 */
const DEFAULT_OPTIONS: ApiRequestOptions = {
  skipCache: false,
  cacheTime: 5 * 60 * 1000, // 5 minutes default cache
  retries: 1,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Simple in-memory cache
 */
const apiCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Generate a cache key from the request
 */
function getCacheKey(url: string, options: RequestInit): string {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * Check if a cached response is still valid
 */
function isCacheValid(cacheKey: string, cacheTime: number): boolean {
  const cached = apiCache.get(cacheKey);
  if (!cached) return false;

  const now = Date.now();
  return now - cached.timestamp < cacheTime;
}

/**
 * Log API request details in development mode
 */
function logRequest(
  method: string,
  url: string,
  options: ApiRequestOptions,
  fromCache = false
): void {
  if (isDevelopment()) {
    const style = fromCache
      ? 'color: purple; font-weight: bold;'
      : 'color: blue; font-weight: bold;';

    console.group(`🌐 API ${method} ${url} ${fromCache ? '(cached)' : ''}`);
    console.log('%cURL:', style, url);
    console.log('%cMethod:', style, method);

    if (options.body) {
      console.log(
        '%cBody:',
        style,
        typeof options.body === 'string' ? JSON.parse(options.body) : options.body
      );
    }

    console.log('%cHeaders:', style, options.headers);
    console.groupEnd();
  }
}

/**
 * Log API response details in development mode
 */
function logResponse<T>(url: string, response: ApiResponse<T>, timeMs: number): void {
  if (isDevelopment()) {
    const isError = response.status >= 400;
    const style = isError ? 'color: red; font-weight: bold;' : 'color: green; font-weight: bold;';

    console.group(
      `🌐 API Response ${response.status} ${url} (${timeMs}ms) ${isError ? '❌' : '✅'}`
    );

    console.log('%cStatus:', style, response.status);
    console.log('%cData:', style, response.data);

    if (response.error) {
      console.log('%cError:', style, response.error);
    }

    console.log('%cHeaders:', style, Object.fromEntries([...response.headers.entries()]));
    console.groupEnd();
  }
}

/**
 * Parse the response based on content type
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (err) {
      return null;
    }
  }

  if (contentType.includes('text/')) {
    return response.text();
  }

  return response;
}

/**
 * Main API client function to make HTTP requests
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  // Merge default options with provided options
  const mergedOptions: ApiRequestOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_OPTIONS.headers,
      ...options.headers,
    },
  };

  const method = (mergedOptions.method || 'GET').toUpperCase();
  const startTime = Date.now();

  // Check cache for GET requests
  if (method === 'GET' && !mergedOptions.skipCache) {
    const cacheKey = getCacheKey(url, mergedOptions);

    if (isCacheValid(cacheKey, mergedOptions.cacheTime || DEFAULT_OPTIONS.cacheTime!)) {
      const cachedData = apiCache.get(cacheKey)!.data;
      logRequest(method, url, mergedOptions, true);

      const cachedResponse: ApiResponse<T> = {
        data: cachedData,
        status: 200,
        headers: new Headers({ 'x-from-cache': 'true' }),
      };

      logResponse(url, cachedResponse, 0);
      return cachedResponse;
    }
  }

  // Log request
  logRequest(method, url, mergedOptions);

  // Implement retry logic
  const maxRetries = mergedOptions.retries || 0;
  const retryDelay = mergedOptions.retryDelay || 1000;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, mergedOptions);
      const responseData = await parseResponse(response);
      const endTime = Date.now();

      const apiResponse: ApiResponse<T> = {
        status: response.status,
        headers: response.headers,
      };

      // Handle success and error responses
      if (response.ok) {
        apiResponse.data = responseData;

        // Cache successful GET responses
        if (method === 'GET' && !mergedOptions.skipCache) {
          const cacheKey = getCacheKey(url, mergedOptions);
          apiCache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
          });
        }
      } else {
        apiResponse.error = {
          message: responseData?.message || response.statusText,
          code: responseData?.code,
          status: response.status,
        };
      }

      logResponse(url, apiResponse, endTime - startTime);
      return apiResponse;
    } catch (error) {
      lastError = error as Error;
      attempt++;

      if (attempt <= maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If all retries failed, return error response
  const errorResponse: ApiResponse<T> = {
    status: 0,
    headers: new Headers(),
    error: {
      message: lastError?.message || 'Network request failed',
      code: 'NETWORK_ERROR',
    },
  };

  logResponse(url, errorResponse, Date.now() - startTime);
  return errorResponse;
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T = any>(
  url: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T = any>(
  url: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Convenience method for PATCH requests
 */
export async function apiPatch<T = any>(
  url: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Clear the entire API cache
 */
export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Clear a specific entry from the API cache
 */
export function clearApiCacheEntry(url: string, options: RequestInit = {}): void {
  const cacheKey = getCacheKey(url, options);
  apiCache.delete(cacheKey);
}

/**
 * Check if a request is currently cached
 */
export function isRequestCached(url: string, options: RequestInit = {}): boolean {
  const cacheKey = getCacheKey(url, options);
  return apiCache.has(cacheKey);
}
