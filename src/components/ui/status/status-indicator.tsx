import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatusMessages } from './use-status-messages';
import { clearStatusMessages, markAllAsRead } from './status-service';
import StatusIcon from './status-icon';
import StatusMessageItem from './status-message-item';

interface StatusIndicatorProps {
  className?: string;
}

/**
 * Status indicator component that shows floating status messages
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ className }) => {
  const messages = useStatusMessages();
  const [isOpen, setIsOpen] = useState(false);
  const hasUnread = messages.some(msg => !msg.read);
  const hasErrors = messages.some(msg => msg.type === 'error');
  const hasWarnings = messages.some(msg => msg.type === 'warning');

  // Get indicator color based on message types
  const getIndicatorColor = () => {
    if (hasErrors) return 'bg-destructive';
    if (hasWarnings) return 'bg-amber-500';
    if (messages.length > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAllAsRead();
    }
  };

  // Only show if we have messages
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 flex flex-col items-end', className)}>
      {/* Status panel */}
      {isOpen && (
        <div className="mb-2 w-80 max-h-[60vh] overflow-y-auto rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">Status Messages</h3>
            <div className="flex gap-2">
              <button
                onClick={clearStatusMessages}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="divide-y">
            {messages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No status messages</div>
            ) : (
              messages.map(msg => <StatusMessageItem key={msg.id} message={msg} />)
            )}
          </div>
        </div>
      )}

      {/* Status indicator button */}
      <button
        onClick={toggleOpen}
        className={cn(
          'rounded-full flex items-center gap-1 px-3 py-1.5 text-white shadow-md transition-all',
          getIndicatorColor(),
          hasUnread && 'animate-pulse'
        )}
      >
        <div className="flex items-center">
          <StatusIcon type={hasErrors ? 'error' : hasWarnings ? 'warning' : 'info'} />
          <span className="ml-1.5 text-xs font-medium">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>
    </div>
  );
};

export default StatusIndicator;
