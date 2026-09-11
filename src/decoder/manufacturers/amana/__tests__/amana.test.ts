import { describe, it, expect } from 'vitest';
import { decode } from '../../../index';
import '../index'; // Register Amana

describe('Amana Decoder', () => {
  describe('Modern 10-Digit Format (YYMMXXXXXX)', () => {
    // 10-digit formats with MM <= 12 should return success with year=null
    // due to the century ambiguity and appliance YYWW collision.
    const ambiguousCases = [
      { serial: '1708123456', description: 'YY=17, MM=08' },
      { serial: '9901123456', description: 'YY=99, MM=01' },
      { serial: '2112123456', description: 'YY=21, MM=12' },
    ];

    it.each(ambiguousCases)('returns partial success with year=null and warnings for $description ($serial)', ({ serial }) => {
      const result = decode('amana', serial);
      expect(result.status).toBe('success');
      
      if (result.status === 'success') {
        expect(result.manufactureDate?.year).toBeNull();
        expect(result.manufactureDate?.month).toBeGreaterThanOrEqual(1);
        expect(result.manufactureDate?.month).toBeLessThanOrEqual(12);
        expect(result.manufactureDate?.display).toMatch(/^Unknown Year/);
        
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('Century cannot be safely established');
        expect(result.warnings[1]).toContain('appliance');
      }
    });

    const validationCases = [
      { serial: '2113123456', description: 'Invalid month (13)' },
      { serial: '8100123456', description: 'Invalid month (00)' },
      { serial: '9952123456', description: 'Month 52 (appliance week collision)' },
    ];

    it.each(validationCases)('rejects $description ($serial) as unsupported when month > 12 or < 1', ({ serial }) => {
      const result = decode('amana', serial);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('Unsupported Historical Formats', () => {
    const historicalCases = [
      { serial: '96-90391', description: 'Legacy dash format' },
      { serial: '04 05 90391', description: 'Legacy spaced format' },
      { serial: '040590391', description: '9-digit format' },
      { serial: 'B123456P', description: 'Legacy PTAC format' },
      { serial: 'BLACKHORSE', description: 'BLACKHORSE cipher-like string' },
      { serial: '5FU5472618P', description: 'Daikin PTAC string' },
      { serial: '297448', description: '6-digit numeric format' },
    ];

    it.each(historicalCases)('returns unsupported for $description ($serial)', ({ serial }) => {
      const result = decode('amana', serial);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('General Rejections', () => {
    it('returns unsupported for random text', () => {
      const result = decode('amana', 'RANDOMTEXT'); 
      expect(result.status).toBe('unsupported');
    });
  });
});
