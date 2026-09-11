import type { ManufactureDate, ApproximateAge } from '../decoder/types';

/**
 * Build a ManufactureDate object from decoded date components.
 *
 * Constructs the `display` string based on available precision:
 * - Year + Month + Day → "March 15, 2019"
 * - Year + Month       → "March 2019"
 * - Year + Week        → "Week 31, 2019"
 * - Year only          → "2019"
 */
export function buildManufactureDate(
  year: number | null,
  month: number | null,
  week: number | null,
  day: number | null,
): ManufactureDate {
  let display: string;

  if (year !== null) {
    if (month !== null && day !== null) {
      // Full date: "March 15, 2019"
      const date = new Date(year, month - 1, day);
      display = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (month !== null) {
      // Year + Month: "March 2019"
      const date = new Date(year, month - 1, 1);
      display = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } else if (week !== null) {
      // Year + Week: "Week 31, 2019"
      display = `Week ${week}, ${year}`;
    } else {
      // Year only: "2019"
      display = `${year}`;
    }
  } else {
    // Year is null (century could not be established)
    if (month !== null && day !== null) {
      const date = new Date(2000, month - 1, day); // Dummy year for formatting
      display = `Unknown Year, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    } else if (month !== null) {
      const date = new Date(2000, month - 1, 1);
      display = `Unknown Year, ${date.toLocaleDateString('en-US', { month: 'long' })}`;
    } else if (week !== null) {
      display = `Unknown Year, Week ${week}`;
    } else {
      display = 'Unknown Year';
    }
  }

  return { year, month, week, day, display };
}

/**
 * Calculate the approximate age of equipment given a manufacture date
 * and a reference date (typically "now").
 *
 * @param manufactureDate - The decoded manufacture date
 * @param referenceDate   - The date to calculate age relative to (injectable for testing)
 * @returns ApproximateAge with years, months, and display string, or null if year is unknown
 */
export function calculateAge(
  manufactureDate: ManufactureDate,
  referenceDate: Date = new Date(),
): ApproximateAge | null {
  if (manufactureDate.year === null) {
    return null;
  }

  // Build the best approximation of the manufacture date
  const mfgMonth = manufactureDate.month ?? 1; // default to January if unknown
  const mfgDay = manufactureDate.day ?? 1;     // default to 1st if unknown

  const mfgDate = new Date(manufactureDate.year, mfgMonth - 1, mfgDay);

  // Calculate difference
  let years = referenceDate.getFullYear() - mfgDate.getFullYear();
  let months = referenceDate.getMonth() - mfgDate.getMonth();

  // Adjust if the reference day is before the manufacture day in the month
  if (referenceDate.getDate() < mfgDate.getDate()) {
    months--;
  }

  // Normalize negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Guard against future dates
  if (years < 0) {
    years = 0;
    months = 0;
  }

  // Build display string
  let display: string;
  if (years === 0 && months === 0) {
    display = 'Less than 1 month';
  } else if (years === 0) {
    display = months === 1 ? '1 month' : `${months} months`;
  } else if (months === 0) {
    display = years === 1 ? '1 year' : `${years} years`;
  } else {
    const yearStr = years === 1 ? '1 year' : `${years} years`;
    const monthStr = months === 1 ? '1 month' : `${months} months`;
    display = `${yearStr}, ${monthStr}`;
  }

  return { years, months, display };
}
