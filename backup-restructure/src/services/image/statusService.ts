import { addStatusMessage } from '@/components/ui/status';
import { StatusType } from '@/components/ui/status/status-types';

/**
 * Show a status message and deduplicate identical messages
 */
export const showStatusMessage = (type: StatusType, message: string, source?: string): void => {
  // The addStatusMessage function in status-service already handles deduplication
  addStatusMessage(type, message, source);
};
