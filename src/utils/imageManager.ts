import { logger } from './logger';
import { cache } from './cache';
import { performanceMonitor } from './performance';
import { errorHandler } from './errorHandler';

interface ImageLoadOptions {
  cacheKey?: string;
  cacheTTL?: number;
  maxRetries?: number;
  retryDelay?: number;
  fallbackStrategies?: ImageFallbackStrategy[];
}

type ImageFallbackStrategy = (url: string) => Promise<string>;

class ImageManager {
  private static instance: ImageManager;
  private readonly DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1 second
  private readonly DEFAULT_FALLBACK_STRATEGIES: ImageFallbackStrategy[] = [];

  private constructor() {}

  static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  async loadImage(url: string, options: ImageLoadOptions = {}): Promise<string> {
    const {
      cacheKey = url,
      cacheTTL = this.DEFAULT_CACHE_TTL,
      maxRetries = this.DEFAULT_MAX_RETRIES,
      retryDelay = this.DEFAULT_RETRY_DELAY,
      fallbackStrategies = this.DEFAULT_FALLBACK_STRATEGIES,
    } = options;

    // Check cache first
    const cachedUrl = cache.get<string>(cacheKey);
    if (cachedUrl) {
      logger.debug('image', `Cache hit for image: ${url}`);
      return cachedUrl;
    }

    let lastError: Error | null = null;

    // Try loading the original URL
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const isValid = await performanceMonitor.measureAsync('image_validation', () =>
          this.validateImage(url)
        );

        if (isValid) {
          cache.set(cacheKey, url, cacheTTL);
          return url;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');

        if (attempt < maxRetries) {
          logger.warn(
            'image',
            `Image validation failed, retrying... (attempt ${attempt + 1}/${maxRetries})`,
            {
              url,
              error: lastError,
            }
          );

          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }
    }

    // Try fallback strategies
    for (const strategy of fallbackStrategies) {
      try {
        const fallbackUrl = await strategy(url);
        if (fallbackUrl) {
          cache.set(cacheKey, fallbackUrl, cacheTTL);
          return fallbackUrl;
        }
      } catch (error) {
        errorHandler.handleError(error, {
          component: 'ImageManager',
          action: 'fallback_strategy',
          metadata: { url },
        });
      }
    }

    // If all strategies fail, throw the last error
    errorHandler.handleError(lastError, {
      component: 'ImageManager',
      action: 'load_image',
      metadata: { url },
    });

    throw lastError;
  }

  private async validateImage(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.warn('image', `Failed to validate image: ${url}`, { error });
      return false;
    }
  }

  addFallbackStrategy(strategy: ImageFallbackStrategy): void {
    this.DEFAULT_FALLBACK_STRATEGIES.push(strategy);
  }

  clearCache(): void {
    const keys = cache.getKeys().filter(key => key.startsWith('image:'));
    keys.forEach(key => cache.delete(key));
    logger.info('image', 'Image cache cleared');
  }

  // Method to destroy the manager instance (useful for testing)
  destroy(): void {
    this.clearCache();
    this.DEFAULT_FALLBACK_STRATEGIES.length = 0;
    // @ts-ignore
    ImageManager.instance = null;
  }
}

export const imageManager = ImageManager.getInstance();
