import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { _resetRegistryForTesting, registerManufacturer } from '../../../engine/registry';
import { tempstarFormat } from '../formats';
import { decode } from '../../../engine';

describe('Tempstar Decoder', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
    registerManufacturer({
      id: 'tempstar',
      name: 'Tempstar',
      formats: [tempstarFormat]
    });
  });

  afterEach(() => {
    _resetRegistryForTesting();
  });

  describe('REAL VERIFIED EXAMPLES', () => {
    it('decodes L004112345 (2000, Week 41, Lewisburg)', () => {
      const result = decode('tempstar', 'L004112345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2000);
        expect(result.manufactureDate?.week).toBe(41);
        expect(result.segments.find(s => s.field === 'Plant Code')?.description).toBe('Lewisburg, TN');
      }
    });

    it('decodes L903789847 (1990, Week 37)', () => {
      const result = decode('tempstar', 'L903789847');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(1990);
        expect(result.manufactureDate?.week).toBe(37);
        expect(result.segments.find(s => s.field === 'Plant Code')?.description).toBe('Lewisburg, TN');
      }
    });
  });

  describe('SYNTHETIC BOUNDARY TESTS', () => {
    it('decodes L900199999 (1990, Week 01)', () => {
      const result = decode('tempstar', 'L900199999');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(1990);
        expect(result.manufactureDate?.week).toBe(1);
      }
    });

    it('decodes L990199999 (1999, Week 01)', () => {
      const result = decode('tempstar', 'L990199999');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(1999);
        expect(result.manufactureDate?.week).toBe(1);
      }
    });

    it('decodes L000199999 (2000, Week 01)', () => {
      const result = decode('tempstar', 'L000199999');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2000);
        expect(result.manufactureDate?.week).toBe(1);
      }
    });

    it('decodes boundary for current year', () => {
      const currentYear = new Date().getFullYear();
      const currentYearYY = (currentYear % 100).toString().padStart(2, '0');
      const serial = `L${currentYearYY}0199999`;
      const result = decode('tempstar', serial);
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(currentYear);
        expect(result.manufactureDate?.week).toBe(1);
      }
    });

    it('decodes boundary for week 53', () => {
      const result = decode('tempstar', 'L005399999');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2000);
        expect(result.manufactureDate?.week).toBe(53);
      }
    });
  });

  describe('INVALID / UNSUPPORTED', () => {
    it('rejects boundary for future year (current year + 1)', () => {
      const currentYear = new Date().getFullYear();
      const futureYearYY = ((currentYear + 1) % 100).toString().padStart(2, '0');
      const serial = `L${futureYearYY}0199999`;
      const result = decode('tempstar', serial);
      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.explanation).toContain('outside the verified 1990-current range');
      }
    });

    it('rejects L870199999 (unsupported format era)', () => {
      const result = decode('tempstar', 'L870199999');
      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.explanation).toContain('1987-1989');
      }
    });

    it('rejects L880199999 (unsupported format era)', () => {
      const result = decode('tempstar', 'L880199999');
      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.explanation).toContain('1987-1989');
      }
    });

    it('rejects L890199999 (unsupported format era)', () => {
      const result = decode('tempstar', 'L890199999');
      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.explanation).toContain('1987-1989');
      }
    });

    it('rejects L865299999 (invalid/unsupported because YY=86 is outside verified range)', () => {
      const result = decode('tempstar', 'L865299999');
      expect(result.status).toBe('unsupported');
      if (result.status === 'unsupported') {
        expect(result.explanation).toContain('verified 1990-current range');
      }
    });

    it('rejects L000000000 (invalid because week 00)', () => {
      const result = decode('tempstar', 'L000000000');
      // A format returning `null` means it failed to decode, so the top-level engine returns `unsupported` or `invalid-input`.
      expect(result.status).toBe('unsupported');
    });

    it('rejects L005499999 (invalid because week 54)', () => {
      const result = decode('tempstar', 'L005499999');
      expect(result.status).toBe('unsupported');
    });

    it('rejects L004112345X (invalid length)', () => {
      const result = decode('tempstar', 'L004112345X');
      expect(result.status).toBe('unsupported');
    });

    it('rejects 1716X12345 (unsupported Tempstar format)', () => {
      const result = decode('tempstar', '1716X12345');
      expect(result.status).toBe('unsupported');
    });

    it('rejects 850304091 (unsupported numeric format)', () => {
      const result = decode('tempstar', '850304091');
      expect(result.status).toBe('unsupported');
    });

    it('rejects H55116328 (unsupported Heil-Quaker format)', () => {
      const result = decode('tempstar', 'H55116328');
      expect(result.status).toBe('unsupported');
    });
  });

  describe('ADDITIONAL TESTS', () => {
    it('supports lowercase input normalization', () => {
      const result = decode('tempstar', 'l004112345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2000);
        expect(result.manufactureDate?.week).toBe(41);
        expect(result.segments.find(s => s.field === 'Plant Code')?.description).toBe('Lewisburg, TN');
      }
    });

    it('handles unknown plant letter gracefully', () => {
      const result = decode('tempstar', 'C004112345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2000);
        expect(result.segments.find(s => s.field === 'Plant Code')?.description).toBe('Unknown');
      }
    });
  });
});
