import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { STANDARD_10_SOURCES, LEGACY_PTAC_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Standard 10-digit numeric format: YYMMXXXXXX */
const STANDARD_10_PATTERN = /^\d{10}$/;

/** Legacy PTAC format: Ends in P or D, contains letters in prefix */
// Usually 1-3 digits/letters at start, ending with P or D
// Just look for the trailing P or D and the presence of any letter in the first 3 chars
const LEGACY_PTAC_PATTERN = /^.?[A-Z].*[PD]$/;

/** The unsupported format explanation */
const LEGACY_PTAC_EXPLANATION =
  'Pre-2012 Goodman PTAC units used a letter-based serial format that cannot be reliably decoded. ' +
  'Please check the data plate for a printed manufacture date.';

// ---------------------------------------------------------------------------
// Year logic constraints
// ---------------------------------------------------------------------------
// Goodman started HVAC in 1982.
// YY >= 82 is 1900s, YY < 82 is 2000s.
const GOODMAN_MIN_YEAR = 1982;
const CENTURY_THRESHOLD = 82; // 82 to 99 = 1900s

// ---------------------------------------------------------------------------
// Format 1: goodman-standard-10
// ---------------------------------------------------------------------------

const goodmanStandard10: FormatRule = {
  id: 'goodman-standard-10',
  name: 'Goodman Standard (10-Digit)',
  description:
    'Standard Goodman serial number format (~1982–present). ' +
    '10-character numeric format: YYMMXXXXXX where YY=year, MM=month.',
  yearRange: [1982, null],
  productTypes: [],
  sources: STANDARD_10_SOURCES,

  matches(input: NormalizedInput): boolean {
    return STANDARD_10_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    const yearDigits = s.substring(0, 2);
    const monthDigits = s.substring(2, 4);

    const yearTwoDigit = parseInt(yearDigits, 10);
    const month = parseInt(monthDigits, 10);

    // Validate month
    if (month < 1 || month > 12) {
      return null;
    }

    // Resolve century
    const fullYear = yearTwoDigit >= CENTURY_THRESHOLD
      ? 1900 + yearTwoDigit
      : 2000 + yearTwoDigit;

    // Validate year is not before Goodman existed in HVAC
    if (fullYear < GOODMAN_MIN_YEAR) {
      return null;
    }

    return {
      year: fullYear,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation:
        'Positions 1-2 indicate the year of manufacture. ' +
        'Positions 3-4 indicate the month of manufacture.',
      warnings: [],
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
        sequenceNumber: s.substring(4, 10),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 2: goodman-legacy-ptac (Unsupported)
// ---------------------------------------------------------------------------

const goodmanLegacyPtac: FormatRule = {
  id: 'goodman-legacy-ptac',
  name: 'Goodman Legacy PTAC',
  description:
    'Matches legacy pre-2012 Goodman PTAC units with letter codes that cannot be decoded reliably.',
  yearRange: [1980, 2011],
  productTypes: ['package-unit'],
  sources: LEGACY_PTAC_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;
    return LEGACY_PTAC_PATTERN.test(s);
  },

  decode(_input: NormalizedInput): FormatDecodeResult {
    return {
      error: 'unsupported',
      explanation: LEGACY_PTAC_EXPLANATION,
    };
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  goodmanStandard10,
  goodmanLegacyPtac,
];
