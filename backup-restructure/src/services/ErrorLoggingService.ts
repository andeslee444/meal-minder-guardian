import { supabase } from '@/lib/supabase';

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

    // Create error_logs table if it doesn't exist
    const { error } = await supabase.rpc('create_error_logs_table_if_not_exists');
    if (error) {
      console.error('Failed to initialize error logging:', error);
      return;
    }

    this.isInitialized = true;
  }

  public async logError(error: Error, componentStack?: string) {
    if (!this.isInitialized) {
      await this.initialize();
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
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private async logToSupabase(errorLog: ErrorLog) {
    const { error: insertError } = await supabase.from('error_logs').insert([errorLog]);

    if (insertError) {
      console.error('Failed to log error:', insertError);
    }
  }

  private static logToConsole(error: Error, context?: Record<string, unknown>) {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    if (isDev) {
      console.error('Error:', error);
      if (context) {
        console.error('Context:', context);
      }
    }
  }
}

export const errorLogger = ErrorLoggingService.getInstance();
