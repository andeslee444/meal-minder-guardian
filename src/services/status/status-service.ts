import { StatusMessageManager } from './status-message-manager';
import { StatusType } from './status-core';

class StatusService {
  private static instance: StatusService;
  private messageManager: StatusMessageManager;

  private constructor() {
    this.messageManager = StatusMessageManager.getInstance({
      autoClearDelay: 5000,
      deduplicationWindow: 3000,
    });
  }

  public static getInstance(): StatusService {
    if (!StatusService.instance) {
      StatusService.instance = new StatusService();
    }
    return StatusService.instance;
  }

  public showError(message: string, source: string, metadata?: Record<string, unknown>): void {
    this.messageManager.showMessage('error', message, source, metadata);
  }

  public showWarning(message: string, source: string, metadata?: Record<string, unknown>): void {
    this.messageManager.showMessage('warning', message, source, metadata);
  }

  public showInfo(message: string, source: string, metadata?: Record<string, unknown>): void {
    this.messageManager.showMessage('info', message, source, metadata);
  }

  public showSuccess(message: string, source: string, metadata?: Record<string, unknown>): void {
    this.messageManager.showMessage('success', message, source, metadata);
  }

  public showMessage(
    type: StatusType,
    message: string,
    source: string,
    metadata?: Record<string, unknown>
  ): void {
    this.messageManager.showMessage(type, message, source, metadata);
  }

  public clearAllMessages(): void {
    this.messageManager.clearAllMessages();
  }

  public markMessageAsRead(messageId: string): void {
    this.messageManager.markMessageAsRead(messageId);
  }
}

export const statusService = StatusService.getInstance();
