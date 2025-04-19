import { ErrorLoggingService } from '../ErrorLoggingService';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => {
  const mockInsert = jest.fn().mockResolvedValue({ error: null });
  const mockFrom = jest.fn(() => ({
    insert: mockInsert,
  }));

  return {
    supabase: {
      from: mockFrom,
      auth: {
        getUser: jest.fn(),
      },
      rpc: jest.fn().mockResolvedValue({ error: null }),
    },
  };
});

describe('ErrorLoggingService', () => {
  let service: ErrorLoggingService;
  const mockError = new Error('Test error');
  const mockComponentStack = 'Component stack trace';

  beforeEach(() => {
    jest.clearAllMocks();
    service = ErrorLoggingService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = ErrorLoggingService.getInstance();
    const instance2 = ErrorLoggingService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle initialization error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Failed to create table');
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ error });

    await service.initialize();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize error logging:', error);
    consoleSpy.mockRestore();
  });

  it('should log error with user ID when user is authenticated', async () => {
    const mockUser = { id: '123' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: mockUser } });
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ error: null });

    await service.logError(mockError, mockComponentStack);

    expect(supabase.from).toHaveBeenCalledWith('error_logs');
    expect(supabase.from('error_logs').insert).toHaveBeenCalledWith([
      {
        message: mockError.message,
        stack: mockError.stack,
        componentStack: mockComponentStack,
        timestamp: expect.any(String),
        userId: undefined,
      },
    ]);
  });

  it('should log error without user ID when user is not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } });
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ error: null });

    await service.logError(mockError);

    expect(supabase.from).toHaveBeenCalledWith('error_logs');
    expect(supabase.from('error_logs').insert).toHaveBeenCalledWith([
      {
        message: mockError.message,
        stack: mockError.stack,
        componentStack: undefined,
        timestamp: expect.any(String),
        userId: undefined,
      },
    ]);
  });
});
