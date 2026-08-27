/**
 * York serial number decoder — comprehensive test suite.
 *
 * Covers all golden fixtures from york_implementation_contract.md Section 10,
 * plus boundary cases, normalization, adversarial inputs, source metadata, and
 * manufacturer isolation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../../engine/registry';
import type { ManufacturerDefinition } from '../../../types';
import {
  YORK_VERIFIED_FIXTURES,
  YORK_INVALID_FIXTURES,
  YORK_NORMALIZATION_FIXTURES,
} from './fixtures';
import { formats } from '../formats';

const REFERENCE_DATE = new Date(2026, 7, 27); // August 27, 2026

function registerYork(): void {
  const definition: ManufacturerDefinition = {
    id: 'york',
    name: 'York',
    formats: [...formats],
  };
  registerManufacturer(definition);
}

describe('York Decoder', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerYork();
  });

  // -----------------------------------------------------------------------
  // A. Verified Contract Golden Fixtures
  // -----------------------------------------------------------------------
  describe('A. Verified contract golden fixtures', () => {
    for (const fixture of YORK_VERIFIED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('york', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        
        if (fixture.expectedStatus === 'ambiguous') {
          // For ambiguous, ensure we get multiple candidates
          expect(result.candidates.length).toBeGreaterThan(1);
          // And that candidate dates are extracted correctly
          const years = result.candidates.map((c) => c.manufactureDate.year);
          // E.g., WAKM011379 -> K -> 1980, 2001
          // XBFM220710 -> F -> 1976, 1997
          if (fixture.serialNumber === 'WAKM011379') {
            expect(years).toContain(1980);
            expect(years).toContain(2001);
            expect(result.candidates[0].manufactureDate.month).toBe(1);
          } else if (fixture.serialNumber === 'XBFM220710') {
            expect(years).toContain(1976);
            expect(years).toContain(1997);
            expect(result.candidates[0].manufactureDate.month).toBe(2);
          }
        } else {
          expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
          expect(result.manufactureDate?.month).toBe(fixture.expectedMonth ?? null);
          expect(result.confidence).toBe(fixture.expectedConfidence);
          expect(result.productType).toBe(fixture.expectedProductType);
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // B. Invalid / Unsupported Inputs
  // -----------------------------------------------------------------------
  describe('B. Invalid and unsupported inputs', () => {
    for (const fixture of YORK_INVALID_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('york', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
      });
    }
  });

  // -----------------------------------------------------------------------
  // C. Normalization & Whitespace
  // -----------------------------------------------------------------------
  describe('C. Normalization and whitespace', () => {
    for (const fixture of YORK_NORMALIZATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('york', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
      });
    }
  });

  // -----------------------------------------------------------------------
  // D. Format Rule Metadata and Structure
  // -----------------------------------------------------------------------
  describe('D. Format rule structure and metadata', () => {
    it('returns the correct source metadata for post-2004 format', () => {
      const result = decode('york', 'W1A5123456', { referenceDate: REFERENCE_DATE });
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources[0].name).toBe('Building Intelligence Center');
      expect(result.sources[0].confidence).toBe('verified');
    });

    it('preserves the original and normalized input', () => {
      const result = decode('york', ' w1a5123456 ', { referenceDate: REFERENCE_DATE });
      expect(result.input.original).toBe(' w1a5123456 ');
      expect(result.input.normalized).toBe('W1A5123456');
    });
  });

  // -----------------------------------------------------------------------
  // E. Adversarial Inputs
  // -----------------------------------------------------------------------
  describe('E. Adversarial inputs', () => {
    it('rejects random alphanumeric strings', () => {
      const result = decode('york', 'RANDOM123456', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported'); // Fails fast
    });

    it('rejects Carrier serial numbers', () => {
      const result = decode('york', '4206A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('rejects Goodman serial numbers', () => {
      const result = decode('york', '1206123456', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });
});
