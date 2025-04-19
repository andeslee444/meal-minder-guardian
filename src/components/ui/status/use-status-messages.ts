import { useState, useEffect } from 'react';
import { StatusMessage } from './status-types';
import { subscribeToStatusMessages, getCurrentStatusMessages } from './status-service';

/**
 * Hook to access and subscribe to status messages
 */
export const useStatusMessages = () => {
  const [messages, setMessages] = useState<StatusMessage[]>(getCurrentStatusMessages());

  useEffect(() => {
    // Subscribe to status message updates
    const unsubscribe = subscribeToStatusMessages(updatedMessages => {
      setMessages([...updatedMessages]);
    });

    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, []);

  return messages;
};
