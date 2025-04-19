import React, { createContext, useCallback, useState } from 'react';
import { Toast, ToastContainer } from './Toast';

// Toast variants
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

// Toast properties
export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  autoClose?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onDismiss?: () => void;
}

// Toast instance with id and dismiss function
export interface ToastInstance {
  id: string;
  dismiss: () => void;
}

// Toast context value
export interface ToastContextValue {
  toast: (props: ToastProps) => ToastInstance;
  dismiss: (id: string) => void;
  update: (id: string, props: Partial<ToastProps>) => boolean;
}

// Create the context
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Props for the provider
interface ToastProviderProps {
  children: React.ReactNode;
}

// Generate a unique ID for each toast
const generateId = () => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Toast Provider Component
 * Provides toast functionality to the application
 */
export function ToastProvider({ children }: ToastProviderProps) {
  // State to track all active toasts
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  // Add a new toast
  const toast = useCallback((props: ToastProps): ToastInstance => {
    const id = props.id || generateId();
    const newToast = { ...props, id };

    setToasts(currentToasts => [...currentToasts, newToast]);

    return {
      id,
      dismiss: () => dismiss(id),
    };
  }, []);

  // Remove a toast by ID
  const dismiss = useCallback((id: string) => {
    setToasts(currentToasts => {
      // Find the toast to dismiss
      const toastToDismiss = currentToasts.find(t => t.id === id);

      // If there's an onDismiss callback, call it
      if (toastToDismiss?.onDismiss) {
        toastToDismiss.onDismiss();
      }

      // Filter out the dismissed toast
      return currentToasts.filter(t => t.id !== id);
    });
  }, []);

  // Update an existing toast
  const update = useCallback((id: string, props: Partial<ToastProps>): boolean => {
    let found = false;

    setToasts(currentToasts => {
      return currentToasts.map(toast => {
        if (toast.id === id) {
          found = true;
          return { ...toast, ...props };
        }
        return toast;
      });
    });

    return found;
  }, []);

  // Context value
  const contextValue = {
    toast,
    dismiss,
    update,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            duration={toast.duration}
            autoClose={toast.autoClose !== false}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
