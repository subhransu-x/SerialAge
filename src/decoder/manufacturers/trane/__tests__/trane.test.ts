/**
 * Trane serial number decoder — comprehensive test suite.
 *
 * Covers all golden fixtures from trane_implementation_contract.md Sections 8 & 9,
 * plus boundary cases, normalization, structure, source metadata, and isolation.
 *
 * Test categories:
 *   A. Verified real-world serials (contract Section 8 golden dataset)
 *   B. Adversarial inputs (contract Section 9)
 *   C. Boundary cases (synthetic)
 *   D. Unsupported / legacy formats
 *   E. Normalization (case insensitivity, whitespace)
 *   F. Manufacturer isolation (incompatible inputs)
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
  TRANE_VERIFIED_FIXTURES,
  TRANE_ADVERSARIAL_FIXTURES,
  TRANE_BOUNDARY_FIXTURES,
  TRANE_UNSUPPORTED_FIXTURES,
  TRANE_NORMALIZATION_FIXTURES,
  TRANE_ISOLATION_FIXTURES,
} from './fixtures';
import { formats } from '../formats';

// Fixed reference date for deterministic age calculations
const REFERENCE_DATE = new Date(2026, 7, 27); // August 27, 2026

/**
 * Helper to register the Trane manufacturer for tests.
 * Uses the real Trane format rules.
 */
function registerTrane(): void {
  const definition: ManufacturerDefinition = {
    id: 'trane',
    name: 'Trane',
    formats: [...formats],
  };
  registerManufacturer(definition);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Trane Decoder', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerTrane();
  });

  // -----------------------------------------------------------------------
  // A. Verified Real-World Fixtures (Contract Section 8 — Golden Dataset)
  // -----------------------------------------------------------------------
  describe('A. Verified real-world serials (contract golden dataset)', () => {
    for (const fixture of TRANE_VERIFIED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });

        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        expect(result.manufactureDate?.month).toBe(fixture.expectedMonth ?? null);
        expect(result.confidence).toBe(fixture.expectedConfidence);
        expect(result.productType).toBe(fixture.expectedProductType);
      });
    }
  });

  // -----------------------------------------------------------------------
  // B. Adversarial Inputs (Contract Section 9)
  // -----------------------------------------------------------------------
  describe('B. Adversarial inputs (contract Section 9)', () => {
    for (const fixture of TRANE_ADVERSARIAL_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        // Adversarial inputs must never have a manufacture date
        expect(result.manufactureDate).toBeNull();
        expect(result.approximateAge).toBeNull();
        expect(result.confidence).toBeNull();
      });
    }

    // Individual contract adversarial tests with specific explanation checks
    it('T-ADV-5 explicit: H011870M03 explanation must mention pre-1983', () => {
      const result = decode('trane', 'H011870M03', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toContain('Pre-1983');
    });
  });

  // -----------------------------------------------------------------------
  // C. Boundary Cases (Synthetic)
  // -----------------------------------------------------------------------
  describe('C. Boundary cases (synthetic)', () => {
    for (const fixture of TRANE_BOUNDARY_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        if (fixture.expectedStatus === 'success') {
          expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
          expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
          expect(result.manufactureDate?.month).toBeNull();
        } else {
          expect(result.manufactureDate).toBeNull();
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // D. Unsupported / Legacy Formats
  // -----------------------------------------------------------------------
  describe('D. Unsupported / legacy formats', () => {
    for (const fixture of TRANE_UNSUPPORTED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe('unsupported');
        expect(result.manufactureDate).toBeNull();
      });
    }

    it('explicitly traps pre-1983 7-char with unsupported explanation', () => {
      const result = decode('trane', '1234567', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toContain('Pre-1983');
    });

    it('explicitly traps 10-char letter-start with unsupported explanation', () => {
      const result = decode('trane', 'H011870M03', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toContain('Pre-1983');
    });
  });

  // -----------------------------------------------------------------------
  // E. Normalization
  // -----------------------------------------------------------------------
  describe('E. Normalization (case insensitivity and whitespace)', () => {
    for (const fixture of TRANE_NORMALIZATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
      });
    }

    it('preserves original input in result (pre-normalization)', () => {
      const result = decode('trane', '  11241kadbb  ', { referenceDate: REFERENCE_DATE });
      expect(result.input.original).toBe('  11241kadbb  ');
      expect(result.input.normalized).toBe('11241KADBB');
    });
  });

  // -----------------------------------------------------------------------
  // F. Manufacturer Isolation
  // -----------------------------------------------------------------------
  describe('F. Manufacturer isolation', () => {
    for (const fixture of TRANE_ISOLATION_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('trane', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
      });
    }
  });

  // -----------------------------------------------------------------------
  // G. Source Metadata and Confidence
  // -----------------------------------------------------------------------
  describe('G. Source metadata and confidence', () => {
    it('trane-modern-10 sources include Building Intelligence Center', () => {
      const result = decode('trane', '11241KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.sources.length).toBeGreaterThan(0);
      const hasExpectedSource = result.sources.some(
        (s) => s.name === 'Building Intelligence Center',
      );
      expect(hasExpectedSource).toBe(true);
    });

    it('trane-standard-9 sources include Building Intelligence Center', () => {
      const result = decode('trane', '81422S41G', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      const hasExpectedSource = result.sources.some(
        (s) => s.name === 'Building Intelligence Center',
      );
      expect(hasExpectedSource).toBe(true);
    });

    it('trane-letter-9 sources include Building Intelligence Center and InspectorHandbook', () => {
      const result = decode('trane', 'R1742DWBF', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      const hasBIC = result.sources.some(
        (s) => s.name === 'Building Intelligence Center',
      );
      const hasIH = result.sources.some(
        (s) => s.name === 'InspectorHandbook.com',
      );
      expect(hasBIC).toBe(true);
      expect(hasBIC || hasIH).toBe(true);
    });

    it('trane-modern-10 sources have verified BIC URL', () => {
      const result = decode('trane', '11241KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      const bicSource = result.sources.find(
        (s) => s.name === 'Building Intelligence Center',
      );
      expect(bicSource?.url).toBe('https://www.building-center.org/trane-hvac-age/');
    });

    it('trane-modern-10 confidence is high (contract Section 6)', () => {
      const result = decode('trane', '11241KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.confidence).toBe('high');
    });

    it('trane-standard-9 confidence is high (contract Section 6)', () => {
      const result = decode('trane', '81422S41G', { referenceDate: REFERENCE_DATE });
      expect(result.confidence).toBe('high');
    });

    it('trane-letter-9 confidence is high (contract Section 6)', () => {
      const result = decode('trane', 'R1742DWBF', { referenceDate: REFERENCE_DATE });
      expect(result.confidence).toBe('high');
    });
  });

  // -----------------------------------------------------------------------
  // H. Format Rule Structure Tests
  // -----------------------------------------------------------------------
  describe('H. Format rule structure', () => {
    it('trane-modern-10 result has expected structure', () => {
      const result = decode('trane', '11241KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufacturer.id).toBe('trane');
      expect(result.manufacturer.name).toBe('Trane');
      expect(result.formatUsed?.id).toBe('trane-modern-10');
      expect(result.formatUsed?.yearRange[0]).toBe(2010);
      expect(result.formatUsed?.yearRange[1]).toBeNull();
      expect(result.manufactureDate?.year).toBe(2011);
      expect(result.manufactureDate?.week).toBe(24);
      expect(result.manufactureDate?.month).toBeNull();
      expect(result.manufactureDate?.day).toBeNull();
      expect(result.approximateAge).not.toBeNull();
      expect(result.productType).toBe('unknown');
      expect(result.candidates).toHaveLength(0);
      expect(result.sources).not.toHaveLength(0);
    });

    it('trane-standard-9 result has expected structure', () => {
      const result = decode('trane', '81422S41G', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('trane-standard-9');
      expect(result.formatUsed?.yearRange[0]).toBe(2002);
      expect(result.formatUsed?.yearRange[1]).toBe(2009);
      expect(result.manufactureDate?.year).toBe(2008);
      expect(result.manufactureDate?.week).toBe(14);
      expect(result.manufactureDate?.month).toBeNull();
    });

    it('trane-letter-9 result has expected structure with explanation containing letter code', () => {
      const result = decode('trane', 'R1742DWBF', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('trane-letter-9');
      expect(result.formatUsed?.yearRange[0]).toBe(1983);
      expect(result.formatUsed?.yearRange[1]).toBe(2001);
      expect(result.manufactureDate?.year).toBe(2000);
      expect(result.manufactureDate?.week).toBe(17);
      // Explanation must reference the letter and the year
      expect(result.explanation).toContain('R');
      expect(result.explanation).toContain('2000');
    });

    it('unsupported result has null date, age, confidence, and formatUsed', () => {
      const result = decode('trane', 'H011870M03', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
      expect(result.manufactureDate).toBeNull();
      expect(result.approximateAge).toBeNull();
      expect(result.confidence).toBeNull();
      expect(result.formatUsed).toBeNull();
      expect(result.candidates).toHaveLength(0);
    });

    it('invalid-input result for empty string', () => {
      const result = decode('trane', '', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('invalid-input');
    });

    it('formats array contains exactly 4 format rules', () => {
      expect(formats).toHaveLength(4);
    });

    it('format IDs are correct', () => {
      const ids = formats.map((f) => f.id);
      expect(ids).toContain('trane-modern-10');
      expect(ids).toContain('trane-standard-9');
      expect(ids).toContain('trane-letter-9');
      expect(ids).toContain('trane-legacy-unsupported');
    });

    it('all supported format rules have non-empty sources', () => {
      const supported = formats.filter((f) => f.id !== 'trane-legacy-unsupported');
      for (const format of supported) {
        expect(format.sources.length).toBeGreaterThan(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // I. Complete Letter-Year Dictionary Coverage
  // -----------------------------------------------------------------------
  describe('I. Letter-year dictionary coverage', () => {
    const letterYearMap: Record<string, number> = {
      W: 1983, X: 1984, Y: 1985, S: 1986, B: 1987, C: 1988, D: 1989, E: 1990,
      F: 1991, G: 1992, H: 1993, J: 1994, K: 1995, L: 1996, M: 1997, N: 1998,
      P: 1999, R: 2000, Z: 2001,
    };

    for (const [letter, expectedYear] of Object.entries(letterYearMap)) {
      it(`letter ${letter} decodes to year ${expectedYear}`, () => {
        // Build a valid 9-char serial: letter + week "01" + 6 alphanumeric chars
        const serial = `${letter}01AABBCC`;
        const result = decode('trane', serial, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe('success');
        expect(result.formatUsed?.id).toBe('trane-letter-9');
        expect(result.manufactureDate?.year).toBe(expectedYear);
        expect(result.manufactureDate?.week).toBe(1);
      });
    }

    // Verify skipped letters produce unsupported, not wrong-year decodes
    const skippedLetters = ['I', 'O', 'Q', 'T', 'U', 'V'];
    for (const letter of skippedLetters) {
      it(`skipped letter "${letter}" does not decode as a year code`, () => {
        const serial = `${letter}01AABBCC`;
        // Skipped letters are NOT in the letter-9 regex and NOT digits
        // → falls through to generic unsupported (or legacy trap if <=8 chars, but this is 9)
        const result = decode('trane', serial, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe('unsupported');
        expect(result.manufactureDate).toBeNull();
      });
    }
  });

  // -----------------------------------------------------------------------
  // J. Week Range Validation (01–53)
  // -----------------------------------------------------------------------
  describe('J. Week range validation (01–53)', () => {
    it('week 01 is valid for trane-modern-10', () => {
      const result = decode('trane', '1101AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(1);
    });

    it('week 53 is valid for trane-modern-10', () => {
      const result = decode('trane', '1153AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(53);
    });

    it('week 00 is invalid for trane-modern-10', () => {
      const result = decode('trane', '1100AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('week 54 is invalid for trane-modern-10', () => {
      const result = decode('trane', '1154AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('week 60 is invalid (contract adversarial row 1)', () => {
      const result = decode('trane', '11601KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('week 01 is valid for trane-standard-9', () => {
      const result = decode('trane', '201AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(1);
    });

    it('week 53 is valid for trane-standard-9', () => {
      const result = decode('trane', '953AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(53);
    });

    it('week 01 is valid for trane-letter-9', () => {
      const result = decode('trane', 'W01AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(1);
    });

    it('week 53 is valid for trane-letter-9', () => {
      const result = decode('trane', 'Z53AABBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.week).toBe(53);
    });
  });

  // -----------------------------------------------------------------------
  // K. Length Boundary Tests
  // -----------------------------------------------------------------------
  describe('K. Length boundary tests', () => {
    it('input shorter than 3 chars is invalid-input (pipeline pre-validation)', () => {
      const result = decode('trane', 'AB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('invalid-input');
    });

    it('3-char input is unsupported (legacy trap)', () => {
      const result = decode('trane', 'ABC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('8-char input is unsupported (legacy trap)', () => {
      const result = decode('trane', '12345678', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('9-char valid digit-start input (trane-standard-9)', () => {
      const result = decode('trane', '81422S41G', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('trane-standard-9');
    });

    it('9-char valid letter-start input (trane-letter-9)', () => {
      const result = decode('trane', 'R1742DWBF', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('trane-letter-9');
    });

    it('10-char valid digit-start input (trane-modern-10)', () => {
      const result = decode('trane', '11241KADBB', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('trane-modern-10');
    });

    it('10-char letter-start input is unsupported (legacy trap)', () => {
      const result = decode('trane', 'H011870M03', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('11-char input is unsupported (no format supports it)', () => {
      const result = decode('trane', '1124AABBBCC', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });
});
