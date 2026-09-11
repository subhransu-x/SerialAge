import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSuccessResult,
  isAmbiguousResult,
  isFailedResult,
  hasDateInfo,
} from '../../types/guards';
import { decode } from '../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../engine/registry';
import type { FormatRule, DecodedData } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFormat(overrides: Partial<FormatRule> & { id: string }): FormatRule {
  return {
    name: overrides.id,
    description: 'Test format',
    yearRange: [2000, null],
    productTypes: [],
    sources: [
      {
        name: 'Test Source',
        url: null,
        dateReviewed: '2025-01-01',
        notes: 'Synthetic test source',
        confidence: 'verified',
      },
    ],
    matches: () => false,
    decode: () => null,
    ...overrides,
  };
}

function makeDecodedData(overrides: Partial<DecodedData> = {}): DecodedData {
  return {
    year: 2019,
    month: 3,
    week: null,
    day: null,
    productType: 'air-conditioner',
    explanation: 'Test decode',
    warnings: [],
    metadata: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Type Guards', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
  });

  describe('isSuccessResult', () => {
    it('returns true for a successful decode', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData() })],
      });
      const result = decode('test', 'ABC12345');
      expect(isSuccessResult(result)).toBe(true);

      // TypeScript narrowing: these should be non-null after the guard
      if (isSuccessResult(result)) {
        expect(result.manufactureDate.year).toBe(2019);
        expect(result.approximateAge?.years).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBe('high');
        expect(result.formatUsed.id).toBe('f1');
      }
    });

    it('returns true for a successful partial decode (null year)', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData({ year: null }) })],
      });
      const result = decode('test', 'ABC12345');
      expect(isSuccessResult(result)).toBe(true);

      if (isSuccessResult(result)) {
        expect(result.manufactureDate.year).toBe(null);
        expect(result.approximateAge).toBe(null);
      }
    });

    it('returns false for a failed decode', () => {
      const result = decode('nonexistent', 'ABC12345');
      expect(isSuccessResult(result)).toBe(false);
    });
  });

  describe('isAmbiguousResult', () => {
    it('returns true for an ambiguous decode', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [
          makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData({ year: 2019 }) }),
          makeFormat({ id: 'f2', matches: () => true, decode: () => makeDecodedData({ year: 2010 }) }),
        ],
      });
      const result = decode('test', 'ABC12345');
      expect(isAmbiguousResult(result)).toBe(true);
    });

    it('returns false for a successful decode', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData() })],
      });
      const result = decode('test', 'ABC12345');
      expect(isAmbiguousResult(result)).toBe(false);
    });
  });

  describe('isFailedResult', () => {
    it('returns true for invalid-input', () => {
      const result = decode('test', '');
      expect(isFailedResult(result)).toBe(true);
    });

    it('returns true for unsupported manufacturer', () => {
      const result = decode('nonexistent', 'ABC12345');
      expect(isFailedResult(result)).toBe(true);
    });

    it('returns false for success', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData() })],
      });
      const result = decode('test', 'ABC12345');
      expect(isFailedResult(result)).toBe(false);
    });
  });

  describe('hasDateInfo', () => {
    it('returns true when manufactureDate is populated', () => {
      registerManufacturer({
        id: 'test', name: 'Test',
        formats: [makeFormat({ id: 'f1', matches: () => true, decode: () => makeDecodedData() })],
      });
      const result = decode('test', 'ABC12345');
      expect(hasDateInfo(result)).toBe(true);
    });

    it('returns false when manufactureDate is null', () => {
      const result = decode('nonexistent', 'ABC12345');
      expect(hasDateInfo(result)).toBe(false);
    });
  });
});
