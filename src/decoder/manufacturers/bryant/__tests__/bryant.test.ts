import { describe, expect, it } from 'vitest';
import { decode } from '../../../engine/pipeline';
import { bryant } from '../index';

// Ensure the manufacturer is registered for the pipeline to find it
import '../../../manufacturers/index';

describe('Bryant Serial Number Decoder', () => {
  it('has the correct manufacturer definition', () => {
    expect(bryant.id).toBe('bryant');
    expect(bryant.name).toBe('Bryant');
    expect(bryant.formats.length).toBe(3); // Same as Carrier (WWYY, YYMM, Legacy)
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

  describe('legacy-unsupported', () => {
    it('rejects synthetic Style 4 legacy and uses Bryant metadata', () => {
      const result = decode('bryant', 'A167890');
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toContain('cannot be reliably decoded');
      expect(result.sources?.[0]?.notes).toContain('Bryant documentation showing highly varied legacy formats');
    });
  });
});
