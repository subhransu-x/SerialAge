import { describe, expect, it } from 'vitest';
import { decode } from '../../../engine/pipeline';
import { bryant } from '../index';

// Ensure the manufacturer is registered for the pipeline to find it
import '../../../manufacturers/index';

describe('Bryant Serial Number Decoder', () => {
  it('has the correct manufacturer definition', () => {
    expect(bryant.id).toBe('bryant');
    expect(bryant.name).toBe('Bryant');
    expect(bryant.formats.length).toBe(8); // Now matches Carrier (WWYY, YYMM, Style3-US, Style3-CA, Style4-unambiguous, Style4-1969, Style4-1979, Style6-unsupported)
  });

  describe('carrier-wwyy-standard', () => {
    it('decodes a synthetic WWYY standard format and uses Bryant metadata', () => {
      const result = decode('bryant', '4006A17330');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2006);
      expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
      expect(result.sources?.[0]?.notes).toContain('Bryant documentation confirming');
      expect(result.sources?.[0]?.notes).not.toContain('Carrier');
    });

    it('decodes another synthetic WWYY format', () => {
      const result = decode('bryant', '3210E12345');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2010);
      expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
    });
  });

  describe('carrier-yymm-legacy', () => {
    it('decodes a synthetic YYMM legacy format and uses Bryant metadata', () => {
      const result = decode('bryant', '850304091');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1985);
      expect(result.manufactureDate?.month).toBe(3); // 1-indexed (March)
      expect(result.formatUsed?.id).toBe('carrier-yymm-legacy');
      expect(result.sources?.[0]?.notes).toContain('Bryant documentation confirming');
      expect(result.sources?.[0]?.notes).not.toContain('Carrier');
    });
  });

  describe('carrier-style4-unambiguous (via Carrier formats)', () => {
    it('decodes synthetic Style 4 (A167890) — Bryant shares Style 4 decoding with Carrier', () => {
      const result = decode('bryant', 'A167890');
      // Style 4 is now decoded (January 1971), not unsupported
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style4-unambiguous');
      expect(result.manufactureDate?.year).toBe(1971);
    });
  });
});
