import { render } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorLoggingService } from '@/services/ErrorLoggingService';

// Mock ErrorLoggingService
jest.mock('@/services/ErrorLoggingService');

describe('ErrorBoundary', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      reload: jest.fn(),
    } as any;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI and log error when there is an error', () => {
    const error = new Error('Test error');
    const ThrowError = () => {
      throw error;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(ErrorLoggingService.prototype.logError).toHaveBeenCalledWith(error, expect.any(String));
  });
});
