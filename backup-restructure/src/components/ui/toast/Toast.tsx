import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ToastVariant } from './ToastContext';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  autoClose?: boolean;
  onDismiss: () => void;
}

/**
 * Toast component for displaying notifications
 */
export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  autoClose = true,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Animation handling
  useEffect(() => {
    // Animation timing
    const enterTimeout = setTimeout(() => {
      setVisible(true);
    }, 10);

    // Auto-dismiss timeout
    let dismissTimeout: NodeJS.Timeout | undefined;
    if (autoClose && duration > 0) {
      dismissTimeout = setTimeout(() => {
        dismiss();
      }, duration);
    }

    return () => {
      clearTimeout(enterTimeout);
      if (dismissTimeout) clearTimeout(dismissTimeout);
    };
  }, [autoClose, duration]);

  // Handle dismissal with animation
  const dismiss = () => {
    setRemoving(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Animation time
  };

  return (
    <div
      data-toast-id={id}
      className={cn(
        'relative max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 p-4 mb-3 transform transition-all duration-300 ease-in-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        removing ? 'translate-y-2 opacity-0' : '',
        variant === 'success' && 'border-l-4 border-l-green-500',
        variant === 'error' && 'border-l-4 border-l-red-500',
        variant === 'warning' && 'border-l-4 border-l-amber-500',
        variant === 'info' && 'border-l-4 border-l-blue-500',
        variant === 'destructive' && 'border-l-4 border-l-red-600 bg-red-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <h3
            className={cn(
              'text-sm font-medium',
              variant === 'default' && 'text-gray-900',
              variant === 'success' && 'text-green-700',
              variant === 'error' && 'text-red-700',
              variant === 'warning' && 'text-amber-700',
              variant === 'info' && 'text-blue-700',
              variant === 'destructive' && 'text-red-700'
            )}
          >
            {title}
          </h3>

          {description && (
            <div
              className={cn(
                'mt-1 text-sm',
                variant === 'default' && 'text-gray-600',
                variant === 'success' && 'text-green-600',
                variant === 'error' && 'text-red-600',
                variant === 'warning' && 'text-amber-600',
                variant === 'info' && 'text-blue-600',
                variant === 'destructive' && 'text-red-600'
              )}
            >
              {description}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          className={cn(
            'w-5 h-5 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1',
            variant === 'default' && 'text-gray-400 hover:text-gray-700 focus:ring-gray-400',
            variant === 'success' && 'text-green-500 hover:text-green-700 focus:ring-green-500',
            variant === 'error' && 'text-red-500 hover:text-red-700 focus:ring-red-500',
            variant === 'warning' && 'text-amber-500 hover:text-amber-700 focus:ring-amber-500',
            variant === 'info' && 'text-blue-500 hover:text-blue-700 focus:ring-blue-500',
            variant === 'destructive' && 'text-red-600 hover:text-red-800 focus:ring-red-600'
          )}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {autoClose && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200 transition-all duration-100 ease-in-out">
          <div
            className={cn(
              'h-full progress-bar',
              variant === 'default' && 'bg-gray-600',
              variant === 'success' && 'bg-green-500',
              variant === 'error' && 'bg-red-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'info' && 'bg-blue-500',
              variant === 'destructive' && 'bg-red-600'
            )}
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Container for toast notifications
 */
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          .progress-bar {
            width: 100%;
            animation: shrink linear forwards;
          }
        `}
      </style>
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-md w-full">
        {children}
      </div>
    </>
  );
}
