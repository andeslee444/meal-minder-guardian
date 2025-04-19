import { StatusMessage, StatusType } from './status-types';
import {
  addStatusMessage,
  clearStatusMessages,
  markAllAsRead,
  markAsRead,
  removeStatusMessage,
} from './status-message-manager';
import { subscribeToStatusMessages, getCurrentStatusMessages } from './status-subscription';

// Re-export everything
export {
  addStatusMessage,
  clearStatusMessages,
  markAllAsRead,
  markAsRead,
  removeStatusMessage,
  subscribeToStatusMessages,
  getCurrentStatusMessages,
};

/**
 * Show a status message (shorthand for addStatusMessage)
 */
export function showStatusMessage(
  type: StatusType,
  message: string,
  source = 'system',
  details?: string
): StatusMessage {
  return addStatusMessage(type, message, source, details);
}

/**
 * Show an error message
 */
export function showErrorMessage(
  message: string,
  source = 'system',
  details?: string
): StatusMessage {
  return addStatusMessage('error', message, source, details);
}

/**
 * Show a warning message
 */
export function showWarningMessage(
  message: string,
  source = 'system',
  details?: string
): StatusMessage {
  return addStatusMessage('warning', message, source, details);
}

/**
 * Show an info message
 */
export function showInfoMessage(
  message: string,
  source = 'system',
  details?: string
): StatusMessage {
  return addStatusMessage('info', message, source, details);
}

/**
 * Show a success message
 */
export function showSuccessMessage(
  message: string,
  source = 'system',
  details?: string
): StatusMessage {
  return addStatusMessage('success', message, source, details);
}
