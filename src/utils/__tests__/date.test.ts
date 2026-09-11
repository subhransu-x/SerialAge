import { describe, it, expect } from 'vitest';
import { buildManufactureDate, calculateAge } from '../../utils/date';

// ---------------------------------------------------------------------------
// buildManufactureDate
// ---------------------------------------------------------------------------

describe('buildManufactureDate', () => {
  it('displays full date when year, month, and day are provided', () => {
    const result = buildManufactureDate(2019, 3, null, 15);
    expect(result.year).toBe(2019);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
    expect(result.display).toBe('March 15, 2019');
  });

  it('displays month + year when day is null', () => {
    const result = buildManufactureDate(2019, 3, null, null);
    expect(result.display).toBe('March 2019');
  });

  it('displays week + year when month is null but week is provided', () => {
    const result = buildManufactureDate(2019, null, 31, null);
    expect(result.display).toBe('Week 31, 2019');
  });

  it('displays year only when month and week are both null', () => {
    const result = buildManufactureDate(2019, null, null, null);
    expect(result.display).toBe('2019');
  });

  it('prefers month+day display over week when both are present', () => {
    const result = buildManufactureDate(2019, 3, 12, 15);
    // month + day takes priority
    expect(result.display).toBe('March 15, 2019');
    expect(result.week).toBe(12); // still preserved in data
  });

  it('handles January correctly', () => {
    const result = buildManufactureDate(2020, 1, null, null);
    expect(result.display).toBe('January 2020');
  });

  it('handles December correctly', () => {
    const result = buildManufactureDate(2020, 12, null, null);
    expect(result.display).toBe('December 2020');
  });

  it('handles null year correctly', () => {
    const result = buildManufactureDate(null, 12, null, null);
    expect(result.display).toBe('December — Year cannot be determined');
    expect(result.year).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// calculateAge
// ---------------------------------------------------------------------------

describe('calculateAge', () => {
  it('calculates years and months correctly', () => {
    const mfgDate = buildManufactureDate(2019, 3, null, null);
    const refDate = new Date(2025, 5, 15); // June 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(6);
    expect(age!.months).toBe(3);
    expect(age!.display).toBe('6 years, 3 months');
  });

  it('handles exact year boundary', () => {
    const mfgDate = buildManufactureDate(2020, 1, null, 1);
    const refDate = new Date(2025, 0, 1); // Jan 1, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(5);
    expect(age!.months).toBe(0);
    expect(age!.display).toBe('5 years');
  });

  it('handles less than 1 month old', () => {
    const mfgDate = buildManufactureDate(2025, 6, null, 10);
    const refDate = new Date(2025, 5, 15); // June 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(0);
    expect(age!.months).toBe(0);
    expect(age!.display).toBe('Less than 1 month');
  });

  it('handles exactly 1 month old', () => {
    const mfgDate = buildManufactureDate(2025, 5, null, 1);
    const refDate = new Date(2025, 5, 1); // June 1, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(0);
    expect(age!.months).toBe(1);
    expect(age!.display).toBe('1 month');
  });

  it('handles exactly 1 year old', () => {
    const mfgDate = buildManufactureDate(2024, 6, null, 15);
    const refDate = new Date(2025, 5, 15); // June 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(1);
    expect(age!.months).toBe(0);
    expect(age!.display).toBe('1 year');
  });

  it('handles future manufacture dates gracefully', () => {
    const mfgDate = buildManufactureDate(2030, 1, null, null);
    const refDate = new Date(2025, 5, 15);
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(0);
    expect(age!.months).toBe(0);
    expect(age!.display).toBe('Less than 1 month');
  });

  it('defaults to January 1st when month and day are unknown', () => {
    const mfgDate = buildManufactureDate(2020, null, null, null);
    const refDate = new Date(2025, 5, 15); // June 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.years).toBe(5);
    expect(age!.months).toBe(5);
  });

  it('displays singular month correctly', () => {
    const mfgDate = buildManufactureDate(2025, 4, null, 1);
    const refDate = new Date(2025, 4, 15); // May 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.display).toBe('1 month');
  });

  it('displays plural months correctly', () => {
    const mfgDate = buildManufactureDate(2025, 1, null, 1);
    const refDate = new Date(2025, 5, 15); // June 15, 2025
    const age = calculateAge(mfgDate, refDate);
    expect(age!.display).toBe('5 months');
  });

  it('returns null age when year is unknown', () => {
    const mfgDate = buildManufactureDate(null, 1, null, 1);
    const refDate = new Date(2025, 5, 15);
    const age = calculateAge(mfgDate, refDate);
    expect(age).toBeNull();
  });
});
