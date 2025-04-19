import { useEffect } from 'react';
import { StatusMessage, StatusType } from '../services/status/status-core';
import { statusService } from '../services/status/status-service';
import { statusSubscriptionManager } from '../services/status/status-subscription';

interface UseStatusOptions {
  filter?: {
    type?: StatusType;
    source?: string;
    isRead?: boolean;
  };
  onMessage?: (message: StatusMessage) => void;
}

export function useStatus(options: UseStatusOptions = {}) {
  const { filter, onMessage } = options;

  useEffect(() => {
    if (!onMessage) return;

    const subscriptionId = statusSubscriptionManager.subscribe(onMessage, filter);

    return () => {
      statusSubscriptionManager.unsubscribe(subscriptionId);
    };
  }, [filter, onMessage]);

  return {
    showError: (message: string, source: string, metadata?: Record<string, unknown>) =>
      statusService.showError(message, source, metadata),
    showWarning: (message: string, source: string, metadata?: Record<string, unknown>) =>
      statusService.showWarning(message, source, metadata),
    showInfo: (message: string, source: string, metadata?: Record<string, unknown>) =>
      statusService.showInfo(message, source, metadata),
    showSuccess: (message: string, source: string, metadata?: Record<string, unknown>) =>
      statusService.showSuccess(message, source, metadata),
    showMessage: (
      type: StatusType,
      message: string,
      source: string,
      metadata?: Record<string, unknown>
    ) => statusService.showMessage(type, message, source, metadata),
    clearAllMessages: () => statusService.clearAllMessages(),
    markMessageAsRead: (messageId: string) => statusService.markMessageAsRead(messageId),
  };
}
