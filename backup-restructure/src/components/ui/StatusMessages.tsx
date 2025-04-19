import { useEffect } from 'react';
import { useStatusStore } from '../../services/status/status-core';
import { useStatus } from '../../hooks/useStatus';
import { cn } from '../../lib/utils';

export function StatusMessages() {
  const messages = useStatusStore(state => state.messages);
  const { markMessageAsRead } = useStatus();

  useEffect(() => {
    // Auto-mark messages as read after 5 seconds
    const timer = setInterval(() => {
      messages.forEach(message => {
        if (!message.isRead && Date.now() - message.timestamp > 5000) {
          markMessageAsRead(message.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [messages, markMessageAsRead]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map(message => (
        <div
          key={message.id}
          className={cn(
            'rounded-lg p-4 shadow-lg transition-all duration-300',
            'max-w-md transform hover:scale-105',
            {
              'bg-red-100 text-red-800': message.type === 'error',
              'bg-yellow-100 text-yellow-800': message.type === 'warning',
              'bg-blue-100 text-blue-800': message.type === 'info',
              'bg-green-100 text-green-800': message.type === 'success',
              'opacity-75': message.isRead,
            }
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{message.message}</p>
              <p className="text-sm opacity-75">{message.source}</p>
            </div>
            <button
              onClick={() => markMessageAsRead(message.id)}
              className="ml-4 text-sm opacity-50 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
