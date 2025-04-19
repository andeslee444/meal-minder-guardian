/**
 * Formats a number for display, abbreviating large numbers
 * For example, 1500 becomes 1.5k, 1000000 becomes 1M
 *
 * @param count The number to format
 * @returns Formatted string representation of the number
 */
export function formatFavoriteCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return (Math.floor(count / 100) / 10).toFixed(1) + 'k';
  } else {
    return (Math.floor(count / 100000) / 10).toFixed(1) + 'M';
  }
}
