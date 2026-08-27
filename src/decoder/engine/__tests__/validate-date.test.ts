import { describe, it, expect } from 'vitest';
import { validateDecodedDate } from '../../engine/validate-date';

const REF_DATE = new Date(2025, 5, 15); // June 15, 2025

describe('validateDecodedDate', () => {
  // -----------------------------------------------------------------------
  // Valid dates
  // -----------------------------------------------------------------------
  describe('valid dates', () => {
    it('accepts a valid year-only date', () => {
      expect(validateDecodedDate(2020, null, null, null, REF_DATE)).toBeNull();
    });

    it('accepts a valid year + month', () => {
      expect(validateDecodedDate(2020, 6, null, null, REF_DATE)).toBeNull();
    });

    it('accepts a valid year + month + day', () => {
      expect(validateDecodedDate(2020, 3, null, 15, REF_DATE)).toBeNull();
    });

    it('accepts a valid year + week', () => {
      expect(validateDecodedDate(2020, null, 31, null, REF_DATE)).toBeNull();
    });

    it('accepts the minimum plausible year (1950)', () => {
      expect(validateDecodedDate(1950, null, null, null, REF_DATE)).toBeNull();
    });

    it('accepts a year slightly in the future', () => {
      expect(validateDecodedDate(2027, null, null, null, REF_DATE)).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Invalid years
  // -----------------------------------------------------------------------
  describe('invalid years', () => {
    it('rejects year before 1950', () => {
      const err = validateDecodedDate(1800, null, null, null, REF_DATE);
      expect(err).toContain('Implausible year');
    });

    it('rejects year too far in the future', () => {
      const err = validateDecodedDate(2030, null, null, null, REF_DATE);
      expect(err).toContain('Implausible year');
    });

    it('rejects non-integer year', () => {
      const err = validateDecodedDate(2020.5, null, null, null, REF_DATE);
      expect(err).toContain('not an integer');
    });
  });

  // -----------------------------------------------------------------------
  // Invalid months
  // -----------------------------------------------------------------------
  describe('invalid months', () => {
    it('rejects month 0', () => {
      const err = validateDecodedDate(2020, 0, null, null, REF_DATE);
      expect(err).toContain('Invalid month');
    });

    it('rejects month 13', () => {
      const err = validateDecodedDate(2020, 13, null, null, REF_DATE);
      expect(err).toContain('Invalid month');
    });

    it('rejects non-integer month', () => {
      const err = validateDecodedDate(2020, 1.5, null, null, REF_DATE);
      expect(err).toContain('Invalid month');
    });
  });

  // -----------------------------------------------------------------------
  // Invalid weeks
  // -----------------------------------------------------------------------
  describe('invalid weeks', () => {
    it('rejects week 0', () => {
      const err = validateDecodedDate(2020, null, 0, null, REF_DATE);
      expect(err).toContain('Invalid week');
    });

    it('rejects week 54', () => {
      const err = validateDecodedDate(2020, null, 54, null, REF_DATE);
      expect(err).toContain('Invalid week');
    });
  });

  // -----------------------------------------------------------------------
  // Invalid days
  // -----------------------------------------------------------------------
  describe('invalid days', () => {
    it('rejects day 0', () => {
      const err = validateDecodedDate(2020, 3, null, 0, REF_DATE);
      expect(err).toContain('Invalid day');
    });

    it('rejects day 32', () => {
      const err = validateDecodedDate(2020, 3, null, 32, REF_DATE);
      expect(err).toContain('Invalid day');
    });
  });

  // -----------------------------------------------------------------------
  // Impossible calendar dates
  // -----------------------------------------------------------------------
  describe('impossible calendar dates', () => {
    it('rejects February 30', () => {
      const err = validateDecodedDate(2020, 2, null, 30, REF_DATE);
      expect(err).toContain('does not exist');
    });

    it('rejects February 29 in a non-leap year', () => {
      const err = validateDecodedDate(2019, 2, null, 29, REF_DATE);
      expect(err).toContain('does not exist');
    });

    it('accepts February 29 in a leap year', () => {
      expect(validateDecodedDate(2020, 2, null, 29, REF_DATE)).toBeNull();
    });

    it('rejects April 31', () => {
      const err = validateDecodedDate(2020, 4, null, 31, REF_DATE);
      expect(err).toContain('does not exist');
    });

    it('accepts March 31', () => {
      expect(validateDecodedDate(2020, 3, null, 31, REF_DATE)).toBeNull();
    });
  });
});
