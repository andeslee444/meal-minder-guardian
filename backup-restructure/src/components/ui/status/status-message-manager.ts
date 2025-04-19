import { StatusMessage, StatusType } from './status-types';
import {
  statusMessages,
  listeners,
  messageDeduplicationCache,
  MESSAGE_DEDUPE_TTL,
  MAX_MESSAGES,
  MAX_MESSAGES_PER_TYPE,
  createMessageSignature,
} from './status-core';

/**
 * Helper to trim messages by type if we exceed the limits
 */
export const trimMessagesByType = () => {
  // Count messages by type
  const messageCountByType = new Map<StatusType, StatusMessage[]>();

  // Initialize empty arrays for each type
  ['error', 'warning', 'info', 'success'].forEach(type => {
    messageCountByType.set(type as StatusType, []);
  });

  // Group messages by type
  statusMessages.forEach(msg => {
    const messagesOfType = messageCountByType.get(msg.type) || [];
    messagesOfType.push(msg);
    messageCountByType.set(msg.type, messagesOfType);
  });

  // Trim each type to its maximum
  let newMessages: StatusMessage[] = [];

  messageCountByType.forEach((messages, type) => {
    // Reduce the maximum number of messages per type to prevent clutter
    const maxForType = Math.min(MAX_MESSAGES_PER_TYPE.get(type) || 5, 3);
    // Sort by timestamp (newest first) before slicing
    const sortedMessages = [...messages].sort((a, b) => {
      const timestampA = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp;
      const timestampB = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp;
      return timestampB - timestampA;
    });
    newMessages = newMessages.concat(sortedMessages.slice(0, maxForType));
  });

  // Sort by timestamp (newest first)
  newMessages.sort((a, b) => {
    const timestampA = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp;
    const timestampB = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp;
    return timestampB - timestampA;
  });

  // Limit the total number of messages even further
  const MAX_TOTAL_MESSAGES = 10; // Reduced from 50
  newMessages = newMessages.slice(0, MAX_TOTAL_MESSAGES);

  // Update our messages array by replacing its contents
  statusMessages.length = 0;
  newMessages.forEach(msg => statusMessages.push(msg));
};

/**
 * Adds a new status message to the system with enhanced deduplication
 */
export const addStatusMessage = (
  type: StatusType,
  message: string,
  source: string = 'system',
  details?: string
): StatusMessage => {
  // Increase deduplication time to prevent message spam
  const STRICTER_DEDUPE_TTL = 120000; // 2 minutes (up from 30 seconds)

  // Check for duplicate message
  const messageSignature = createMessageSignature(type, message, source);
  const now = Date.now();
  const lastShown = messageDeduplicationCache.get(messageSignature);

  // If this is a duplicate message and it was shown recently, don't add it again
  if (lastShown && now - lastShown < STRICTER_DEDUPE_TTL) {
    console.log(
      `Suppressing duplicate status message: ${messageSignature} (${now - lastShown}ms < ${STRICTER_DEDUPE_TTL}ms cooldown)`
    );
    // Return the first matching message instead of creating a new one
    const existingMessage = statusMessages.find(
      msg => createMessageSignature(msg.type, msg.message, msg.source) === messageSignature
    );
    if (existingMessage) return existingMessage;
  }

  // For success messages, automatically mark older success messages as read
  if (type === 'success') {
    statusMessages.forEach((msg, index) => {
      if (msg.type === 'success' && !msg.read) {
        statusMessages[index] = { ...msg, read: true };
      }
    });
  }

  // Update the deduplication cache
  messageDeduplicationCache.set(messageSignature, now);

  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newMessage: StatusMessage = {
    id,
    type,
    message,
    source,
    details,
    timestamp: new Date(now),
    read: false,
  };

  // Add to beginning of array to show newest first
  statusMessages.unshift(newMessage);

  // Trim messages if we're over the limit
  if (statusMessages.length > 10) {
    // Reduced from MAX_MESSAGES (50)
    trimMessagesByType();
  }

  // Notify all listeners
  listeners.forEach(listener => listener([...statusMessages]));

  return newMessage;
};

/**
 * Removes a specific message by ID
 */
export const removeStatusMessage = (id: string): void => {
  const index = statusMessages.findIndex(msg => msg.id === id);
  if (index !== -1) {
    statusMessages.splice(index, 1);
    listeners.forEach(listener => listener([...statusMessages]));
  }
};

/**
 * Marks a specific message as read by ID
 */
export const markAsRead = (id: string): void => {
  const index = statusMessages.findIndex(msg => msg.id === id);
  if (index !== -1) {
    statusMessages[index] = { ...statusMessages[index], read: true };
    listeners.forEach(listener => listener([...statusMessages]));
  }
};

/**
 * Clears all status messages
 */
export const clearStatusMessages = () => {
  statusMessages.length = 0;
  messageDeduplicationCache.clear();
  listeners.forEach(listener => listener([...statusMessages]));
};

/**
 * Marks all status messages as read
 */
export const markAllAsRead = () => {
  statusMessages.forEach((msg, index) => {
    statusMessages[index] = { ...msg, read: true };
  });
  listeners.forEach(listener => listener([...statusMessages]));
};
