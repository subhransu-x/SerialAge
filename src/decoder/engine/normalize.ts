import type { NormalizedInput } from '../types';

/**
 * Minimum length for a serial number to be considered valid.
 * Most HVAC serial numbers are 8+ characters. 3 is a generous minimum
 * to catch obvious garbage while not rejecting unusual short formats.
 */
const MIN_SERIAL_LENGTH = 3;

/**
 * Maximum length for a serial number.
 * Prevents absurdly long input from being processed.
 */
const MAX_SERIAL_LENGTH = 50;

/**
 * Validate raw user input before normalization.
 *
 * Returns an error message string if invalid, or null if valid.
 * This is a fast pre-check — it does NOT validate against any format.
 */
export function validateInput(raw: string): string | null {
  if (typeof raw !== 'string') {
    return 'Serial number must be a string.';
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return 'Serial number is empty.';
  }

  if (trimmed.length < MIN_SERIAL_LENGTH) {
    return `Serial number is too short (minimum ${MIN_SERIAL_LENGTH} characters).`;
  }

  if (trimmed.length > MAX_SERIAL_LENGTH) {
    return `Serial number is too long (maximum ${MAX_SERIAL_LENGTH} characters).`;
  }

  return null; // valid
}

/**
 * Normalize user input into multiple representations for pattern matching.
 *
 * Design principles:
 * - NEVER silently remove characters that could change meaning
 * - Provide multiple representations; let each FormatRule choose
 * - Preserve the original input untouched for display/debugging
 *
 * @param raw - Raw user input (should already pass validateInput)
 * @returns NormalizedInput with original, normalized, and variant forms
 */
export function normalizeInput(raw: string): NormalizedInput {
  const trimmed = raw.trim();
  const uppercased = trimmed.toUpperCase();

  return {
    original: raw,
    normalized: uppercased,
    withoutHyphens: uppercased.replace(/-/g, ''),
    withoutSpaces: uppercased.replace(/\s+/g, ''),
  };
}
