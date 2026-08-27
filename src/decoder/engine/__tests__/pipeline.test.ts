import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../engine/registry';
import type {
  ManufacturerDefinition,
  FormatRule,
  NormalizedInput,
  DecodedData,
} from '../../types';

// ---------------------------------------------------------------------------
// Helpers — build synthetic manufacturers for testing the pipeline logic.
// These are NOT real decoder rules. They exist solely to exercise the
// pipeline's orchestration (matching, disambiguation, error handling).
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
    explanation: 'Test decode explanation',
    warnings: [],
    metadata: {},
    ...overrides,
  };
}

function registerTestManufacturer(
  id: string,
  name: string,
  formats: FormatRule[],
): void {
  const def: ManufacturerDefinition = { id, name, formats };
  registerManufacturer(def);
}

// Fixed reference date for deterministic age calculations
const REFERENCE_DATE = new Date(2025, 5, 15); // June 15, 2025

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Decode Pipeline', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
  });

  // -----------------------------------------------------------------------
  // Invalid input
  // -----------------------------------------------------------------------
  describe('invalid input', () => {
    it('returns invalid-input for empty string', () => {
      const result = decode('carrier', '');
      expect(result.status).toBe('invalid-input');
      expect(result.manufactureDate).toBeNull();
      expect(result.approximateAge).toBeNull();
    });

    it('returns invalid-input for whitespace-only string', () => {
      const result = decode('carrier', '   ');
      expect(result.status).toBe('invalid-input');
    });

    it('returns invalid-input for too-short string', () => {
      const result = decode('carrier', 'AB');
      expect(result.status).toBe('invalid-input');
    });

    it('preserves original input in result', () => {
      const result = decode('carrier', '');
      expect(result.input.original).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // Unregistered manufacturer
  // -----------------------------------------------------------------------
  describe('unregistered manufacturer', () => {
    it('returns unsupported for unknown manufacturer ID', () => {
      const result = decode('nonexistent', 'ABC12345');
      expect(result.status).toBe('unsupported');
      expect(result.manufacturer.id).toBe('nonexistent');
    });
  });

  // -----------------------------------------------------------------------
  // No format match
  // -----------------------------------------------------------------------
  describe('no format match', () => {
    it('returns unsupported when no format matches the serial', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => false, // never matches
        }),
      ]);

      const result = decode('testbrand', 'XYZ99999');
      expect(result.status).toBe('unsupported');
      expect(result.manufacturer.name).toBe('Test Brand');
      expect(result.candidates).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // Single successful match
  // -----------------------------------------------------------------------
  describe('single successful match', () => {
    it('returns success with decoded data', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 3 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2019);
      expect(result.manufactureDate?.month).toBe(3);
      expect(result.confidence).toBe('high');
      expect(result.formatUsed?.id).toBe('format-a');
      expect(result.productType).toBe('air-conditioner');
      expect(result.candidates).toEqual([]);
    });

    it('calculates approximate age correctly', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 3 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.approximateAge).not.toBeNull();
      expect(result.approximateAge!.years).toBe(6);
      expect(result.approximateAge!.months).toBe(3);
    });

    it('includes source references from the matching format', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          sources: [
            {
              name: 'Real Source',
              url: 'https://example.com',
              dateReviewed: '2025-01-01',
              notes: 'Test',
              confidence: 'verified',
            },
          ],
          matches: () => true,
          decode: () => makeDecodedData(),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].name).toBe('Real Source');
    });

    it('preserves original and normalized input', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData(),
        }),
      ]);

      const result = decode('testbrand', '  abc-123  ');
      expect(result.input.original).toBe('  abc-123  ');
      expect(result.input.normalized).toBe('ABC-123');
    });

    it('includes warnings from decoded data', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () =>
            makeDecodedData({ warnings: ['Year may be off by 1'] }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.warnings).toContain('Year may be off by 1');
    });
  });

  // -----------------------------------------------------------------------
  // Match but decode fails
  // -----------------------------------------------------------------------
  describe('match but decode fails', () => {
    it('returns unsupported when format matches but decode returns null', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => null, // matches but fails to decode
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // Multiple matches that agree
  // -----------------------------------------------------------------------
  describe('multiple agreeing matches', () => {
    it('returns success when multiple formats decode to the same date', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 6 }),
        }),
        makeFormat({
          id: 'format-b',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 6 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2019);
      expect(result.manufactureDate?.month).toBe(6);
    });

    it('adds a warning noting multiple formats matched', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 6 }),
        }),
        makeFormat({
          id: 'format-b',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 6 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.warnings.some((w) => w.includes('format rules matched'))).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Ambiguous results
  // -----------------------------------------------------------------------
  describe('ambiguous results', () => {
    it('returns ambiguous when formats decode to different dates', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 3 }),
        }),
        makeFormat({
          id: 'format-b',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2015, month: 7 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('ambiguous');
      expect(result.manufactureDate).toBeNull();
      expect(result.approximateAge).toBeNull();
      expect(result.confidence).toBeNull();
    });

    it('populates candidates with all possible decodes', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 3 }),
        }),
        makeFormat({
          id: 'format-b',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2015, month: 7 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates[0].formatUsed.id).toBe('format-a');
      expect(result.candidates[0].manufactureDate.year).toBe(2019);
      expect(result.candidates[1].formatUsed.id).toBe('format-b');
      expect(result.candidates[1].manufactureDate.year).toBe(2015);
    });

    it('each candidate has its own age calculation', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 1 }),
        }),
        makeFormat({
          id: 'format-b',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2010, month: 1 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345', { referenceDate: REFERENCE_DATE });
      expect(result.candidates[0].approximateAge.years).toBe(6);
      expect(result.candidates[1].approximateAge.years).toBe(15);
    });
  });

  // -----------------------------------------------------------------------
  // Input normalization pass-through
  // -----------------------------------------------------------------------
  describe('input normalization', () => {
    it('passes NormalizedInput to format matches and decode functions', () => {
      let receivedInput: NormalizedInput | null = null;

      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'format-a',
          matches: (input) => {
            receivedInput = input;
            return true;
          },
          decode: () => makeDecodedData(),
        }),
      ]);

      decode('testbrand', '  abc-123  ');
      expect(receivedInput).not.toBeNull();
      expect(receivedInput!.original).toBe('  abc-123  ');
      expect(receivedInput!.normalized).toBe('ABC-123');
      expect(receivedInput!.withoutHyphens).toBe('ABC123');
      expect(receivedInput!.withoutSpaces).toBe('ABC-123');
    });
  });

  // -----------------------------------------------------------------------
  // Mixed match/no-match scenarios
  // -----------------------------------------------------------------------
  describe('mixed match scenarios', () => {
    it('ignores formats that do not match', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'no-match',
          matches: () => false,
          decode: () => makeDecodedData({ year: 9999 }), // should never be called
        }),
        makeFormat({
          id: 'yes-match',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 5 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2020);
      expect(result.formatUsed?.id).toBe('yes-match');
    });

    it('ignores formats that match but fail to decode', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'match-but-fail',
          matches: () => true,
          decode: () => null,
        }),
        makeFormat({
          id: 'match-and-succeed',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 5 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('match-and-succeed');
    });
  });

  // -----------------------------------------------------------------------
  // Date display precision
  // -----------------------------------------------------------------------
  describe('date display precision', () => {
    it('displays year + month when both are available', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'fmt',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: 3, week: null, day: null }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.manufactureDate?.display).toBe('March 2019');
    });

    it('displays year only when month is not available', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'fmt',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: null, week: null, day: null }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.manufactureDate?.display).toBe('2019');
    });

    it('displays week + year when week is available but month is not', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'fmt',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2019, month: null, week: 31, day: null }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.manufactureDate?.display).toBe('Week 31, 2019');
    });
  });

  // -----------------------------------------------------------------------
  // Impossible date rejection
  // -----------------------------------------------------------------------
  describe('impossible date rejection', () => {
    it('rejects a format that decodes to month 13', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'bad-month',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 13 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('unsupported');
    });

    it('rejects a format that decodes to February 30', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'bad-day',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 2, day: 30 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('unsupported');
    });

    it('rejects a format that decodes to year 1800', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'bad-year',
          matches: () => true,
          decode: () => makeDecodedData({ year: 1800 }),
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('unsupported');
    });

    it('still returns success for a valid format when an invalid one is also present', () => {
      registerTestManufacturer('testbrand', 'Test Brand', [
        makeFormat({
          id: 'bad-format',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 13 }), // impossible
        }),
        makeFormat({
          id: 'good-format',
          matches: () => true,
          decode: () => makeDecodedData({ year: 2020, month: 6 }), // valid
        }),
      ]);

      const result = decode('testbrand', 'ABC12345');
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('good-format');
    });
  });
});
