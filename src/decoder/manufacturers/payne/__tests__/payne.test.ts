import { describe, expect, it } from 'vitest';
import { decode } from '../../../engine/pipeline';
import { payne } from '../index';

// Ensure the manufacturer is registered for the pipeline to find it
import '../../../manufacturers/index';

describe('Payne Serial Number Decoder', () => {
  it('has the correct manufacturer definition', () => {
    expect(payne.id).toBe('payne');
    expect(payne.name).toBe('Payne');
    expect(payne.formats.length).toBe(3); // Same as Carrier (WWYY, YYMM, Legacy)
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

  describe('legacy-unsupported', () => {
    it('rejects synthetic Style 3 legacy and uses Payne metadata', () => {
      const result = decode('payne', 'W4D14008');
      expect(result.status).toBe('unsupported');
      expect(result.explanation).toContain('cannot be reliably decoded');
      expect(result.sources?.[0]?.notes).toContain('Payne documentation showing highly varied legacy formats');
    });
  });
});
