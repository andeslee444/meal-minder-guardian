import { logger } from './logger';
import { cache } from './cache';
import { errorHandler } from './errorHandler';
import { performanceMonitor } from './performance';

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheTTL?: number;
}

class ApiClient {
  private static instance: ApiClient;
  private readonly DEFAULT_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1 second
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const {
      retries = this.DEFAULT_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
      cacheKey,
      cacheTTL = this.DEFAULT_CACHE_TTL,
      ...requestConfig
    } = config;

    // Check cache if cacheKey is provided
    if (cacheKey) {
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData !== null) {
        logger.debug('api', `Cache hit for ${url}`);
        return cachedData;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await performanceMonitor.measureAsync('api_request', () =>
          fetch(url, requestConfig)
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Cache the response if cacheKey is provided
        if (cacheKey) {
          cache.set(cacheKey, data, cacheTTL);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');

        if (attempt < retries) {
          logger.warn('api', `Request failed, retrying... (attempt ${attempt + 1}/${retries})`, {
            url,
            error: lastError,
          });

          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        errorHandler.handleError(lastError, {
          component: 'ApiClient',
          action: 'request',
          metadata: { url, attempt },
        });

        throw lastError;
      }
    }

    throw lastError;
  }

  async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // Method to destroy the client instance (useful for testing)
  destroy(): void {
    // @ts-ignore
    ApiClient.instance = null;
  }
}

export const apiClient = ApiClient.getInstance();
