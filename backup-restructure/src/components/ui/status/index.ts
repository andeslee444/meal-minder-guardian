import StatusIndicator from './status-indicator';
import { addStatusMessage, clearStatusMessages, markAllAsRead } from './status-service';
import { useStatusMessages } from './use-status-messages';
import type { StatusType, StatusMessage } from './status-types';

// Export named exports
export { addStatusMessage, clearStatusMessages, markAllAsRead };
export { useStatusMessages };
export type { StatusType, StatusMessage };

// Also export StatusIndicator as the default export
export default StatusIndicator;
