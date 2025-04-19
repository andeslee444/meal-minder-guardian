import { StatusMessage, StatusListener } from './status-types';
import { statusMessages, listeners } from './status-core';

/**
 * Hook for subscribing to status messages
 */
export const subscribeToStatusMessages = (listener: StatusListener): (() => void) => {
  listeners.push(listener);

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Get current status messages (for initial state)
 */
export const getCurrentStatusMessages = (): StatusMessage[] => {
  return [...statusMessages];
};
