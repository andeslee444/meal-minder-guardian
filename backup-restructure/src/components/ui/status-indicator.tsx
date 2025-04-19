/**
 * Re-export from the refactored status module
 */
export {
  default,
  addStatusMessage,
  clearStatusMessages,
  markAllAsRead,
  useStatusMessages,
} from './status';
export type { StatusType, StatusMessage } from './status';
