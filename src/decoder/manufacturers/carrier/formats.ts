/**
 * Carrier serial number format rules.
 *
 * Implements ONLY the formats approved for production use:
 * 1. carrier-wwyy-standard (Style 1, ~1985–present)
 * 2. carrier-yymm-legacy (Style 2, ~1980–1989)
 *
 * Plus explicit unsupported handling for documented legacy formats
 * (Styles 3–6) that must not be decoded.
 *
 * Source of truth: carrier_specification.md
 * Audit: carrier_spec_audit.md
 * Contract: claude_handoff.md Section 2
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { WWYY_SOURCES, YYMM_SOURCES, LEGACY_UNSUPPORTED_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Structural regex for WWYY format: 4 digits + 1 letter + 5 digits = 10 chars */
const WWYY_PATTERN = /^\d{4}[A-Z]\d{5}$/;

/** Structural regex for YYMM format: 9 digits = 9 chars */
const YYMM_PATTERN = /^\d{9}$/;

/**
 * Structural patterns for known unsupported legacy Carrier formats.
 * These match Styles 3, 4, 5, and 6 as documented in the specification.
 *
 * Style 3 (1980–1984): 8 chars, letter-digit or digit-letter start pattern
 *   US format: letter + digit + 6 alphanumeric (e.g., W4D14008)
 *   Canadian: digit + letter + 6 alphanumeric (e.g., 4WD14008)
 *
 * Style 4 (1970s): 7 chars, letter + 6 digits (e.g., A167890)
 *
 * Style 5 (1960s): 7 chars, digit + 6 digits (e.g., 6123456) — ambiguous
 *   with Style 4 length, but all-digit.
 *
 * Style 6 (1960s–1970s): digit(s) + letter + digits (e.g., 46U152456)
 *   Pattern: 1-2 digits + letter + remaining digits, ~9 chars total
 */

/** Style 4: letter (A-M, skipping I, used as month code) + digit + 5 digits = 7 chars */
const STYLE_4_PATTERN = /^[A-M]\d{6}$/;

/** Style 3 US: letter (M-Z, month code) + digit (0-4, year) + 6 alphanumeric = 8 chars */
const STYLE_3_US_PATTERN = /^[M-Z]\d[A-Z0-9]{6}$/;

/** Style 3 Canadian: digit (0-4) + letter (M-Z) + 6 alphanumeric = 8 chars */
const STYLE_3_CA_PATTERN = /^\d[M-Z][A-Z0-9]{6}$/;

/** Style 6: 1-2 digits + letter + remaining digits, total 7-10 chars. */
const STYLE_6_PATTERN = /^\d{1,2}[A-Z]\d{4,7}$/;

/** The unsupported format explanation per the specification. */
const LEGACY_UNSUPPORTED_EXPLANATION =
  'Pre-1985 serial numbers cannot be reliably decoded. ' +
  'Check the data plate for a printed manufacture date.';

// ---------------------------------------------------------------------------
// Year century resolution threshold
// ---------------------------------------------------------------------------

/**
 * Century resolution for 2-digit years in WWYY format.
 *
 * Per carrier_specification.md:
 * - YY >= 85 → 1985–1999 (1900 + YY)
 * - YY < 85  → 2000–2084 (2000 + YY)
 *
 * This threshold is based on the documented fact that Carrier did not
 * use this format before ~1985. Do NOT change without evidence.
 */
const WWYY_CENTURY_THRESHOLD = 85;

// ---------------------------------------------------------------------------
// Week validation range per specification
// ---------------------------------------------------------------------------

const MIN_WEEK = 1;
const MAX_WEEK = 52;

// ---------------------------------------------------------------------------
// YYMM legacy format era constraint
// ---------------------------------------------------------------------------

const YYMM_MIN_YEAR_2DIGIT = 80;
const YYMM_MAX_YEAR_2DIGIT = 89;

// ---------------------------------------------------------------------------
// Transitional era warning
// ---------------------------------------------------------------------------

const TRANSITIONAL_ERA_START = 1985;
const TRANSITIONAL_ERA_END = 1989;

const TRANSITIONAL_ERA_WARNING =
  'Transitional era (1980s). Format is highly likely, but verify with the printed data plate if possible.';

const YYMM_WARNING =
  'Older Carrier units (1980s) — manufacture date may be approximate. Verify with data plate.';

// ---------------------------------------------------------------------------
// Format 1: carrier-wwyy-standard
// ---------------------------------------------------------------------------

const carrierWwyyStandard: FormatRule = {
  id: 'carrier-wwyy-standard',
  name: 'Carrier WWYY Standard',
  description:
    'Standard Carrier/Bryant/Payne serial number format (~1985–present). ' +
    '10-character format: WWYYAXXXXX where WW=week, YY=year, A=plant code, XXXXX=sequence.',
  yearRange: [1985, null],
  productTypes: [],
  sources: WWYY_SOURCES,

  matches(input: NormalizedInput): boolean {
    return WWYY_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    // Extract week and year digits
    const weekDigits = s.substring(0, 2);
    const yearDigits = s.substring(2, 4);

    const week = parseInt(weekDigits, 10);
    const yearTwoDigit = parseInt(yearDigits, 10);

    // Validate week range: must be 01–52 per specification
    if (week < MIN_WEEK || week > MAX_WEEK) {
      return null;
    }

    // Century resolution per specification
    const fullYear = yearTwoDigit >= WWYY_CENTURY_THRESHOLD
      ? 1900 + yearTwoDigit
      : 2000 + yearTwoDigit;

    // Build warnings
    const warnings: string[] = [];
    if (fullYear >= TRANSITIONAL_ERA_START && fullYear <= TRANSITIONAL_ERA_END) {
      warnings.push(TRANSITIONAL_ERA_WARNING);
    }

    // Extract plant code for metadata
    const plantCode = s.charAt(4);

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        'Positions 1-2 indicate the week of manufacture. ' +
        'Positions 3-4 indicate the year of manufacture. ' +
        'Position 5 is a plant code.',
      warnings,
      segments: [
        {
          startIndex: 0,
          endIndex: 2,
          field: 'Week',
          value: weekDigits,
          description: `Week ${week} of manufacture`,
        },
        {
          startIndex: 2,
          endIndex: 4,
          field: 'Year',
          value: yearDigits,
          description: `Year ${fullYear} of manufacture`,
        },
        {
          startIndex: 4,
          endIndex: 5,
          field: 'Plant Code',
          value: plantCode,
          description: 'Manufacturing plant identifier',
        },
      ],
      metadata: {
        plantCode,
        sequenceNumber: s.substring(5, 10),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 2: carrier-yymm-legacy
// ---------------------------------------------------------------------------

const carrierYymmLegacy: FormatRule = {
  id: 'carrier-yymm-legacy',
  name: 'Carrier YYMM Legacy',
  description:
    'Legacy Carrier serial number format (~1980–1989). ' +
    '9-character all-digit format: YYMMXXXXX where YY=year (80–89), MM=month (01–12).',
  yearRange: [1980, 1989],
  productTypes: [],
  sources: YYMM_SOURCES,

  matches(input: NormalizedInput): boolean {
    return YYMM_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    // Extract year and month digits
    const yearDigits = s.substring(0, 2);
    const monthDigits = s.substring(2, 4);

    const yearTwoDigit = parseInt(yearDigits, 10);
    const month = parseInt(monthDigits, 10);

    // Validate year is in the documented 1980s era
    if (yearTwoDigit < YYMM_MIN_YEAR_2DIGIT || yearTwoDigit > YYMM_MAX_YEAR_2DIGIT) {
      return null;
    }

    // Validate month range
    if (month < 1 || month > 12) {
      return null;
    }

    const fullYear = 1900 + yearTwoDigit;

    return {
      year: fullYear,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Positions 1-2 indicate the year of manufacture. ' +
        'Positions 3-4 indicate the month of manufacture.',
      warnings: [YYMM_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 2,
          field: 'Year',
          value: yearDigits,
          description: `Year ${fullYear} of manufacture`,
        },
        {
          startIndex: 2,
          endIndex: 4,
          field: 'Month',
          value: monthDigits,
          description: `Month ${month} of manufacture`,
        },
      ],
      metadata: {
        sequenceNumber: s.substring(4, 9),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Unsupported legacy formats — explicit detection and rejection
// ---------------------------------------------------------------------------

/**
 * Explicit unsupported rule for documented legacy Carrier formats (Styles 3–6).
 *
 * This rule intentionally matches recognizable pre-1985 Carrier serial patterns
 * and returns an explicit 'unsupported' error with a specific explanation,
 * rather than letting them fall through as generic "no match found."
 *
 * IMPORTANT: This is NOT a generic catch-all. It matches ONLY the specific
 * documented patterns from the specification. Unmatched input continues
 * through the normal pipeline.
 */
const carrierLegacyUnsupported: FormatRule = {
  id: 'carrier-legacy-unsupported',
  name: 'Carrier Pre-1985 Legacy Formats',
  description:
    'Matches documented pre-1985 Carrier serial formats (Styles 3, 4, 5, 6) ' +
    'that cannot be reliably decoded due to decade ambiguity, conflicting documentation, ' +
    'or insufficient verified examples.',
  yearRange: [1960, 1984],
  productTypes: [],
  sources: LEGACY_UNSUPPORTED_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;

    // Style 4: 7 chars, letter (A-M) + 6 digits (e.g., A167890)
    if (STYLE_4_PATTERN.test(s)) return true;

    // Style 3 US: 8 chars, letter (M-Z) + digit + 6 alphanumeric (e.g., W4D14008)
    if (STYLE_3_US_PATTERN.test(s)) return true;

    // Style 3 Canadian: 8 chars, digit + letter (M-Z) + 6 alphanumeric (e.g., 4WD14008)
    if (STYLE_3_CA_PATTERN.test(s)) return true;

    // Style 6: 1-2 digits + letter + remaining digits (e.g., 46U152456)
    // But NOT if it matches WWYY (10 chars with letter at pos 5) or YYMM (9 all digits)
    if (STYLE_6_PATTERN.test(s) && !WWYY_PATTERN.test(s)) return true;

    return false;
  },

  decode(_input: NormalizedInput): FormatDecodeResult {
    return {
      error: 'unsupported',
      explanation: LEGACY_UNSUPPORTED_EXPLANATION,
    };
  },
};

// ---------------------------------------------------------------------------
// Export all Carrier format rules, ordered most-recent first
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  carrierWwyyStandard,   // ~1985–present (most common, check first)
  carrierYymmLegacy,     // ~1980–1989
  carrierLegacyUnsupported, // Pre-1985 unsupported (check last)
];
