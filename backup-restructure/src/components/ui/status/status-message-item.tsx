import React from 'react';
import { X } from 'lucide-react';
import { StatusMessage } from './status-types';
import { markAsRead, removeStatusMessage } from './status-service';
import StatusIcon from './status-icon';
import { cn } from '@/lib/utils';

interface StatusMessageItemProps {
  message: StatusMessage;
}

const StatusMessageItem: React.FC<StatusMessageItemProps> = ({ message }) => {
  const { id, type, message: text, source, details, timestamp, read } = message;

  const handleRead = () => {
    if (!read) {
      markAsRead(id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeStatusMessage(id);
  };

  // Format the timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'p-3 hover:bg-muted/50 cursor-pointer flex items-start gap-3',
        !read && 'bg-muted/30'
      )}
      onClick={handleRead}
    >
      <div className="flex-shrink-0 mt-0.5">
        <StatusIcon type={type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium leading-none">{source}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
            <button onClick={handleRemove} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <p className="mt-1 text-sm">{text}</p>

        {details && <p className="mt-1 text-xs text-muted-foreground">{details}</p>}
      </div>
    </div>
  );
};

export default StatusMessageItem;
