import { formatFavoriteCount } from '../formatters';

describe('formatters', () => {
  describe('formatFavoriteCount', () => {
    test('returns numbers below 1000 as is', () => {
      expect(formatFavoriteCount(0)).toBe('0');
      expect(formatFavoriteCount(1)).toBe('1');
      expect(formatFavoriteCount(999)).toBe('999');
    });

    test('formats numbers between 1000 and 999999 with k suffix', () => {
      expect(formatFavoriteCount(1000)).toBe('1.0k');
      expect(formatFavoriteCount(1500)).toBe('1.5k');
      expect(formatFavoriteCount(10000)).toBe('10.0k');
      expect(formatFavoriteCount(10500)).toBe('10.5k');
      expect(formatFavoriteCount(999999)).toBe('1000.0k');
    });

    test('formats numbers 1000000 and above with M suffix', () => {
      expect(formatFavoriteCount(1000000)).toBe('1.0M');
      expect(formatFavoriteCount(1500000)).toBe('1.5M');
      expect(formatFavoriteCount(10000000)).toBe('10.0M');
      expect(formatFavoriteCount(10500000)).toBe('10.5M');
    });

    test('rounds down to the nearest tenth', () => {
      expect(formatFavoriteCount(1234)).toBe('1.2k');
      expect(formatFavoriteCount(1250)).toBe('1.2k');
      expect(formatFavoriteCount(1299)).toBe('1.2k');

      expect(formatFavoriteCount(1234567)).toBe('1.2M');
      expect(formatFavoriteCount(1250000)).toBe('1.2M');
      expect(formatFavoriteCount(1299999)).toBe('1.2M');
    });

    test('handles negative numbers', () => {
      expect(formatFavoriteCount(-1)).toBe('-1');
      expect(formatFavoriteCount(-1000)).toBe('-1.0k');
      expect(formatFavoriteCount(-1000000)).toBe('-1.0M');
    });

    test('handles zero', () => {
      expect(formatFavoriteCount(0)).toBe('0');
    });

    test('handles floating point numbers', () => {
      expect(formatFavoriteCount(123.45)).toBe('123');
      expect(formatFavoriteCount(1234.56)).toBe('1.2k');
      expect(formatFavoriteCount(1234567.89)).toBe('1.2M');
    });
  });
});
