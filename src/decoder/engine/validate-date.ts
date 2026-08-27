/**
 * Date validation utilities for decoded manufacture dates.
 *
 * These validate that decoded date components represent real,
 * plausible dates. Used by the pipeline to reject impossible
 * or nonsensical decode results before surfacing them.
 */

/** Earliest plausible manufacture year for HVAC/water heater equipment */
const MIN_YEAR = 1950;

/** Latest plausible manufacture year (generous buffer into the future) */
const MAX_YEAR_OFFSET = 2; // allow up to 2 years ahead of current year

/**
 * Validate decoded date components.
 *
 * Returns null if valid, or a human-readable error string if invalid.
 * This prevents impossible dates (month 13, day 32, year 1800) from
 * reaching the user.
 */
export function validateDecodedDate(
  year: number,
  month: number | null,
  week: number | null,
  day: number | null,
  referenceDate: Date = new Date(),
): string | null {
  // Year validation
  if (!Number.isInteger(year)) {
    return `Invalid year: "${year}" is not an integer.`;
  }
  if (year < MIN_YEAR) {
    return `Implausible year: ${year} is before ${MIN_YEAR}. HVAC equipment this old is not expected.`;
  }
  const maxYear = referenceDate.getFullYear() + MAX_YEAR_OFFSET;
  if (year > maxYear) {
    return `Implausible year: ${year} is more than ${MAX_YEAR_OFFSET} years in the future.`;
  }

  // Month validation
  if (month !== null) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return `Invalid month: ${month}. Must be 1–12.`;
    }
  }

  // Week validation
  if (week !== null) {
    if (!Number.isInteger(week) || week < 1 || week > 53) {
      return `Invalid week: ${week}. Must be 1–53.`;
    }
  }

  // Day validation
  if (day !== null) {
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return `Invalid day: ${day}. Must be 1–31.`;
    }

    // If we have year + month + day, validate it's a real calendar date
    if (month !== null) {
      const testDate = new Date(year, month - 1, day);
      if (
        testDate.getFullYear() !== year ||
        testDate.getMonth() !== month - 1 ||
        testDate.getDate() !== day
      ) {
        return `Invalid date: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} does not exist.`;
      }
    }
  }

  return null; // valid
}
