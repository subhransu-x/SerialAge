import { describe, it, expect } from 'vitest';
import { decode, isSuccessResult } from '../../../index';

// Load the manufacturer to register it before tests run
import '../index';

describe('Amana Decoder', () => {
  describe('Modern 10-Digit Format (YYMMXXXXXX)', () => {
    const successCases = [
      {
        serial: '2108123456',
        description: '2021-08 (Modern)',
        expected: { status: 'success', date: 'August 2021' },
      },
      {
        serial: '0109145052',
        description: '2001-09 (Early 2000s)',
        expected: { status: 'success', date: 'September 2001' },
      },
      {
        serial: '9912123456',
        description: '1999-12 (Late 90s)',
        expected: { status: 'success', date: 'December 1999' },
      },
    ];

    it.each(successCases)('decodes $description ($serial) correctly', ({ serial, expected }) => {
      const result = decode('amana', serial);
      expect(isSuccessResult(result)).toBe(true);
      if (isSuccessResult(result) && expected.status === 'success') {
        expect(result.manufactureDate!.display).toBe(expected.date);
        expect(result.confidence).toBe('high');
        expect(result.formatUsed?.id).toBe('goodman-standard-10');
        expect(result.formatUsed?.name).toBe('Amana Modern (10-Digit)');
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
        description: 'Invalid year (1981)',
        expected: { status: 'unsupported' },
      },
    ];

    it.each(validationCases)('rejects $description ($serial)', ({ serial }) => {
      const result = decode('amana', serial);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('Unsupported Historical Formats', () => {
    const historicalCases = [
      { serial: '96-90391', description: 'Legacy dash format' },
      { serial: '04 05 90391', description: 'Legacy spaced format' },
      { serial: '040590391', description: '9-digit format' },
      { serial: 'B123456P', description: 'Legacy PTAC format' },
    ];

    it.each(historicalCases)('returns unsupported for $description ($serial)', ({ serial }) => {
      const result = decode('amana', serial);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('General Rejections', () => {
    it('returns unsupported for completely random 10-digit if year is invalid', () => {
      const result = decode('amana', '1234567890'); 
      // 12 = 2012, 34 = invalid month, so unsupported
      expect(result.status).toBe('unsupported');
    });
  });
  
  describe('Manufacturer Isolation', () => {
    it('does not leak Goodman-specific source metadata', () => {
      const result = decode('amana', '2108123456');
      expect(isSuccessResult(result)).toBe(true);
      if (isSuccessResult(result)) {
        const hasGoodmanSource = result.sources.some(s => s.name.includes('Goodman') || s.url?.includes('goodman'));
        expect(hasGoodmanSource).toBe(false);
        const hasAmanaSource = result.sources.some(s => s.name.includes('Building Intelligence Center') && s.url?.includes('amana'));
        expect(hasAmanaSource).toBe(true);
      }
    });
  });
});
