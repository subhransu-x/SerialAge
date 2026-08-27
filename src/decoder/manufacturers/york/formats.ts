/**
 * York serial number format rules.
 *
 * Implements ONLY the formats approved in york_implementation_contract.md:
 *
 *   1. york-post-2004   — October 2004 - Present
 *   2. york-1971-2004   — 1971 - October 2004
 *
 * CRITICAL AMBIGUITY HANDLING:
 * The `york-1971-2004` format has a 21-year cyclical year letter. Letters A-N
 * repeat between the 1970s and 1990s/2000s. To strictly enforce ambiguity, this
 * format is internally split into two overlapping rules (`york-1971-2004-cycle1`
 * and `york-1971-2004-cycle2`). When an A-N letter matches, BOTH rules successfully
 * decode, which allows the central decoder pipeline to natively flag the result
 * as `AMBIGUOUS` with the multiple candidate years. Letters P-Y will only match
 * cycle1, producing a deterministic `SUCCESS`.
 *
 * CRITICAL RULES:
 * - No guessing on ambiguous or unsupported patterns.
 * - Missing J in the month map causes an explicit skip for month resolution, but J
 *   is technically permitted in the regex `[A-HJ-N]` as specified by contract.
 *
 * Source of truth: york_implementation_contract.md
 * Research audit:  york_research_audit.md
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { YORK_POST_2004_SOURCES, YORK_1971_2004_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Regex patterns — EXACT from york_implementation_contract.md
// ---------------------------------------------------------------------------

/**
 * Format 1: york-post-2004
 * Regex: ^[A-Z][0-9][A-HK-N][0-9]\d{6}$
 * Structure: Letter, Digit, Letter (Month, excluding I,J,O,Q,U,Z), Digit, 6 Digits
 */
const POST_2004_PATTERN = /^[A-Z][0-9][A-HK-N][0-9]\d{6}$/;

/**
 * Format 2: york-1971-2004
 * Regex: ^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$
 * Structure: Letter, Letter (Month), Letter (Year, excluding I,O,Q,U,Z), Letter, 6 Digits
 */
const LEGACY_PATTERN = /^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$/;

// ---------------------------------------------------------------------------
// Mappings
// ---------------------------------------------------------------------------

/**
 * Month mapping for both formats.
 * A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, K=9, L=10, M=11, N=12
 * Note: J is omitted in the contract map. If J is encountered, it maps to null.
 */
const MONTH_MAP: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  K: 9,
  L: 10,
  M: 11,
  N: 12,
};

/**
 * Year mapping for york-1971-2004 (Cycle 1: 1971-1991)
 */
const LEGACY_YEAR_MAP_CYCLE1: Record<string, number> = {
  A: 1971,
  B: 1972,
  C: 1973,
  D: 1974,
  E: 1975,
  F: 1976,
  G: 1977,
  H: 1978,
  J: 1979,
  K: 1980,
  L: 1981,
  M: 1982,
  N: 1983,
  P: 1984,
  R: 1985,
  S: 1986,
  T: 1987,
  V: 1988,
  W: 1989,
  X: 1990,
  Y: 1991,
};

/**
 * Year mapping for york-1971-2004 (Cycle 2: 1992-2004)
 * Only goes up to N (2004). P-Y are not included because the format transitioned.
 */
const LEGACY_YEAR_MAP_CYCLE2: Record<string, number> = {
  A: 1992,
  B: 1993,
  C: 1994,
  D: 1995,
  E: 1996,
  F: 1997,
  G: 1998,
  H: 1999,
  J: 2000,
  K: 2001,
  L: 2002,
  M: 2003,
  N: 2004,
};

// ---------------------------------------------------------------------------
// Format 1: york-post-2004
// ---------------------------------------------------------------------------

const yorkPost2004: FormatRule = {
  id: 'york-post-2004',
  name: 'York Post-2004 Format',
  description:
    '10-character format used by modern York HVAC equipment (Oct 2004 - Present). ' +
    'The 2nd and 4th digits form the manufacture year. The 3rd character forms the month.',
  yearRange: [2004, null],
  productTypes: [],
  sources: YORK_POST_2004_SOURCES,

  matches(input: NormalizedInput): boolean {
    return input.normalized.length === 10 && POST_2004_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;
    const match = s.match(POST_2004_PATTERN);
    if (!match) return null;

    const plantCode = s[0];
    const digit1 = parseInt(s[1], 10);
    const monthLetter = s[2];
    const digit2 = parseInt(s[3], 10);
    const sequence = s.substring(4);

    const year = 2000 + (digit1 * 10) + digit2;
    const month = MONTH_MAP[monthLetter] ?? null;

    let explanation = `The 2nd digit ("${digit1}") and 4th digit ("${digit2}") combine to indicate the year ${year}. `;
    
    if (month !== null) {
      explanation += `The 3rd character ("${monthLetter}") indicates month ${month}.`;
    } else {
      explanation += `The 3rd character ("${monthLetter}") is not a standard month code.`;
    }

    return {
      year,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation,
      warnings: [],
      segments: [
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Year (tens)',
          value: String(digit1),
          description: `First year digit — tens place of year ${year}`,
        },
        {
          startIndex: 2,
          endIndex: 3,
          field: 'Month',
          value: monthLetter,
          description: month !== null
            ? `Month ${month} of manufacture (letter code)`
            : `Month code "${monthLetter}" (not a standard month)`,
        },
        {
          startIndex: 3,
          endIndex: 4,
          field: 'Year (units)',
          value: String(digit2),
          description: `Second year digit — units place of year ${year}`,
        },
      ],
      metadata: { plantCode, sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 2: york-1971-2004
// ---------------------------------------------------------------------------

/**
 * Cycle 1 rule for the legacy format (covers 1971-1991).
 */
const york1971to2004Cycle1: FormatRule = {
  id: 'york-1971-2004-cycle1',
  name: 'York 1971-2004 Format (1970s/1980s)',
  description:
    '10-character legacy York format. The 2nd character encodes the month and the 3rd ' +
    'character encodes the year using a 21-year cycle. This represents the 1971-1991 cycle.',
  yearRange: [1971, 1991],
  productTypes: [],
  sources: YORK_1971_2004_SOURCES,

  matches(input: NormalizedInput): boolean {
    return input.normalized.length === 10 && LEGACY_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;
    if (!LEGACY_PATTERN.test(s)) return null;

    const plantCode = s[0];
    const monthLetter = s[1];
    const yearLetter = s[2];
    const typeCode = s[3];
    const sequence = s.substring(4);

    const year = LEGACY_YEAR_MAP_CYCLE1[yearLetter];
    if (year === undefined) return null; // Shouldn't happen based on regex

    const month = MONTH_MAP[monthLetter] ?? null;

    let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1971-1991 cycle. `;
    if (month !== null) {
      explanation += `The 2nd character ("${monthLetter}") indicates month ${month}.`;
    } else {
      explanation += `The 2nd character ("${monthLetter}") is not a standard month code.`;
    }

    return {
      year,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation,
      warnings: [],
      segments: [
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Month',
          value: monthLetter,
          description: month !== null
            ? `Month ${month} of manufacture (letter code)`
            : `Month code "${monthLetter}" (not a standard month)`,
        },
        {
          startIndex: 2,
          endIndex: 3,
          field: 'Year Code',
          value: yearLetter,
          description: `Letter "${yearLetter}" maps to year ${year} (1971–1991 cycle)`,
        },
      ],
      metadata: { plantCode, typeCode, sequence },
    };
  },
};

/**
 * Cycle 2 rule for the legacy format (covers 1992-2004).
 * Letters P-Y are not matched here because they would represent 2005-2012,
 * but the format ended in Oct 2004.
 */
const york1971to2004Cycle2: FormatRule = {
  id: 'york-1971-2004-cycle2',
  name: 'York 1971-2004 Format (1990s/2000s)',
  description:
    '10-character legacy York format. The 2nd character encodes the month and the 3rd ' +
    'character encodes the year using a 21-year cycle. This represents the 1992-2004 cycle.',
  yearRange: [1992, 2004],
  productTypes: [],
  sources: YORK_1971_2004_SOURCES,

  matches(input: NormalizedInput): boolean {
    return input.normalized.length === 10 && LEGACY_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;
    if (!LEGACY_PATTERN.test(s)) return null;

    const plantCode = s[0];
    const monthLetter = s[1];
    const yearLetter = s[2];
    const typeCode = s[3];
    const sequence = s.substring(4);

    const year = LEGACY_YEAR_MAP_CYCLE2[yearLetter];
    if (year === undefined) {
      // If it's P-Y, it only exists in Cycle 1. We return null here so it doesn't conflict.
      return null;
    }

    const month = MONTH_MAP[monthLetter] ?? null;

    let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1992-2004 cycle. `;
    if (month !== null) {
      explanation += `The 2nd character ("${monthLetter}") indicates month ${month}.`;
    } else {
      explanation += `The 2nd character ("${monthLetter}") is not a standard month code.`;
    }

    return {
      year,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation,
      warnings: [],
      segments: [
        {
          startIndex: 1,
          endIndex: 2,
          field: 'Month',
          value: monthLetter,
          description: month !== null
            ? `Month ${month} of manufacture (letter code)`
            : `Month code "${monthLetter}" (not a standard month)`,
        },
        {
          startIndex: 2,
          endIndex: 3,
          field: 'Year Code',
          value: yearLetter,
          description: `Letter "${yearLetter}" maps to year ${year} (1992–2004 cycle)`,
        },
      ],
      metadata: { plantCode, typeCode, sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Export all York format rules
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  yorkPost2004,
  york1971to2004Cycle2, // 1992-2004 (checks cycle 2 first, though order doesn't matter for ambiguous resolution)
  york1971to2004Cycle1, // 1971-1991
];
