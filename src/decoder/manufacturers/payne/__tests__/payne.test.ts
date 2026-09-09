import { describe, expect, it } from 'vitest';
import { decode } from '../../../engine/pipeline';
import { payne } from '../index';

// Ensure the manufacturer is registered for the pipeline to find it
import '../../../manufacturers/index';

describe('Payne Serial Number Decoder', () => {
  it('has the correct manufacturer definition', () => {
    expect(payne.id).toBe('payne');
    expect(payne.name).toBe('Payne');
    expect(payne.formats.length).toBe(8); // Now matches Carrier (WWYY, YYMM, Style3-US, Style3-CA, Style4-unambiguous, Style4-1969, Style4-1979, Style6-unsupported)
  });

  describe('carrier-wwyy-standard', () => {
    it('decodes a synthetic WWYY standard format and uses Payne metadata', () => {
      const result = decode('payne', '4208A12345');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(2008);
      expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
      expect(result.sources?.[0]?.notes).toContain('Payne documentation confirming');
      expect(result.sources?.[0]?.notes).not.toContain('Carrier');
    });
  });

  describe('carrier-yymm-legacy', () => {
    it('decodes a synthetic YYMM legacy format and uses Payne metadata', () => {
      const result = decode('payne', '820512345');
      expect(result.status).toBe('success');
      expect(result.manufactureDate?.year).toBe(1982);
      expect(result.manufactureDate?.month).toBe(5); // 1-indexed (May)
      expect(result.formatUsed?.id).toBe('carrier-yymm-legacy');
      expect(result.sources?.[0]?.notes).toContain('Payne documentation confirming');
      expect(result.sources?.[0]?.notes).not.toContain('Carrier');
    });
  });

  describe('carrier-style3-us (via Carrier formats)', () => {
    it('decodes synthetic Style 3 (W4D14008) — Payne shares Style 3 decoding with Carrier', () => {
      const result = decode('payne', 'W4D14008');
      // Style 3 is now decoded (September 1984), not unsupported
      expect(result.status).toBe('success');
      expect(result.formatUsed?.id).toBe('carrier-style3-us');
      expect(result.manufactureDate?.year).toBe(1984);
      expect(result.manufactureDate?.month).toBe(9);
    });
  });
});
