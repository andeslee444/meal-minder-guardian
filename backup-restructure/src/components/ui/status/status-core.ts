import { StatusMessage, StatusType, StatusListener } from './status-types';

// In-memory storage for status messages
const statusMessages: StatusMessage[] = [];
const listeners: StatusListener[] = [];

// Message deduplication cache - store message signatures and timestamps
const messageDeduplicationCache = new Map<string, number>();
const MESSAGE_DEDUPE_TTL = 30000; // 30 seconds between duplicate messages

// Message limits to prevent overwhelming the UI - REDUCED LIMITS
const MAX_MESSAGES = 15; // Reduced from 50
const MAX_MESSAGES_PER_TYPE = new Map<StatusType, number>([
  ['error', 5], // Reduced from 15
  ['warning', 3], // Reduced from 10
  ['info', 3], // Reduced from 8
  ['success', 3], // Reduced from 8
]);

// Helper function to create a message signature for deduplication
export const createMessageSignature = (
  type: StatusType,
  message: string,
  source?: string
): string => {
  return `${type}:${source || 'unknown'}:${message}`;
};

// Clean up old entries from the deduplication cache
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of messageDeduplicationCache.entries()) {
    if (now - timestamp > MESSAGE_DEDUPE_TTL) {
      messageDeduplicationCache.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

// Auto-clear success and info messages after some time
setInterval(() => {
  let hasChanges = false;
  // Remove old success and info messages
  for (let i = statusMessages.length - 1; i >= 0; i--) {
    const msg = statusMessages[i];
    if ((msg.type === 'success' || msg.type === 'info') && msg.timestamp instanceof Date) {
      const ageInMs = Date.now() - msg.timestamp.getTime();
      // Auto-remove success messages after 1 minute, info after 2 minutes
      const ttl = msg.type === 'success' ? 60000 : 120000;
      if (ageInMs > ttl) {
        statusMessages.splice(i, 1);
        hasChanges = true;
      }
    }
  }

  // Notify listeners if we removed any messages
  if (hasChanges && listeners.length > 0) {
    listeners.forEach(listener => listener([...statusMessages]));
  }
}, 30000); // Check every 30 seconds

// Export shared state and constants for other modules
export {
  statusMessages,
  listeners,
  messageDeduplicationCache,
  MESSAGE_DEDUPE_TTL,
  MAX_MESSAGES,
  MAX_MESSAGES_PER_TYPE,
};
