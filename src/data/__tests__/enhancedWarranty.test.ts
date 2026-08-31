import { describe, it, expect } from 'vitest';
import { payneEnhancedWarrantyRecords } from '../enhancedWarranty';

describe('Enhanced Warranty Database (Payne)', () => {
  it('contains exactly the 3 verified Payne models (490A, PG9M, PG9U)', () => {
    const models = payneEnhancedWarrantyRecords.map(r => r.modelFamily).sort();
    expect(models).toEqual(['490A', 'PG9M', 'PG9U']);
  });

  it('contains no duplicate model families', () => {
    const models = payneEnhancedWarrantyRecords.map(r => r.modelFamily);
    const uniqueModels = new Set(models);
    expect(models.length).toBe(uniqueModels.size);
  });

  it('ensures all records belong exclusively to Payne', () => {
    for (const record of payneEnhancedWarrantyRecords) {
      expect(record.brand).toBe('Payne');
    }
  });

  it('validates serial number boundaries and logic', () => {
    for (const record of payneEnhancedWarrantyRecords) {
      // Must be 10 characters as per modern format
      expect(record.serialStart.length).toBe(10);
      expect(record.serialEnd.length).toBe(10);

      // Simple lexicographical check for WWYY format correctness 
      // (2993... comes before 5211... lexicographically as strings, but wait:
      // '2993' vs '5211', '2' < '5' so '2993A00001' < '5211A99999' is true.
      expect(record.serialStart < record.serialEnd).toBe(true);
    }
  });

  it('ensures all records have required fields and source metadata', () => {
    for (const record of payneEnhancedWarrantyRecords) {
      expect(record.modelFamily).toBeTruthy();
      expect(Array.isArray(record.modelPrefixes)).toBe(true);
      expect(record.manufacturePeriod.start).toBeTruthy();
      expect(record.manufacturePeriod.end).toBeTruthy();
      expect(record.status).toBe('verified');
      
      // Source validation
      expect(record.sources.length).toBeGreaterThan(0);
      for (const source of record.sources) {
        expect(source.name).toContain('09-0022');
        expect(source.confidence).toBe('verified');
      }
    }
  });
});
