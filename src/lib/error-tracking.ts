import * as Sentry from '@sentry/react';
import { type Event as SentryEvent, type EventHint } from '@sentry/types';

/**
 * Initialize Sentry error tracking
 *
 * This should be called early in your application's lifecycle.
 *
 * Usage:
 * ```
 * // In your main.tsx or index.tsx
 * import { initErrorTracking } from '@/lib/error-tracking';
 *
 * // Initialize error tracking
 * initErrorTracking();
 * ```
 */
export function initErrorTracking() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      // Use Sentry's default integrations
      // Filter out unwanted default integrations if needed
      integrations: Sentry.getDefaultIntegrations({
        // Example: Disable a specific default integration if causing issues
        // httpClient: false,
      }),

      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // If you want performance monitoring, configure Sentry.BrowserTracing separately
      tracesSampleRate: 0.2,

      // Set environment based on the environment variable
      environment: import.meta.env.MODE,

      // Only capture errors in production
      enabled: import.meta.env.PROD,

      // Use simplified types for beforeSend
      beforeSend(event, hint: EventHint) {
        try {
          const error = hint.originalException as Error;
          if (error && error.message && error.message.match(/specific error to ignore/i)) {
            console.log('[Sentry] Ignoring error:', error.message);
            return null;
          }
        } catch (e) {
          console.error('[Sentry] Error in beforeSend:', e);
        }
        return event; // Return the event (potentially modified)
      },
    });

    // If using performance monitoring:
    // Sentry.addIntegration(new Sentry.BrowserTracing());

    console.log('Sentry error tracking initialized in', import.meta.env.MODE, 'mode');
  } else {
    console.log('Sentry error tracking not initialized (development mode or missing DSN)');
  }
}

/**
 * Wrapper function to log errors to console and capture in Sentry
 */
export function captureError(error: unknown, context: Record<string, any> = {}) {
  console.error('Error captured:', error);

  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  return error;
}
