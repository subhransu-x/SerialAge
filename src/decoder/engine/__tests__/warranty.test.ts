import { describe, it, expect } from 'vitest';
import { evaluateEnhancedWarranty } from '../warranty';
import { enhancedWarrantyWarnings } from '../../../data/enhancedWarrantyWarnings';

describe('evaluateEnhancedWarranty (Payne)', () => {
  const brand = 'Payne';
  
  it('returns MATCHED_PROGRAM_RANGE for PG9M + qualifying serial', () => {
    // 2993A00001 is the start boundary
    const result = evaluateEnhancedWarranty(brand, '2993A00001', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('returns MATCHED_PROGRAM_RANGE for PG9U + qualifying serial (with extra model chars)', () => {
    // 5211A99999 is the end boundary
    const result = evaluateEnhancedWarranty(brand, '5211A99999', 'PG9UAA036080');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('returns MATCHED_PROGRAM_RANGE for 490A + qualifying serial in the middle', () => {
    const result = evaluateEnhancedWarranty(brand, '3501A12345', '490A');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('returns NO_MATCH for PG8M + qualifying serial (not an affected model)', () => {
    const result = evaluateEnhancedWarranty(brand, '3501A12345', 'PG8M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns NO_MATCH for generic PG9 + qualifying serial (strict matching test)', () => {
    // Must NOT match "PG9" generally, only PG9M or PG9U explicitly
    const result = evaluateEnhancedWarranty(brand, '3501A12345', 'PG9');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns NO_MATCH for affected model + serial BEFORE 2993A00001', () => {
    // Week 28 of 1993
    const result = evaluateEnhancedWarranty(brand, '2893A99999', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns NO_MATCH for affected model + serial AFTER 5211A99999', () => {
    // Week 53 of 2011
    const result = evaluateEnhancedWarranty(brand, '5311A00001', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns INSUFFICIENT_INFORMATION for qualifying serial + missing model', () => {
    const result = evaluateEnhancedWarranty(brand, '3501A12345');
    expect(result).toBe(enhancedWarrantyWarnings['INSUFFICIENT_INFORMATION']);
  });

  it('returns NO_MATCH for invalid/empty serial', () => {
    const result = evaluateEnhancedWarranty(brand, '', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });
  
  it('returns NO_MATCH for unsupported brand (Carrier)', () => {
    const result = evaluateEnhancedWarranty('Carrier', '3501A12345', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns NO_MATCH for unsupported brand (Bryant)', () => {
    const result = evaluateEnhancedWarranty('Bryant', '3501A12345', 'PG9M');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('Boundary: exact start 2993A00001', () => {
    const result = evaluateEnhancedWarranty(brand, '2993A00001', '490A');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('Boundary: just inside start 2993A00002', () => {
    const result = evaluateEnhancedWarranty(brand, '2993A00002', '490A');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('Boundary: exact end 5211A99999', () => {
    const result = evaluateEnhancedWarranty(brand, '5211A99999', 'PG9U');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('Boundary: just after end 5311A00000', () => {
    const result = evaluateEnhancedWarranty(brand, '5311A00000', 'PG9U');
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('returns safe failure for malformed serial', () => {
    const result = evaluateEnhancedWarranty(brand, '350812345', 'PG9M'); // missing 'A'
    expect(result).toBe(enhancedWarrantyWarnings['NO_MATCH']);
    
    const result2 = evaluateEnhancedWarranty(brand, 'AB93A00001', 'PG9M'); // bad week
    expect(result2).toBe(enhancedWarrantyWarnings['NO_MATCH']);
  });

  it('Model normalization: lowercase pg9m', () => {
    const result = evaluateEnhancedWarranty(brand, '3508A12345', 'pg9m');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('Model normalization: PG9M with spaces', () => {
    const result = evaluateEnhancedWarranty(brand, '3508A12345', 'PG9 M');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });

  it('Model normalization: PG-9M with hyphens', () => {
    const result = evaluateEnhancedWarranty(brand, '3508A12345', 'PG-9M');
    expect(result).toBe(enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']);
  });
});
