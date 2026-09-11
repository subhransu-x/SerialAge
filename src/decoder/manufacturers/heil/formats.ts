/**
 * Heil / ICP serial number format rules.
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { HEIL_MODERN_SOURCES, HEIL_LEGACY_SOURCES, HEIL_DUCTLESS_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Structural matching regexes
// ---------------------------------------------------------------------------

// Format A: Modern ICP Unitary (10 chars)
// [LETTER][YY][WW][5 DIGIT SEQUENCE]
const MODERN_PATTERN = /^([A-Z])([0-9]{2})(0[1-9]|[1-4][0-9]|5[0-3])([0-9]{5})$/i;

// Format B & C: Heil-Quaker 1970s/1980s (9 chars)
// [G|H][Y][WW][5 DIGIT SEQUENCE]
const LEGACY_QUAKER_PATTERN = /^([GH])([0-9])(0[1-9]|[1-4][0-9]|5[0-3])([0-9]{5})$/i;

// Format D: Legacy six-digit numeric (6 chars)
// Completely unsupported as year cannot be isolated to a single decade.
const LEGACY_NUMERIC_PATTERN = /^[0-9]{6}$/;

// Midea / ICP Ductless Older Format (10 chars)
// [YY][WW]V[5 DIGIT SEQUENCE]
const DUCTLESS_OLDER_PATTERN = /^([0-9]{2})(0[1-9]|[1-4][0-9]|5[0-3])V([0-9]{5})$/i;

// Midea / ICP Ductless Newer Format (11 chars)
// V[YY][WW]V[5 DIGIT SEQUENCE]
const DUCTLESS_NEWER_PATTERN = /^V([0-9]{2})(0[1-9]|[1-4][0-9]|5[0-3])V([0-9]{5})$/i;

// ---------------------------------------------------------------------------
// Century / year resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a 2-digit year for the modern ICP format (established early 1990s).
 * 90-99 -> 1990-1999
 * 00-27 (approx) -> 2000-2027
 * 28-89 -> unsupported gap
 */
function resolveModernICPYear(twoDigit: number): number | null {
  if (twoDigit >= 90) {
    return 1900 + twoDigit;
  }
  
  const currentYear = new Date().getFullYear();
  const currentTwoDigit = currentYear % 100;
  
  // Allow up to one year into the future for late-year manufacturing runs
  if (twoDigit <= currentTwoDigit + 1) {
    return 2000 + twoDigit;
  }
  
  return null;
}

// ---------------------------------------------------------------------------
// Format: heil-modern-unitary
// ---------------------------------------------------------------------------

const heilModernUnitary: FormatRule = {
  id: 'heil-modern-unitary',
  name: 'Modern ICP Unitary Format',
  description:
    'Standard 10-character format used by Heil and ICP sister brands from roughly 1990 to present. ' +
    'The first letter is a plant code, followed by the two-digit year, two-digit week, and sequence.',
  yearRange: [1990, null],
  productTypes: ['furnace', 'air-conditioner', 'heat-pump', 'package-unit'],
  sources: HEIL_MODERN_SOURCES,

  matches(input: NormalizedInput): boolean {
    return MODERN_PATTERN.test(input.withoutSpaces);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.withoutSpaces.match(MODERN_PATTERN);
    if (!match) return null;

    const plantCode = match[1].toUpperCase();
    const yearTwoDigit = parseInt(match[2], 10);
    const week = parseInt(match[3], 10);
    const sequence = match[4];

    const fullYear = resolveModernICPYear(yearTwoDigit);
    if (fullYear === null) {
      return {
        error: 'insufficient-info',
        explanation: `The year portion "${match[2]}" falls in an unsupported gap for this format. The modern 10-character format was established in the early 1990s, making years 1928-1989 and future years invalid for this structure.`,
      };
    }

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Plant code "${plantCode}" is followed by the year (${match[2]} = ${fullYear}) ` +
        `and week (${match[3]} = week ${week}).`,
      warnings: [],
      metadata: { plantCode, sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Format: heil-quaker-decade
// ---------------------------------------------------------------------------

const heilQuakerDecade: FormatRule = {
  id: 'heil-quaker-decade',
  name: 'Heil-Quaker Decade Format',
  description:
    'Legacy 9-character format used in the 1970s and 1980s. ' +
    'The first letter dictates the decade (G=1970s, H=1980s), followed by the single-digit year and two-digit week.',
  yearRange: [1970, 1989],
  productTypes: [],
  sources: HEIL_LEGACY_SOURCES,

  matches(input: NormalizedInput): boolean {
    return LEGACY_QUAKER_PATTERN.test(input.withoutSpaces);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.withoutSpaces.match(LEGACY_QUAKER_PATTERN);
    if (!match) return null;

    const decadeLetter = match[1].toUpperCase();
    const yearDigit = parseInt(match[2], 10);
    const week = parseInt(match[3], 10);
    const sequence = match[4];

    let baseYear = 1970;
    let decadeDisplay = '1970s';
    if (decadeLetter === 'H') {
      baseYear = 1980;
      decadeDisplay = '1980s';
    }

    const fullYear = baseYear + yearDigit;

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `The starting letter "${decadeLetter}" indicates the ${decadeDisplay}. ` +
        `The next digit "${match[2]}" represents the year (${fullYear}), ` +
        `followed by the week (${match[3]} = week ${week}).`,
      warnings: [],
      metadata: { decadeLetter, sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Format: heil-ductless-modern
// ---------------------------------------------------------------------------

const heilDuctlessModern: FormatRule = {
  id: 'heil-ductless-modern',
  name: 'ICP Ductless Format (Newer)',
  description:
    '11-character Midea OEM format used for modern ICP ductless mini-split systems.',
  yearRange: [2020, null],
  productTypes: [],
  sources: HEIL_DUCTLESS_SOURCES,

  matches(input: NormalizedInput): boolean {
    return DUCTLESS_NEWER_PATTERN.test(input.withoutSpaces);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.withoutSpaces.match(DUCTLESS_NEWER_PATTERN);
    if (!match) return null;

    const yearTwoDigit = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);
    const sequence = match[3];

    // Midea ductless formats safely use a 2000s base.
    const fullYear = 2000 + yearTwoDigit;

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `After the starting "V", the next digits indicate the year (${match[1]} = ${fullYear}) ` +
        `and week (${match[2]} = week ${week}).`,
      warnings: ['This format is specific to ductless mini-split systems.'],
      metadata: { sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Format: heil-ductless-legacy
// ---------------------------------------------------------------------------

const heilDuctlessLegacy: FormatRule = {
  id: 'heil-ductless-legacy',
  name: 'ICP Ductless Format (Older)',
  description:
    '10-character Midea OEM format used for older ICP ductless mini-split systems.',
  yearRange: [2010, 2019], // Approximate, replaced by newer 11-char format
  productTypes: [],
  sources: HEIL_DUCTLESS_SOURCES,

  matches(input: NormalizedInput): boolean {
    return DUCTLESS_OLDER_PATTERN.test(input.withoutSpaces);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.withoutSpaces.match(DUCTLESS_OLDER_PATTERN);
    if (!match) return null;

    const yearTwoDigit = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);
    const sequence = match[3];

    // Midea ductless formats safely use a 2000s base.
    const fullYear = 2000 + yearTwoDigit;

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `The first digits indicate the year (${match[1]} = ${fullYear}) ` +
        `and week (${match[2]} = week ${week}), followed by an internal "V" separator.`,
      warnings: ['This format is specific to ductless mini-split systems.'],
      metadata: { sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Format: heil-legacy-numeric (Unsupported Explicit Rejection)
// ---------------------------------------------------------------------------

const heilLegacyNumeric: FormatRule = {
  id: 'heil-legacy-numeric',
  name: 'Legacy 6-Digit Numeric',
  description: 'Pre-1970s format relying on a single digit for the year.',
  yearRange: [1950, 1969],
  productTypes: [],
  sources: [], // Explicitly rejected

  matches(input: NormalizedInput): boolean {
    return LEGACY_NUMERIC_PATTERN.test(input.withoutSpaces);
  },

  decode(): FormatDecodeResult {
    // We intentionally reject this because the decade is ambiguous.
    // e.g. "297448" could be 1962 or 1952.
    return {
      error: 'insufficient-info',
      explanation:
        'This 6-digit numeric serial appears to be a pre-1970s format where the first digit represents ' +
        'the final digit of the year. Because there is no decade indicator, it is impossible to determine ' +
        'the exact year from the serial number alone. Visual inspection of the unit is required.',
    };
  },
};

// ---------------------------------------------------------------------------
// Export all Heil format rules
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  heilModernUnitary,
  heilQuakerDecade,
  heilDuctlessModern,
  heilDuctlessLegacy,
  heilLegacyNumeric,
];
