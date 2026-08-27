import { describe, it, expect } from 'vitest';
import { decode, isSuccessResult, isFailedResult } from '../../../index';

// Load the manufacturer to register it before tests run
import '../index';

describe('Goodman Decoder', () => {
  describe('Standard 10-Digit Format (YYMMXXXXXX)', () => {
    const successCases = [
      {
        serial: '2108123456',
        description: '2021-08 (Current century)',
        expected: { status: 'success', date: 'August 2021' },
      },
      {
        serial: '9912123456',
        description: '1999-12 (Previous century)',
        expected: { status: 'success', date: 'December 1999' },
      },
      {
        serial: '0505123456',
        description: '2005-05 (Early 2000s)',
        expected: { status: 'success', date: 'May 2005' },
      },
      {
        serial: '8201123456',
        description: '1982-01 (Earliest Goodman HVAC year)',
        expected: { status: 'success', date: 'January 1982' },
      },
    ];

    it.each(successCases)('decodes $description ($serial) correctly', ({ serial, expected }) => {
      const result = decode('goodman', serial);
      expect(isSuccessResult(result)).toBe(true);
      if (isSuccessResult(result) && expected.status === 'success') {
        expect(result.manufactureDate!.display).toBe(expected.date);
        expect(result.confidence).toBe('high');
        expect(result.formatUsed?.id).toBe('goodman-standard-10');
      }
    });

    const validationCases = [
      {
        serial: '2113123456',
        description: 'Invalid month (13)',
        expected: { status: 'unsupported' },
      },
      {
        serial: '8101123456',
        description: 'Invalid year (1981 - before Goodman HVAC)',
        expected: { status: 'unsupported' },
      },
    ];

    it.each(validationCases)('rejects $description ($serial)', ({ serial }) => {
      const result = decode('goodman', serial);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('Legacy PTAC Formats (Explicitly Unsupported)', () => {
    const ptacCases = [
      { serial: '3BK123456D', description: 'Starts with digit, ends with D' },
      { serial: 'BK123456P', description: 'Starts with letters, ends with P' },
    ];

    it.each(ptacCases)('rejects $description ($serial) with explicit explanation', ({ serial }) => {
      const result = decode('goodman', serial);
      expect(isFailedResult(result)).toBe(true);
      if (isFailedResult(result)) {
        expect(result.status).toBe('unsupported');
        expect(result.explanation).toMatch(/Pre-2012 Goodman PTAC/i);
      }
    });
  });
  
  describe('General Rejections', () => {
    it('returns unsupported for clearly wrong length', () => {
      const result = decode('goodman', '210812345'); // 9 digits
      expect(result.status).toBe('unsupported');
    });
  });
});

