import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/error-tracking';
import { getClient, withPerformanceTracking, handleSupabaseError } from '@/lib/admin-utils';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userId?: string;
}

export class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private isInitialized = false;
  private userId?: string;

  private constructor(userId?: string) {
    this.userId = userId;
  }

  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  public async initialize() {
    if (this.isInitialized) return;

    try {
      // Use admin client for table creation operations
      const client = getClient(true); // true = requires admin
      
      await withPerformanceTracking('Error logs table initialization', async () => {
        // Try to create error_logs table if it doesn't exist
        const { error } = await client.rpc('create_error_logs_table_if_not_exists');

        if (error) {
          console.warn(
            'Unable to initialize error logging RPC, will attempt direct table access:',
            error.message
          );

          // Check if the table exists by querying it directly
          const { error: tableError } = await client.from('error_logs').select('id').limit(1);

          if (tableError) {
            // Use the error handling utility
            handleSupabaseError(tableError, 'error_logs table initialization');
            
            // Only return early if it's not a "not found" error which is expected
            if (!tableError.message.includes('not found')) {
              return;
            }
          }
        }
      });
    } catch (e) {
      console.error('Error during error logging initialization:', e);
      // Continue anyway to allow the application to work
    }

    this.isInitialized = true;
  }

  public async logError(error: Error, componentStack?: string) {
    // Initialize if needed
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (e) {
        console.error('Failed to initialize error logging:', e);
        // Continue to log to console even if initialization fails
      }
    }

    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      userId: this.userId,
    };

    try {
      await this.logToSupabase(errorLog);
      ErrorLoggingService.logToConsole(error, { componentStack });

      // Also use the global error tracking service
      captureError(error, { componentStack });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private async logToSupabase(errorLog: ErrorLog) {
    try {
      // Use admin client for error logging to ensure all errors are logged
      const client = getClient(true);
      
      await withPerformanceTracking('Error logging to database', async () => {
        const { error: insertError } = await client.from('error_logs').insert([
          {
            message: errorLog.message,
            stack: errorLog.stack,
            component_stack: errorLog.componentStack,
            user_id: errorLog.userId,
            timestamp: errorLog.timestamp,
          },
        ]);

        if (insertError) {
          handleSupabaseError(insertError, 'error logging');
        }
      });
    } catch (e) {
      console.error('Exception during error logging to Supabase:', e);
    }
  }

  private static logToConsole(error: Error, context?: Record<string, unknown>) {
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.error('Error:', error);
      if (context) {
        console.error('Context:', context);
      }
    }
  }
}

export const errorLogger = ErrorLoggingService.getInstance();
