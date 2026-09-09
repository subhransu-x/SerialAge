/**
 * Carrier serial number format rules.
 *
 * Implements formats approved for production use:
 * 1. carrier-wwyy-standard  (Style 1, ~1980–present)
 * 2. carrier-yymm-legacy    (Style 2, ~1980–1989)
 * 3. carrier-style3-us      (Style 3 US,  1980–1984)
 * 4. carrier-style3-ca      (Style 3 CA,  1980–1984)
 * 5a. carrier-style4-unambiguous  (Style 4, 1969–1979, year digit 0–8)
 * 5b. carrier-style4-1969         (Style 4, 1969, year digit 9 → 1969 candidate)
 * 5c. carrier-style4-1979         (Style 4, 1979, year digit 9 → 1979 candidate)
 *    5b and 5c both match digit-9 serials so the pipeline produces status=ambiguous.
 *
 * Plus explicit unsupported handling for Style 6.
 *
 * Source of truth: carrier_specification.md
 * Research update: Phase 1 & 2 (2026-09-09)
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import {
  WWYY_SOURCES,
  YYMM_SOURCES,
  LEGACY_UNSUPPORTED_SOURCES,
  STYLE3_SOURCES,
  STYLE4_SOURCES,
} from './sources';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Structural regex for WWYY format: 4 digits + 1 letter + 5 digits = 10 chars */
const WWYY_PATTERN = /^\d{4}[A-Z]\d{5}$/;

/** Structural regex for YYMM format: 9 digits = 9 chars */
const YYMM_PATTERN = /^\d{9}$/;

/**
 * Style 3 US:  Month letter (M,N,P,Q,R,S,T,V,W,X,Y,Z) + year digit (0-4) + 6 alphanumeric = 8 chars
 * Letters O and U are skipped.
 */
const STYLE_3_US_PATTERN = /^[MNPQRSTVWXYZ]\d[A-Z0-9]{6}$/;

/**
 * Style 3 CA:  year digit (0-4) + month letter (M,N,P,Q,R,S,T,V,W,X,Y,Z) + 6 alphanumeric = 8 chars
 */
const STYLE_3_CA_PATTERN = /^\d[MNPQRSTVWXYZ][A-Z0-9]{6}$/;

/**
 * Style 4: Month letter (A-L) + year digit (0-9) + 5 digits = 7 chars
 * A-L = January-December. M belongs to Style 3 — must NOT overlap.
 * Year digit 9 is ambiguous (1969 or 1979). All other digits are unambiguous.
 */
const STYLE_4_PATTERN = /^[A-L]\d{6}$/;

/** Style 6: 1-2 digits + letter + remaining digits — NOT safe to decode, kept as unsupported trap */
const STYLE_6_PATTERN = /^\d{1,2}[A-Z]\d{4,7}$/;

/** The unsupported format explanation for Style 6 */
const STYLE_6_UNSUPPORTED_EXPLANATION =
  'This serial number matches the Style 6 pattern (1960s–1970s week + letter year code). ' +
  'This format cannot be reliably decoded due to insufficient verified examples and pattern collision risk. ' +
  'Check the data plate for a printed manufacture date.';

// ---------------------------------------------------------------------------
// Year century resolution threshold
// ---------------------------------------------------------------------------

/**
 * Century resolution for 2-digit years in WWYY format.
 *
 * Updated per Phase 2 research (2026-09-09):
 * - YY >= 80 → 1980–1999 (1900 + YY)
 * - YY <  80 → 2000–2079 (2000 + YY)
 *
 * Sources confirm WWYY format in use from ~1980. The previous threshold of 85
 * was an unsubstantiated internal assumption that caused 1980–1984 serials to
 * decode to 2080–2084 (incorrect). Threshold lowered to 80.
 */
const WWYY_CENTURY_THRESHOLD = 80;

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

const TRANSITIONAL_ERA_START = 1980;
const TRANSITIONAL_ERA_END = 1984;

const TRANSITIONAL_ERA_WARNING =
  'Transitional era (1980–1984). The WWYY format was being adopted alongside older formats. ' +
  'Verify with the printed data plate if possible.';

const YYMM_WARNING =
  'Older Carrier units (1980s) — manufacture date may be approximate. Verify with data plate.';

// ---------------------------------------------------------------------------
// Style 3 — Month letter mappings
// ---------------------------------------------------------------------------

/**
 * Style 3 month letter map.
 * Verified from BIC: Letters O and U are skipped.
 *
 * M=Jan, N=Feb, P=Mar, Q=Apr, R=May, S=Jun, T=Jul, V=Aug, W=Sep, X=Oct, Y=Nov, Z=Dec
 */
const STYLE_3_MONTH_MAP: Record<string, number> = {
  M: 1, N: 2, P: 3, Q: 4, R: 5, S: 6, T: 7, V: 8, W: 9, X: 10, Y: 11, Z: 12,
};

// ---------------------------------------------------------------------------
// Style 4 — Month letter mappings
// ---------------------------------------------------------------------------

/**
 * Style 4 month letter map (1969–1979).
 * A=January through L=December. Letters I is not used for month-ambiguity reasons.
 * Standard documented mapping from BIC: A=Jan, B=Feb, C=Mar, D=Apr, E=May, F=Jun,
 * G=Jul, H=Aug, I=Sep, J=Oct, K=Nov, L=Dec.
 *
 * Note: BIC does not explicitly state I is skipped. The format A-L = 12 letters maps
 * cleanly to 12 months, so all of A–L are included.
 */
const STYLE_4_MONTH_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12,
};

// ---------------------------------------------------------------------------
// Format 1: carrier-wwyy-standard
// ---------------------------------------------------------------------------

const carrierWwyyStandard: FormatRule = {
  id: 'carrier-wwyy-standard',
  name: 'Carrier WWYY Standard',
  description:
    'Standard Carrier/Bryant/Payne serial number format (~1980–present). ' +
    '10-character format: WWYYAXXXXX where WW=week, YY=year, A=plant code, XXXXX=sequence.',
  yearRange: [1980, null],
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

    // Century resolution per updated threshold (80, not 85)
    const fullYear = yearTwoDigit >= WWYY_CENTURY_THRESHOLD
      ? 1900 + yearTwoDigit
      : 2000 + yearTwoDigit;

    // Build warnings
    const warnings: string[] = [];
    if (fullYear >= TRANSITIONAL_ERA_START && fullYear <= TRANSITIONAL_ERA_END) {
      warnings.push(TRANSITIONAL_ERA_WARNING);
    }

    // Transitional era (1985-1989) overlap with YYMM format
    if (fullYear >= 1985 && fullYear <= 1989) {
      warnings.push(
        'Transitional era (1985–1989). Format is highly likely, but verify with the printed data plate if possible.',
      );
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
// Format 3: carrier-style3-us (1980–1984, US format)
// ---------------------------------------------------------------------------

const STYLE3_WARNING =
  'Style 3 serial (1980–1984). Older format — verify with the printed data plate if possible.';

const carrierStyle3Us: FormatRule = {
  id: 'carrier-style3-us',
  name: 'Carrier Style 3 US',
  description:
    'Carrier/BDP serial number format (1980–1984, US units). ' +
    '8-character format: [MonthLetter][YearDigit][6 alphanumeric]. ' +
    'Month letter M–Z (excluding O and U): M=Jan, N=Feb, P=Mar, Q=Apr, R=May, S=Jun, ' +
    'T=Jul, V=Aug, W=Sep, X=Oct, Y=Nov, Z=Dec. Year digit 0–4 = 1980–1984.',
  yearRange: [1980, 1984],
  productTypes: [],
  sources: STYLE3_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    if (s.length !== 8) return false;
    if (!STYLE_3_US_PATTERN.test(s)) return false;
    // Year digit must be 0-4
    const yearDigit = parseInt(s[1], 10);
    return yearDigit >= 0 && yearDigit <= 4;
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    const monthLetter = s[0];
    const yearDigit = parseInt(s[1], 10);

    const month = STYLE_3_MONTH_MAP[monthLetter];
    if (month === undefined) return null;

    if (yearDigit < 0 || yearDigit > 4) return null;

    const fullYear = 1980 + yearDigit;

    return {
      year: fullYear,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Position 1 is the month letter code (M–Z, excluding O and U). ' +
        'Position 2 is the year digit (0=1980, 1=1981, 2=1982, 3=1983, 4=1984).',
      warnings: [STYLE3_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Month',
          value: monthLetter,
          description: `Month ${month} of manufacture (letter code)`,
        },
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Year',
          value: String(yearDigit),
          description: `Year ${fullYear} of manufacture`,
        },
      ],
      metadata: {
        sequence: s.substring(2),
        region: 'US',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 4: carrier-style3-ca (1980–1984, Canadian format)
// ---------------------------------------------------------------------------

const carrierStyle3Ca: FormatRule = {
  id: 'carrier-style3-ca',
  name: 'Carrier Style 3 Canada',
  description:
    'Carrier/BDP serial number format (1980–1984, Canadian units). ' +
    '8-character format: [YearDigit][MonthLetter][6 alphanumeric]. ' +
    'Month letter M–Z (excluding O and U): M=Jan, N=Feb, P=Mar, Q=Apr, R=May, S=Jun, ' +
    'T=Jul, V=Aug, W=Sep, X=Oct, Y=Nov, Z=Dec. Year digit 0–4 = 1980–1984.',
  yearRange: [1980, 1984],
  productTypes: [],
  sources: STYLE3_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    if (s.length !== 8) return false;
    if (!STYLE_3_CA_PATTERN.test(s)) return false;
    // Year digit must be 0-4
    const yearDigit = parseInt(s[0], 10);
    return yearDigit >= 0 && yearDigit <= 4;
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    const yearDigit = parseInt(s[0], 10);
    const monthLetter = s[1];

    const month = STYLE_3_MONTH_MAP[monthLetter];
    if (month === undefined) return null;

    if (yearDigit < 0 || yearDigit > 4) return null;

    const fullYear = 1980 + yearDigit;

    return {
      year: fullYear,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Position 1 is the year digit (0=1980, 1=1981, 2=1982, 3=1983, 4=1984). ' +
        'Position 2 is the month letter code (M–Z, excluding O and U). ' +
        'This is the Canadian format — the US version reverses the year and month positions.',
      warnings: [STYLE3_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Year',
          value: String(yearDigit),
          description: `Year ${fullYear} of manufacture`,
        },
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Month',
          value: monthLetter,
          description: `Month ${month} of manufacture (letter code)`,
        },
      ],
      metadata: {
        sequence: s.substring(2),
        region: 'CA',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 5a: carrier-style4-unambiguous (year digit 0–8, deterministic)
// ---------------------------------------------------------------------------

const STYLE4_WARNING =
  'Style 4 serial (1969–1979). Older format — verify with the printed data plate if possible.';

const carrierStyle4Unambiguous: FormatRule = {
  id: 'carrier-style4-unambiguous',
  name: 'Carrier Style 4 (1970–1978)',
  description:
    'Carrier serial number format (1969–1979). ' +
    '7-character format: [MonthLetter][YearDigit][5 digits]. ' +
    'Month letter A–L: A=Jan, B=Feb, C=Mar, D=Apr, E=May, F=Jun, G=Jul, H=Aug, ' +
    'I=Sep, J=Oct, K=Nov, L=Dec. ' +
    'Year digit 0–8 maps unambiguously to 1970–1978. ' +
    'Year digit 9 is handled by carrier-style4-1969 and carrier-style4-1979 (ambiguous).',
  yearRange: [1970, 1978],
  productTypes: [],
  sources: STYLE4_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    if (s.length !== 7) return false;
    if (!STYLE_4_PATTERN.test(s)) return false;
    // Only match unambiguous year digits (0–8)
    const yearDigit = parseInt(s[1], 10);
    return yearDigit >= 0 && yearDigit <= 8;
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    const monthLetter = s[0];
    const yearDigit = parseInt(s[1], 10);

    const month = STYLE_4_MONTH_MAP[monthLetter];
    if (month === undefined) return null;

    // Digit 0=1970, 1=1971 … 8=1978
    const fullYear = 1970 + yearDigit;

    return {
      year: fullYear,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Position 1 is the month letter code (A–L). ' +
        'Position 2 is the year digit (0=1970, 1=1971 … 8=1978).',
      warnings: [STYLE4_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Month',
          value: monthLetter,
          description: `Month ${month} of manufacture (letter code)`,
        },
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Year',
          value: String(yearDigit),
          description: `Year ${fullYear} of manufacture`,
        },
      ],
      metadata: {
        sequence: s.substring(2),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 5b: carrier-style4-1969 (year digit 9 → 1969 candidate)
// ---------------------------------------------------------------------------

const STYLE4_AMBIGUOUS_WARNING =
  'This Style 4 serial has year digit "9", which represents either 1969 or 1979. ' +
  'The serial itself cannot distinguish between these two years. ' +
  'Check the unit\'s ANSI certification date or the home construction year to determine the correct decade.';

const carrierStyle4Year1969: FormatRule = {
  id: 'carrier-style4-1969',
  name: 'Carrier Style 4 (1969 candidate)',
  description:
    'Carrier Style 4 serial with year digit 9 — 1969 interpretation. ' +
    'Year digit 9 is shared between 1969 and 1979. ' +
    'This rule and carrier-style4-1979 both match, causing the pipeline to return status=ambiguous.',
  yearRange: [1969, 1969],
  productTypes: [],
  sources: STYLE4_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    if (s.length !== 7) return false;
    if (!STYLE_4_PATTERN.test(s)) return false;
    return parseInt(s[1], 10) === 9;
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;
    const monthLetter = s[0];
    const month = STYLE_4_MONTH_MAP[monthLetter];
    if (month === undefined) return null;

    return {
      year: 1969,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Position 1 is the month letter code (A–L). ' +
        'Position 2 is year digit "9". In Style 4, "9" represents either 1969 (the first year of this format) or 1979.',
      warnings: [STYLE4_WARNING, STYLE4_AMBIGUOUS_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Month',
          value: monthLetter,
          description: `Month ${month} of manufacture (letter code)`,
        },
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Year (ambiguous)',
          value: '9',
          description: 'Year digit 9 — ambiguous between 1969 and 1979',
        },
      ],
      metadata: {
        sequence: s.substring(2),
        yearAmbiguity: '1969 or 1979',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 5c: carrier-style4-1979 (year digit 9 → 1979 candidate)
// ---------------------------------------------------------------------------

const carrierStyle4Year1979: FormatRule = {
  id: 'carrier-style4-1979',
  name: 'Carrier Style 4 (1979 candidate)',
  description:
    'Carrier Style 4 serial with year digit 9 — 1979 interpretation. ' +
    'Year digit 9 is shared between 1969 and 1979. ' +
    'This rule and carrier-style4-1969 both match, causing the pipeline to return status=ambiguous.',
  yearRange: [1979, 1979],
  productTypes: [],
  sources: STYLE4_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    if (s.length !== 7) return false;
    if (!STYLE_4_PATTERN.test(s)) return false;
    return parseInt(s[1], 10) === 9;
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;
    const monthLetter = s[0];
    const month = STYLE_4_MONTH_MAP[monthLetter];
    if (month === undefined) return null;

    return {
      year: 1979,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Position 1 is the month letter code (A–L). ' +
        'Position 2 is year digit "9". In Style 4, "9" represents either 1969 (the first year of this format) or 1979.',
      warnings: [STYLE4_WARNING, STYLE4_AMBIGUOUS_WARNING],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Month',
          value: monthLetter,
          description: `Month ${month} of manufacture (letter code)`,
        },
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Year (ambiguous)',
          value: '9',
          description: 'Year digit 9 — ambiguous between 1969 and 1979',
        },
      ],
      metadata: {
        sequence: s.substring(2),
        yearAmbiguity: '1969 or 1979',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Unsupported legacy formats — Style 6 only (Styles 3 and 4 now decoded above)
// ---------------------------------------------------------------------------

/**
 * Explicit unsupported rule for Style 6 only.
 *
 * Styles 3 and 4 are now handled by dedicated format rules.
 * Style 6 remains unsupported due to pattern ambiguity risks.
 *
 * Guard: only triggers if none of the above rules matched first.
 */
const carrierLegacyUnsupported: FormatRule = {
  id: 'carrier-legacy-unsupported',
  name: 'Carrier Style 6 (Unsupported)',
  description:
    'Matches the Style 6 pattern (1960s–1970s, week + letter-year code) ' +
    'that cannot be reliably decoded due to pattern collision risk and insufficient verified examples.',
  yearRange: [1960, 1979],
  productTypes: [],
  sources: LEGACY_UNSUPPORTED_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;

    // Style 6: 1-2 digits + letter + remaining digits (e.g., 46U152456)
    // Guard: must not overlap WWYY (10 chars with letter at pos 5) or YYMM (9 all-digits)
    // or Style 3 (8 chars, month-letter first) or Style 4 (7 chars, month-letter first)
    if (STYLE_6_PATTERN.test(s) && !WWYY_PATTERN.test(s)) return true;

    return false;
  },

  decode(_input: NormalizedInput): FormatDecodeResult {
    return {
      error: 'unsupported',
      explanation: STYLE_6_UNSUPPORTED_EXPLANATION,
    };
  },
};

// ---------------------------------------------------------------------------
// Export all Carrier format rules
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  carrierWwyyStandard,           // ~1980–present (most common, check first)
  carrierYymmLegacy,             // ~1980–1989
  carrierStyle3Us,               // 1980–1984 US
  carrierStyle3Ca,               // 1980–1984 Canada
  carrierStyle4Unambiguous,      // 1970–1978 (year digit 0–8, deterministic)
  carrierStyle4Year1969,         // 1969 candidate (year digit 9 — ambiguous)
  carrierStyle4Year1979,         // 1979 candidate (year digit 9 — ambiguous)
  carrierLegacyUnsupported,      // Style 6 unsupported (check last)
];
