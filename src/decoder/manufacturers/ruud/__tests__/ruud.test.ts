/**
 * Ruud serial number decoder — comprehensive test suite.
 *
 * Covers all golden fixtures from rheem_ruud_implementation_contract.md Section 4,
 * plus boundary cases, normalization, adversarial inputs (including the documented
 * Format 2 false-positive), source metadata, and manufacturer isolation.
 *
 * Test categories:
 *   A. Verified contract golden fixtures (Format 1 and Format 2)
 *   B. Invalid / unsupported inputs
 *   C. Boundary cases (synthetic)
 *   D. Normalization (case insensitivity, whitespace)
 *   E. Adversarial inputs (Format 2 false-positive analysis)
 *   F. Manufacturer isolation (Trane, Carrier, Goodman, Lennox cross-tests)
 *   G. Source metadata and confidence
 *   H. Format rule structure tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../../engine/registry';
import type { ManufacturerDefinition } from '../../../types';
import {
  RUUD_VERIFIED_FIXTURES,
  RUUD_INVALID_FIXTURES,
  RUUD_BOUNDARY_FIXTURES,
  RUUD_NORMALIZATION_FIXTURES,
  RUUD_ADVERSARIAL_FIXTURES,
  RUUD_ISOLATION_FIXTURES,
} from './fixtures';
import { formats } from '../formats';

// Fixed reference date for deterministic age calculations
const REFERENCE_DATE = new Date(2026, 7, 27); // August 27, 2026

/**
 * Helper to register the Ruud manufacturer for tests.
 */
function registerRuud(): void {
  const definition: ManufacturerDefinition = {
    id: 'ruud',
    name: 'Ruud',
    formats: [...formats],
  };
  registerManufacturer(definition);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Ruud Decoder', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerRuud();
  });

  // -----------------------------------------------------------------------
  // A. Verified Contract Golden Fixtures
  // -----------------------------------------------------------------------
  describe('A. Verified contract golden fixtures', () => {
    for (const fixture of RUUD_VERIFIED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        expect(result.manufactureDate?.month).toBe(fixture.expectedMonth ?? null);
        expect(result.confidence).toBe(fixture.expectedConfidence);
        expect(result.productType).toBe(fixture.expectedProductType);
      });
    }

    // Explicit week checks for golden fixtures
    it('RU-FMT1-R1: W421724596 decodes to week 42', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(42);
    });

    it('RU-FMT1-R2: F039212345 decodes to week 3', () => {
      const result = decode('ruud', 'F039212345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(3);
    });

    it('RU-FMT2-R1: CB5D302F099903346 decodes to week 9', () => {
      const result = decode('ruud', 'CB5D302F099903346', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(9);
    });

    it('RU-FMT2-R2: 7351 M2806 16735 decodes to week 28', () => {
      const result = decode('ruud', '7351 M2806 16735', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(28);
    });

    it('RU-FMT2-R3: AB6D307-M-0999 decodes to week 9', () => {
      const result = decode('ruud', 'AB6D307-M-0999', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(9);
    });
  });

  // -----------------------------------------------------------------------
  // B. Invalid / Unsupported Inputs
  // -----------------------------------------------------------------------
  describe('B. Invalid and unsupported inputs', () => {
    for (const fixture of RUUD_INVALID_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        if (fixture.expectedStatus !== 'invalid-input') {
          expect(result.manufactureDate).toBeNull();
          expect(result.approximateAge).toBeNull();
          expect(result.confidence).toBeNull();
        }
      });
    }

    it('all-numeric 10-digit (water heater) must not decode as Ruud HVAC', () => {
      const result = decode('ruud', '1291123456', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // C. Boundary Cases
  // -----------------------------------------------------------------------
  describe('C. Boundary cases (synthetic)', () => {
    for (const fixture of RUUD_BOUNDARY_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        if (fixture.expectedStatus === 'success') {
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
          expect(result.manufactureDate?.month).toBeNull();
        } else {
          expect(result.manufactureDate).toBeNull();
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // D. Normalization
  // -----------------------------------------------------------------------
  describe('D. Normalization (case insensitivity and whitespace)', () => {
    for (const fixture of RUUD_NORMALIZATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        if (fixture.expectedStatus === 'success') {
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
          expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        }
      });
    }

    it('preserves original input in result before normalization', () => {
      const result = decode('ruud', '  W421724596  ', { referenceDate: REFERENCE_DATE });
      expect(result.input.original).toBe('  W421724596  ');
      expect(result.input.normalized).toBe('W421724596');
    });
  });

  // -----------------------------------------------------------------------
  // E. Adversarial Inputs (Format 2 false-positive analysis)
  // -----------------------------------------------------------------------
  describe('E. Adversarial inputs (Format 2 false-positive analysis)', () => {
    for (const fixture of RUUD_ADVERSARIAL_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
      });
    }

    it('[PHASE-8F] RANDOMSTRINGM280612345 — now correctly rejected (was a false positive)', () => {
      const result = decode('ruud', 'RANDOMSTRINGM280612345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
    });

    it('[PHASE-8F] WW421724596 (typo: extra W) — now correctly rejected', () => {
      const result = decode('ruud', 'WW421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
    });

    it('[PHASE-8F] MODELF039212345 (model-number prefix) — now correctly rejected', () => {
      const result = decode('ruud', 'MODELF039212345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('[PHASE-8F] 1234567F059900000 (all-digit prefix) — now correctly rejected', () => {
      const result = decode('ruud', '1234567F059900000', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('[PHASE-8F] SNF039212345 (2-char all-alpha prefix) — correctly rejected', () => {
      const result = decode('ruud', 'SNF039212345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Week 00 in embedded format (F00...) must fail week validation', () => {
      const result = decode('ruud', 'CB5D302F009903346', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Week 54 in embedded format must fail week validation', () => {
      const result = decode('ruud', 'CB5D302F549903346', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // F. Manufacturer Isolation
  // -----------------------------------------------------------------------
  describe('F. Manufacturer isolation (cross-manufacturer inputs)', () => {
    for (const fixture of RUUD_ISOLATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
      });
    }

    // Direct isolation against known serials from other manufacturers
    it('Carrier modern serial (4206A12345) must not decode under Ruud', () => {
      const result = decode('ruud', '4206A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Goodman serial (2104123456) must not decode under Ruud', () => {
      const result = decode('ruud', '2104123456', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Lennox serial (5806K12345) must not decode under Ruud', () => {
      const result = decode('ruud', '5806K12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Trane letter-9 (R1742DWBF) must not decode under Ruud (9 chars too short)', () => {
      const result = decode('ruud', 'R1742DWBF', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });

  // -----------------------------------------------------------------------
  // G. Source Metadata and Confidence
  // -----------------------------------------------------------------------
  describe('G. Source metadata and confidence', () => {
    it('ruud-standard-10 includes Building Intelligence Center source', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.sources.length).toBeGreaterThan(0);
      const hasBIC = result.sources.some((s) => s.name === 'Building Intelligence Center');
      expect(hasBIC).toBe(true);
    });

    it('ruud-embedded-plant includes Building Intelligence Center source', () => {
      const result = decode('ruud', 'CB5D302F099903346', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      const hasBIC = result.sources.some((s) => s.name === 'Building Intelligence Center');
      expect(hasBIC).toBe(true);
    });

    it('ruud-standard-10 BIC source has correct URL', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      const bicSource = result.sources.find((s) => s.name === 'Building Intelligence Center');
      expect(bicSource?.url).toBe('https://www.building-center.org/rheem-hvac-age/');
    });

    it('ruud-standard-10 confidence is high', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.confidence).toBe('high');
    });

    it('ruud-embedded-plant confidence is high', () => {
      const result = decode('ruud', 'CB5D302F099903346', { referenceDate: REFERENCE_DATE });
      expect(result.confidence).toBe('high');
    });
  });

  // -----------------------------------------------------------------------
  // H. Format Rule Structure Tests
  // -----------------------------------------------------------------------
  describe('H. Format rule structure', () => {
    it('ruud-standard-10 result has correct structure', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufacturer.id).toBe('ruud');
      expect(result.manufacturer.name).toBe('Ruud');
      expect(result.formatUsed?.id).toBe('ruud-standard-10');
      expect(result.manufactureDate?.year).toBe(2017);
      expect(result.manufactureDate?.week).toBe(42);
      expect(result.manufactureDate?.month).toBeNull();
      expect(result.manufactureDate?.day).toBeNull();
      expect(result.approximateAge).not.toBeNull();
      expect(result.productType).toBe('unknown');
      expect(result.sources).not.toHaveLength(0);
    });

    it('ruud-embedded-plant result has correct structure', () => {
      const result = decode('ruud', 'CB5D302F099903346', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('ruud-embedded-plant');
      expect(result.manufactureDate?.year).toBe(1999);
      expect(result.manufactureDate?.week).toBe(9);
      expect(result.manufactureDate?.month).toBeNull();
    });

    it('unsupported result has null date, age, confidence, and formatUsed', () => {
      const result = decode('ruud', 'XYZ123', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
      expect(result.approximateAge).toBeNull();
      expect(result.confidence).toBeNull();
      expect(result.formatUsed).toBeNull();
    });

    it('invalid-input result for empty string', () => {
      const result = decode('ruud', '', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('invalid-input');
    });

    it('formats array contains exactly 2 format rules', () => {
      expect(formats).toHaveLength(2);
      expect(formats[0].id).toBe('ruud-standard-10');
      expect(formats[1].id).toBe('ruud-embedded-plant');
    });

    it('ruud-standard-10 explanation mentions plant code and week', () => {
      const result = decode('ruud', 'W421724596', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.explanation).toContain('W');
      expect(result.explanation).toContain('42');
      expect(result.explanation).toContain('2017');
    });
  });
});
