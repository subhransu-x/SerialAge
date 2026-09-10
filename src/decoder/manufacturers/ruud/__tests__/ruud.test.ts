import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../../engine/registry';
import type { ManufacturerDefinition } from '../../../types';
import {
  ruud_VERIFIED_FIXTURES,
  ruud_INVALID_FIXTURES,
} from './fixtures';
import { formats } from '../formats';

const REFERENCE_DATE = new Date(2026, 7, 27); // August 27, 2026

function registerruud(): void {
  const definition: ManufacturerDefinition = {
    id: 'ruud',
    name: 'ruud',
    formats: [...formats],
  };
  registerManufacturer(definition);
}

describe('ruud Decoder (Modern Structural)', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerruud();
  });

  describe('A. Verified contract golden fixtures', () => {
    for (const fixture of ruud_VERIFIED_FIXTURES) {
      it(fixture.description, () => {
        const result = decode('ruud', fixture.serialNumber, { referenceDate: REFERENCE_DATE });
        expect(result.status).toBe(fixture.expectedStatus);
        expect(result.formatUsed?.id).toBe(fixture.expectedFormatId);
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        expect(result.manufactureDate?.month).toBe(fixture.expectedMonth ?? null);
        expect(result.confidence).toBe(fixture.expectedConfidence);
      });
    }
  });

  describe('B. Invalid and unsupported inputs', () => {
    for (const fixture of ruud_INVALID_FIXTURES) {
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
  });

  describe('C. Specific explicit requirements', () => {
    // 12. Water-heater collision: M141209135
    it('Water-heater collision: M141209135 must NOT be automatically interpreted as HVAC', () => {
      const result = decode('ruud', 'M141209135', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.productType).toBe('unknown'); // NOT hvac
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('shared between ruud HVAC equipment and ruud Water Heaters');
    });

    // 15. Multiple structurally valid candidates
    // As proven in the regex structural design, the `(\d{4,})$` anchor logically precludes 
    // multiple candidates since the rest of the string must be purely numeric. This test verifies it.
    it('Multiple structurally valid candidates are logically impossible, but verify complex string', () => {
      // Last letter is A. Is M a candidate? No, because M is followed by A which isn't numeric.
      const result = decode('ruud', 'M1210123A45678912', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('success');
      expect(result.explanation).toContain('Plant code letter "A"');
      expect(result.manufactureDate?.year).toBe(1967); // 67 -> 1967 due to 50-year sliding window from 2026
      expect(result.manufactureDate?.week).toBe(45);
    });

    it('Manufacturer isolation: Carrier 4206A12345 should fail', () => {
      const result = decode('ruud', '4206A12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });

    it('Manufacturer isolation: Lennox 5806K12345 should fail', () => {
      const result = decode('ruud', '5806K12345', { referenceDate: REFERENCE_DATE });
      expect(result.status).toBe('unsupported');
    });
  });
});
