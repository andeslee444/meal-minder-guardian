import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '@/components/ui/toast/ToastContext';

/**
 * Hook to access the toast functionality from any component
 * Uses React context to provide access to the toast functions
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    console.warn(
      'useToast: Toast context not found. Make sure your component is wrapped in a ToastProvider.'
    );

    // Return a mock implementation to prevent errors
    return {
      toast: () => {
        console.warn('Toast attempted but no ToastProvider was found.');
        return { id: 'mock-toast', dismiss: () => {} };
      },
      dismiss: () => {},
      update: () => false,
    };
  }

  return context;
}
