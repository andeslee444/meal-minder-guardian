import { StatusMessage, StatusType, useStatusStore } from './status-core';

interface MessageManagerOptions {
  autoClearDelay?: number;
  deduplicationWindow?: number;
}

export class StatusMessageManager {
  private static instance: StatusMessageManager;
  private autoClearTimers: Map<string, NodeJS.Timeout>;
  private options: Required<MessageManagerOptions>;

  private constructor(options: MessageManagerOptions = {}) {
    this.autoClearTimers = new Map();
    this.options = {
      autoClearDelay: options.autoClearDelay || 5000,
      deduplicationWindow: options.deduplicationWindow || 3000,
    };
  }

  public static getInstance(options?: MessageManagerOptions): StatusMessageManager {
    if (!StatusMessageManager.instance) {
      StatusMessageManager.instance = new StatusMessageManager(options);
    }
    return StatusMessageManager.instance;
  }

  public showMessage(
    type: StatusType,
    message: string,
    source: string,
    metadata?: Record<string, unknown>
  ): void {
    const store = useStatusStore.getState();

    // Check for duplicate messages within the deduplication window
    const isDuplicate = store.messages.some(
      msg =>
        msg.message === message &&
        msg.type === type &&
        msg.source === source &&
        Date.now() - msg.timestamp < this.options.deduplicationWindow
    );

    if (isDuplicate) {
      return;
    }

    store.addMessage({ type, message, source, metadata });

    // Auto-clear success and info messages
    if (type === 'success' || type === 'info') {
      const messageId = store.messages[store.messages.length - 1].id;
      this.scheduleAutoClear(messageId);
    }
  }

  private scheduleAutoClear(messageId: string): void {
    const timer = setTimeout(() => {
      const store = useStatusStore.getState();
      store.removeMessage(messageId);
      this.autoClearTimers.delete(messageId);
    }, this.options.autoClearDelay);

    this.autoClearTimers.set(messageId, timer);
  }

  public clearAllMessages(): void {
    const store = useStatusStore.getState();
    store.clearMessages();

    // Clear all auto-clear timers
    this.autoClearTimers.forEach(timer => clearTimeout(timer));
    this.autoClearTimers.clear();
  }

  public markMessageAsRead(messageId: string): void {
    const store = useStatusStore.getState();
    store.markAsRead(messageId);
  }
}
