import { CONFIG } from './config.ts';

// Rate limiting configuration from central config
const RATE_LIMIT_WINDOW = CONFIG.RATE_LIMIT.WINDOW_MS;
const MAX_REQUESTS_PER_WINDOW = CONFIG.RATE_LIMIT.MAX_REQUESTS;
const requestLog = new Map<string, number[]>();

/**
 * Checks if a client IP has exceeded the rate limit
 * @param clientIp The client's IP address
 * @returns boolean indicating if the client is rate limited
 */
export function rateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientRequests = requestLog.get(clientIp) || [];

  // Filter out requests older than the rate limit window
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  // Update the request log
  requestLog.set(clientIp, [...recentRequests, now]);

  // Check if the client has exceeded the rate limit
  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}
