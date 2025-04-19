import { useCallback } from 'react';

/**
 * Simple debug logger hook to standardize logging
 */
export const useDebugLogger = (source: string) => {
  const log = useCallback(
    (message: string, ...args: any[]) => {
      console.log(`[${source}] ${message}`, ...args);
    },
    [source]
  );

  const error = useCallback(
    (message: string, ...args: any[]) => {
      console.error(`[${source}] ${message}`, ...args);
    },
    [source]
  );

  const warn = useCallback(
    (message: string, ...args: any[]) => {
      console.warn(`[${source}] ${message}`, ...args);
    },
    [source]
  );

  const info = useCallback(
    (message: string, ...args: any[]) => {
      console.info(`[${source}] ${message}`, ...args);
    },
    [source]
  );

  const debug = useCallback(
    (message: string, ...args: any[]) => {
      console.debug(`[${source}] ${message}`, ...args);
    },
    [source]
  );

  return {
    log,
    error,
    warn,
    info,
    debug,
  };
};
