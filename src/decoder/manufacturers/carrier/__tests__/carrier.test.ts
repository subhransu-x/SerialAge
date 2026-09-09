/**
 * Carrier serial number decoder tests.
 *
 * Tests the Carrier format rules against the golden dataset from
 * claude_handoff.md and carrier_specification.md.
 *
 * Test categories:
 * A. Verified real-world serials
 * B. Synthetic structural/boundary tests
 * C. Invalid inputs
 * D. Unsupported legacy formats
 * E. Ambiguous / structural edge cases
 * F. Edge case / boundary tests
 * G. Normalization tests
 * H. Adversarial / threat tests
 * I. Pipeline architectural fix tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../../engine/registry';
import type { FormatRule, ManufacturerDefinition } from '../../../types';
import {
  CARRIER_VERIFIED_FIXTURES,
  CARRIER_SYNTHETIC_FIXTURES,
  CARRIER_UNSUPPORTED_FIXTURES,
  CARRIER_AMBIGUOUS_FIXTURES,
  CARRIER_EDGE_FIXTURES,
  CARRIER_NORMALIZATION_FIXTURES,
  CARRIER_ADVERSARIAL_FIXTURES,
} from './fixtures';
import { formats } from '../formats';

// Fixed reference date for deterministic age calculations
const REFERENCE_DATE = new Date(2026, 7, 23); // August 23, 2026

/**
 * Helper to register the Carrier manufacturer for tests.
 * Uses the real Carrier format rules.
 */
function registerCarrier(): void {
  const definition: ManufacturerDefinition = {
    id: 'carrier',
    name: 'Carrier',
    formats: [...formats],
  };
  registerManufacturer(definition);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Carrier Decoder', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerCarrier();
  });

  // -----------------------------------------------------------------------
  // A. Verified Real-World Fixtures
  // -----------------------------------------------------------------------
  describe('verified real-world serials', () => {
    for (const fixture of CARRIER_VERIFIED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);

        if (fixture.expectedMonth !== null) {
          expect(result.manufactureDate?.month).toBe(fixture.expectedMonth);
        }

        expect(result.confidence).toBe(fixture.expectedConfidence);
        expect(result.productType).toBe(fixture.expectedProductType);

        // Verify source metadata is present
        expect(result.sources.length).toBeGreaterThan(0);
        expect(result.explanation).toBeTruthy();
      });
    }
  });

  // -----------------------------------------------------------------------
  // B. Synthetic Structural Fixtures
  // -----------------------------------------------------------------------
  describe('synthetic structural/boundary', () => {
    for (const fixture of CARRIER_SYNTHETIC_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);

        if (fixture.expectedMonth !== null) {
          expect(result.manufactureDate?.month).toBe(fixture.expectedMonth);
        }

        expect(result.confidence).toBe(fixture.expectedConfidence);
      });
    }

    it('C-WWYY-S1 triggers transitional era warning for 1985', () => {
      const result = decode('carrier', '0185A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.warnings.some(w =>
        w.includes('Transitional era')
      )).toBe(true);
    });

    it('C-YYMM-S1 triggers YYMM era warning', () => {
      const result = decode('carrier', '800100001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.warnings.some(w =>
        w.includes('1980s')
      )).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // C. Invalid Input Fixtures
  // -----------------------------------------------------------------------
  describe('invalid inputs', () => {
    it('C-INV-01: empty string', () => {
      const result = decode('carrier', '');
      expect(result.status).toBe('invalid-input');
      expect(result.manufactureDate).toBeNull();
      expect(result.confidence).toBeNull();
    });

    it('C-INV-02: whitespace only', () => {
      const result = decode('carrier', '   ');
      expect(result.status).toBe('invalid-input');
    });

    it('C-INV-03: too short (ABC123 = 6 chars, above min but no format match)', () => {
      // ABC123 is 6 characters, which passes the MIN_SERIAL_LENGTH check (3)
      // but does not match any Carrier format
      const result = decode('carrier', 'ABC123');
      // 6 chars >= 3 min, so passes validation. But no Carrier format matches 6-char input.
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // D. Unsupported Legacy Format Fixtures
  // -----------------------------------------------------------------------
  describe('unsupported legacy formats', () => {
    for (const fixture of CARRIER_UNSUPPORTED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe('unsupported');
        expect(result.manufactureDate).toBeNull();
        expect(result.confidence).toBeNull();
      });
    }

    it('C-UNS-01 (MOVED): Style 4 (A167890) now decodes as success (Style 4 implemented)', () => {
      const result = decode('carrier', 'A167890', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style4-unambiguous');
      expect(result.manufactureDate?.year).toBe(1971);
      expect(result.manufactureDate?.month).toBe(1);
    });

    it('C-UNS-02 (MOVED): Style 3 (W4D14008) now decodes as success (Style 3 implemented)', () => {
      const result = decode('carrier', 'W4D14008', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-us');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.month).toBe(9);
    });

    it('C-UNS-03: Week 53 serial does not decode as WWYY', () => {
      const result = decode('carrier', '5320A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      // Must not produce a manufacture date
      expect(result.manufactureDate).toBeNull();
    });

    it('C-UNS-04: Month 13 serial does not decode as YYMM', () => {
      const result = decode('carrier', '831300001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // E. Ambiguous / Structural Edge Case Fixtures
  // -----------------------------------------------------------------------
  describe('ambiguous and edge cases', () => {
    for (const fixture of CARRIER_AMBIGUOUS_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.manufactureDate).toBeNull();
      });
    }
  });

  // -----------------------------------------------------------------------
  // F. Edge Case / Boundary Fixtures
  // -----------------------------------------------------------------------
  describe('boundary cases', () => {
    for (const fixture of CARRIER_EDGE_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);

        if (fixture.expectedYear !== null) {
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        } else {
          expect(result.manufactureDate).toBeNull();
        }
      });
    }

    it('C-EDGE-02: Y2K transition resolves YY=00 to 2000', () => {
      const result = decode('carrier', '0100A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2000);
    });

    it('C-EDGE-03: Week 00 is invalid', () => {
      const result = decode('carrier', '0000A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // G. Normalization Fixtures
  // -----------------------------------------------------------------------
  describe('normalization', () => {
    for (const fixture of CARRIER_NORMALIZATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
      });
    }

    it('C-NORM-01: preserves original input in result', () => {
      const result = decode('carrier', '4006a17330', { referenceDate: REFERENCE_DATE });
      expect(result.input.original).toBe('4006a17330');
      expect(result.input.normalized).toBe('4006A17330');
    });

    it('C-NORM-02: preserves original whitespace in result', () => {
      const result = decode('carrier', '  4006A17330  ', { referenceDate: REFERENCE_DATE });
      expect(result.input.original).toBe('  4006A17330  ');
      expect(result.input.normalized).toBe('4006A17330');
    });
  });

  // -----------------------------------------------------------------------
  // H. Adversarial / Threat Fixtures
  // -----------------------------------------------------------------------
  describe('adversarial threats', () => {
    for (const fixture of CARRIER_ADVERSARIAL_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('carrier', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);

        if (fixture.expectedYear !== null) {
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        } else {
          expect(result.manufactureDate).toBeNull();
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // I. Source Metadata Preservation
  // -----------------------------------------------------------------------
  describe('source metadata', () => {
    it('WWYY format includes source references', () => {
      const result = decode('carrier', '4006A17330', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.sources.length).toBeGreaterThanOrEqual(2);
      expect(result.sources.some(s => s.name.includes('Building Intelligence Center'))).toBe(true);
      expect(result.sources.some(s => s.name.includes('InspectorHandbook'))).toBe(true);
    });

    it('YYMM format includes source references', () => {
      const result = decode('carrier', '850304091', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.sources.length).toBeGreaterThanOrEqual(2);
      expect(result.sources.some(s => s.name.includes('Building Intelligence Center'))).toBe(true);
    });

    it('WWYY format includes correct explanation', () => {
      const result = decode('carrier', '4006A17330', { referenceDate: REFERENCE_DATE });
      expect(result.explanation).toContain('week of manufacture');
      expect(result.explanation).toContain('year of manufacture');
      expect(result.explanation).toContain('plant code');
    });

    it('YYMM format includes correct explanation', () => {
      const result = decode('carrier', '850304091', { referenceDate: REFERENCE_DATE });
      expect(result.explanation).toContain('year of manufacture');
      expect(result.explanation).toContain('month of manufacture');
    });

    it('Style 4 format (A167890) includes source references', () => {
      const result = decode('carrier', 'A167890', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources.some(s => s.name.includes('Building Intelligence Center'))).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // J. Pipeline Architectural Fix — Explicit Error Handling
  // -----------------------------------------------------------------------
  describe('pipeline explicit error handling', () => {
    it('explicit unsupported error does NOT override a valid decode from another rule', () => {
      // Register a test manufacturer with both a valid rule and an unsupported rule
      _resetRegistryForTesting();

      const testFormats: FormatRule[] = [
        {
          id: 'test-valid',
          name: 'Test Valid',
          description: 'Always matches and decodes',
          yearRange: [2000, null],
          productTypes: [],
          sources: [{
            name: 'Test',
            url: null,
            dateReviewed: '2026-01-01',
            notes: 'Test',
            confidence: 'verified',
          }],
          matches: () => true,
          decode: () => ({
            year: 2020,
            month: 6,
            week: null,
            day: null,
            productType: 'unknown' as const,
            explanation: 'Test decode',
            warnings: [],
            metadata: {},
          }),
        },
        {
          id: 'test-unsupported',
          name: 'Test Unsupported',
          description: 'Always matches but returns unsupported',
          yearRange: [1970, 1980],
          productTypes: [],
          sources: [{
            name: 'Test',
            url: null,
            dateReviewed: '2026-01-01',
            notes: 'Test',
            confidence: 'verified',
          }],
          matches: () => true,
          decode: () => ({
            error: 'unsupported' as const,
            explanation: 'Test unsupported explanation',
          }),
        },
      ];

      const definition: ManufacturerDefinition = {
        id: 'testbrand',
        name: 'Test Brand',
        formats: testFormats,
      };
      registerManufacturer(definition);

      const result = decode('testbrand', 'TESTSERIAL', { referenceDate: REFERENCE_DATE });
      // Valid decode must win over explicit unsupported
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2020);
    });

    it('explicit error is used when no valid decode exists', () => {
      _resetRegistryForTesting();

      const testFormats: FormatRule[] = [
        {
          id: 'test-unsupported',
          name: 'Test Unsupported',
          description: 'Always matches but returns unsupported',
          yearRange: [1970, 1980],
          productTypes: [],
          sources: [{
            name: 'Test Source',
            url: null,
            dateReviewed: '2026-01-01',
            notes: 'Test',
            confidence: 'verified',
          }],
          matches: () => true,
          decode: () => ({
            error: 'unsupported' as const,
            explanation: 'This format is not supported.',
          }),
        },
      ];

      const definition: ManufacturerDefinition = {
        id: 'testbrand',
        name: 'Test Brand',
        formats: testFormats,
      };
      registerManufacturer(definition);

      const result = decode('testbrand', 'TESTSERIAL', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toBe('This format is not supported.');
      expect(result.sources.length).toBeGreaterThan(0);
    });

    it('insufficient-info error is returned correctly', () => {
      _resetRegistryForTesting();

      const testFormats: FormatRule[] = [
        {
          id: 'test-insufficient',
          name: 'Test Insufficient',
          description: 'Needs more context',
          yearRange: [1980, 1984],
          productTypes: [],
          sources: [{
            name: 'Test Source',
            url: null,
            dateReviewed: '2026-01-01',
            notes: 'Test',
            confidence: 'verified',
          }],
          matches: () => true,
          decode: () => ({
            error: 'insufficient-info' as const,
            explanation: 'Country of manufacture is required to decode this format.',
          }),
        },
      ];

      const definition: ManufacturerDefinition = {
        id: 'testbrand',
        name: 'Test Brand',
        formats: testFormats,
      };
      registerManufacturer(definition);

      const result = decode('testbrand', 'TESTSERIAL', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('insufficient-info');
      expect(result.explanation).toContain('Country of manufacture');
    });
  });

  // -----------------------------------------------------------------------
  // K. Week display format
  // -----------------------------------------------------------------------
  describe('date display', () => {
    it('WWYY displays as "Week WW, YYYY"', () => {
      const result = decode('carrier', '4006A17330', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.display).toBe('Week 40, 2006');
    });

    it('WWYY week 1 displays correctly', () => {
      const result = decode('carrier', '0100A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.display).toBe('Week 1, 2000');
    });

    it('YYMM displays as "Month YYYY"', () => {
      const result = decode('carrier', '850304091', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.display).toBe('March 1985');
    });
  });

  // -----------------------------------------------------------------------
  // L. WWYY-specific validation
  // -----------------------------------------------------------------------
  describe('WWYY format validation', () => {
    it('week 52 is valid (maximum)', () => {
      const result = decode('carrier', '5224Z99999', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(52);
    });

    it('week 01 is valid (minimum)', () => {
      const result = decode('carrier', '0124A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(1);
    });

    it('week 00 is invalid', () => {
      const result = decode('carrier', '0024A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('week 53 is invalid', () => {
      const result = decode('carrier', '5324A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('year 84 → 1984 (threshold=80: 84 >= 80 → 1900+84=1984)', () => {
      // With WWYY_CENTURY_THRESHOLD=80: YY=84 >= 80 → 1900+84 = 1984 (valid past year)
      const result = decode('carrier', '0184A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1984);
    });

    it('year 85 → 1985 (at threshold)', () => {
      const result = decode('carrier', '0185A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1985);
    });

    it('non-letter at position 5 does not match WWYY', () => {
      // 10 chars but position 5 is a digit
      const result = decode('carrier', '4006117330');
      // This is 10 all-digit chars — doesn't match WWYY (needs letter at pos 5)
      // Also doesn't match YYMM (needs 9 chars)
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // M. YYMM-specific validation
  // -----------------------------------------------------------------------
  describe('YYMM format validation', () => {
    it('year 79 is outside valid range (too early)', () => {
      const result = decode('carrier', '790100001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('year 90 is outside valid range (too late)', () => {
      const result = decode('carrier', '900100001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('month 00 is invalid', () => {
      const result = decode('carrier', '830000001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('month 12 is valid (maximum)', () => {
      const result = decode('carrier', '831200001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.month).toBe(12);
    });

    it('YYMM serial with letter does not match (must be all digits)', () => {
      // 9 chars but contains a letter
      const result = decode('carrier', '8503A4091', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // N. Structural discrimination (WWYY vs YYMM cannot conflict)
  // -----------------------------------------------------------------------
  describe('format structural discrimination', () => {
    it('10-char with letter at position 5 matches WWYY, not YYMM', () => {
      const result = decode('carrier', '0185A00001', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
    });

    it('9-char all-digits matches YYMM, not WWYY', () => {
      const result = decode('carrier', '850304091', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-yymm-legacy');
    });

    it('8-char input does not match either production format', () => {
      // 8 chars, not 9 or 10
      const result = decode('carrier', '85030409', { referenceDate: REFERENCE_DATE });
      // May match unsupported legacy or fall through
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // O. WWYY 1980–1984 era (century threshold fix)
  // -----------------------------------------------------------------------
  describe('WWYY 1980–1984 era (fixed century threshold)', () => {
    it('0180A12345 → Week 1, 1980 (not 2080)', () => {
      const result = decode('carrier', '0180A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
      expect(result.manufactureDate?.year).toBe(1980);
      expect(result.manufactureDate?.week).toBe(1);
    });

    it('0280A12345 → Week 2, 1980', () => {
      const result = decode('carrier', '0280A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1980);
      expect(result.manufactureDate?.week).toBe(2);
    });

    it('0381A12345 → Week 3, 1981', () => {
      const result = decode('carrier', '0381A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1981);
    });

    it('5284Z99999 → Week 52, 1984', () => {
      const result = decode('carrier', '5284Z99999', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.week).toBe(52);
    });

    it('1980–1984 WWYY serials trigger transitional era warning', () => {
      const result = decode('carrier', '0180A12345', { referenceDate: REFERENCE_DATE });
      expect(result.warnings.some(w => w.includes('Transitional era'))).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // P. Style 3 (1980–1984)
  // -----------------------------------------------------------------------
  describe('Style 3 (1980–1984)', () => {
    it('W4D14008 → September 1984 (US format, BIC verified)', () => {
      const result = decode('carrier', 'W4D14008', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-us');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.month).toBe(9);
    });

    it('4WD14008 → September 1984 (Canadian format, BIC verified)', () => {
      const result = decode('carrier', '4WD14008', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-ca');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.month).toBe(9);
    });

    it('M0A12345 → January 1980 (earliest Style 3)', () => {
      const result = decode('carrier', 'M0A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-us');
      expect(result.manufactureDate?.year).toBe(1980);
      expect(result.manufactureDate?.month).toBe(1);
    });

    it('Z4A12345 → December 1984 (latest Style 3)', () => {
      const result = decode('carrier', 'Z4A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-us');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.month).toBe(12);
    });

    it('Style 3 with year digit 5 is unsupported (out of range)', () => {
      const result = decode('carrier', 'W5D14008', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Style 3 letter O is not a valid month letter', () => {
      // O is skipped — serial starting with O should not match Style 3
      const result = decode('carrier', 'O4A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Style 3 letter U is not a valid month letter', () => {
      // U is skipped — serial starting with U should not match Style 3
      const result = decode('carrier', 'U4A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Style 3 Y=November', () => {
      const result = decode('carrier', 'Y2A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.month).toBe(11);
      expect(result.manufactureDate?.year).toBe(1982);
    });

    it('Style 3 includes source references', () => {
      const result = decode('carrier', 'W4D14008', { referenceDate: REFERENCE_DATE });
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources.some(s => s.name.includes('Building Intelligence Center'))).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Q. Style 4 (1969–1979)
  // -----------------------------------------------------------------------
  describe('Style 4 (1969–1979)', () => {
    it('A167890 → January 1971 (BIC verified, unambiguous)', () => {
      const result = decode('carrier', 'A167890', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style4-unambiguous');
      expect(result.manufactureDate?.year).toBe(1971);
      expect(result.manufactureDate?.month).toBe(1);
    });

    it('L812345 → December 1978 (year digit 8)', () => {
      const result = decode('carrier', 'L812345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style4-unambiguous');
      expect(result.manufactureDate?.year).toBe(1978);
      expect(result.manufactureDate?.month).toBe(12);
    });

    it('B012345 → February 1970 (year digit 0)', () => {
      const result = decode('carrier', 'B012345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style4-unambiguous');
      expect(result.manufactureDate?.year).toBe(1970);
      expect(result.manufactureDate?.month).toBe(2);
    });

    it('A912345 → ambiguous (1969 or 1979) for year digit 9', () => {
      const result = decode('carrier', 'A912345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('ambiguous');
      expect(result.candidates).toHaveLength(2);
      const years = result.candidates.map(c => c.manufactureDate.year).sort();
      expect(years).toEqual([1969, 1979]);
    });

    it('L912345 → ambiguous (December 1969 or December 1979)', () => {
      const result = decode('carrier', 'L912345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('ambiguous');
      const months = result.candidates.map(c => c.manufactureDate.month);
      expect(months.every(m => m === 12)).toBe(true);
    });

    it('Style 4 ambiguous result has warning about 1969/1979', () => {
      const result = decode('carrier', 'A912345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('ambiguous');
      // Warning should appear in at least one candidate
      const allWarnings = result.candidates.flatMap(c => c.warnings);
      expect(allWarnings.some(w => w.includes('1969') && w.includes('1979'))).toBe(true);
    });

    it('Style 4 letter M is not valid (M belongs to Style 3)', () => {
      // M = Style 3 month code, must NOT be decoded as Style 4
      // A 7-char serial starting with M would not match STYLE_4_PATTERN (A-L only)
      const result = decode('carrier', 'M167890', { referenceDate: REFERENCE_DATE });
      // M7... as 7 chars: M is outside A-L range so Style 4 rejects, Style 3 needs 8 chars → unsupported
      expect(result.status).toBe('unsupported');
    });

    it('Style 4 includes source references', () => {
      const result = decode('carrier', 'A167890', { referenceDate: REFERENCE_DATE });
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources.some(s => s.name.includes('Building Intelligence Center'))).toBe(true);
    });
  });
});
