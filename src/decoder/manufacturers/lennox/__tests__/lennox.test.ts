import { describe, it, expect } from 'vitest';
import { decode } from '../../../index';

describe('Lennox Decoder', () => {
  describe('Modern Standard (1974-present)', () => {
    it('decodes standard 10-character serial with year and month letter', () => {
      // 58 = plant, 06 = 2006, K = October
      const result = decode('lennox', '5806K12345');
      
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.display).toBe('October 2006');
        expect(result.manufactureDate?.year).toBe(2006);
        expect(result.manufactureDate?.month).toBe(10);
        expect(result.confidence).toBe('high');
        expect(result.formatUsed?.id).toBe('lennox-standard-10');
      }
    });

    it('decodes late 90s serial correctly', () => {
      // 99 = 1999, M = December
      const result = decode('lennox', '5899M12345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(1999);
        expect(result.manufactureDate?.month).toBe(12); // M is 12th letter skipping I
      }
    });

    it('decodes exactly 1974 (boundary threshold) correctly', () => {
      // 74 = 1974, A = January
      const result = decode('lennox', '5874A12345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(1974);
        expect(result.manufactureDate?.month).toBe(1);
      }
    });

    it('handles first two characters being letters (plant code variation)', () => {
      const result = decode('lennox', 'AA06K12345');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBe(2006);
      }
    });

    it('rejects month letter I as it is intentionally skipped by Lennox', () => {
      const result = decode('lennox', '5806I12345');
      expect(result.status).toBe('unsupported'); // Fails structural regex match
    });
    
    it('rejects letters N-Z for month', () => {
      const result = decode('lennox', '5806N12345');
      expect(result.status).toBe('unsupported');
      
      const result2 = decode('lennox', '5806Z12345');
      expect(result2.status).toBe('unsupported');
    });
  });

  describe('Invalid inputs', () => {
    it('returns unsupported for completely wrong formats', () => {
      const result = decode('lennox', '1234567890123'); // 13 chars
      expect(result.status).toBe('unsupported');
    });
    
    it('returns unsupported for too short inputs', () => {
      const result = decode('lennox', '5806K'); // 5 chars
      expect(result.status).toBe('unsupported');
    });
  });
});
