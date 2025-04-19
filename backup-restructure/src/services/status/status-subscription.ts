import { StatusMessage, StatusType, useStatusStore } from './status-core';

type StatusCallback = (message: StatusMessage) => void;

interface StatusSubscription {
  id: string;
  callback: StatusCallback;
  filter?: {
    type?: StatusType;
    source?: string;
    isRead?: boolean;
  };
}

export class StatusSubscriptionManager {
  private static instance: StatusSubscriptionManager;
  private subscriptions: Map<string, StatusSubscription>;

  private constructor() {
    this.subscriptions = new Map();
  }

  public static getInstance(): StatusSubscriptionManager {
    if (!StatusSubscriptionManager.instance) {
      StatusSubscriptionManager.instance = new StatusSubscriptionManager();
    }
    return StatusSubscriptionManager.instance;
  }

  public subscribe(callback: StatusCallback, filter?: StatusSubscription['filter']): string {
    const id = crypto.randomUUID();
    this.subscriptions.set(id, { id, callback, filter });

    // Subscribe to store changes
    const unsubscribe = useStatusStore.subscribe(
      state => state.messages,
      messages => {
        messages.forEach(message => {
          if (this.shouldNotify(message, filter)) {
            callback(message);
          }
        });
      }
    );

    // Clean up subscription when component unmounts
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscriptions.delete(id);
  }

  private shouldNotify(message: StatusMessage, filter?: StatusSubscription['filter']): boolean {
    if (!filter) return true;

    if (filter.type && message.type !== filter.type) return false;
    if (filter.source && message.source !== filter.source) return false;
    if (filter.isRead !== undefined && message.isRead !== filter.isRead) return false;

    return true;
  }
}

export const statusSubscriptionManager = StatusSubscriptionManager.getInstance();
