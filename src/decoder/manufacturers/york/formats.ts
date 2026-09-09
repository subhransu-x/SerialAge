/**
 * York serial number format rules.
 *
 * Implements ONLY the formats approved in york_implementation_contract.md:
 *
 *   1. york-post-2004   — October 6, 2004 - Present
 *   2. york-1980-2004   — 1980 - October 5, 2004
 *   3. york-two-letter  — 1960 - 1979
 *
 * CRITICAL AMBIGUITY HANDLING:
 * The `york-1980-2004` format has a repeating year letter for K, L, M, N.
 * These letters repeat between the 1980s and 2000s. To strictly enforce ambiguity, this
 * format is internally split into two overlapping rules (`york1980to1991Cycle1`
 * and `york1992to2004Cycle2`). When K, L, M, or N matches, BOTH rules successfully
 * decode (subject to October 2004 boundaries), which allows the central decoder pipeline
 * to natively flag the result as `AMBIGUOUS`. Letters A-J and P-Y are deterministic.
 *
 * CRITICAL RULES:
 * - No guessing on ambiguous or unsupported patterns.
 * - Missing J in the month map causes an explicit skip for month resolution.
 *
 * Source of truth: york_implementation_contract.md
 * Research audit:  york_research_audit.md
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { YORK_POST_2004_SOURCES, YORK_1971_2004_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips an optional "(S)" prefix from the serial number.
 * A bare leading "S" is a legitimate plant code and is preserved.
 */
function stripYorkPrefix(normalized: string): string {
  if (normalized.startsWith('(S)')) {
    return normalized.substring(3);
  }
  return normalized;
}

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
 * Format 2: york-1980-2004
 * Regex: ^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$
 * Structure: Letter, Letter (Month), Letter (Year, excluding I,O,Q,U,Z), Letter, 6 Digits
 */
const LEGACY_PATTERN = /^[A-Z][A-HK-N][A-HJ-NPR-Y][A-Z]\d{6}$/;

/**
 * Format 3: york-two-letter (1960-1979)
 */
const TWO_LETTER_LEGACY_PATTERN = /^(KO|LO|MO|NO|PO|RO|SO|TO|VO|WO|XO|AO|BO|CO|CM|DM|EM|FM|GM|HM|JM)\d{5,9}$/;

// ---------------------------------------------------------------------------
// Mappings
// ---------------------------------------------------------------------------

/**
 * Month mapping for post-2004 and four-letter legacy formats.
 * A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, K=9, L=10, M=11, N=12
 */
const MONTH_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, K: 9, L: 10, M: 11, N: 12,
};

/**
 * Year mapping for york-1980-1991 (Cycle 1)
 */
const LEGACY_YEAR_MAP_CYCLE1: Record<string, number> = {
  K: 1980, L: 1981, M: 1982, N: 1983, P: 1984, R: 1985, S: 1986, T: 1987, V: 1988, W: 1989, X: 1990, Y: 1991,
};

/**
 * Year mapping for york-1992-2004 (Cycle 2)
 */
const LEGACY_YEAR_MAP_CYCLE2: Record<string, number> = {
  A: 1992, B: 1993, C: 1994, D: 1995, E: 1996, F: 1997, G: 1998, H: 1999, J: 2000, K: 2001, L: 2002, M: 2003, N: 2004,
};

/**
 * Year mapping for york-two-letter (1960-1979)
 */
const TWO_LETTER_YEAR_MAP: Record<string, number> = {
  KO: 1960, LO: 1961, MO: 1962, NO: 1963, PO: 1964, RO: 1965, SO: 1966, TO: 1967, VO: 1968, WO: 1969, XO: 1970,
  AO: 1971, BO: 1972, CO: 1973, CM: 1973, DM: 1974, EM: 1975, FM: 1976, GM: 1977, HM: 1978, JM: 1979,
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
    const s = stripYorkPrefix(input.normalized);
    return s.length === 10 && POST_2004_PATTERN.test(s);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = stripYorkPrefix(input.normalized);
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
// Format 2: york-1980-2004
// ---------------------------------------------------------------------------

/**
 * Cycle 1 rule for the legacy format (covers 1980-1991).
 */
const york1980to1991Cycle1: FormatRule = {
  id: 'york-1980-1991-cycle1',
  name: 'York 1980-2004 Format (1980s)',
  description:
    '10-character legacy York format. The 2nd character encodes the month and the 3rd ' +
    'character encodes the year using a 21-year cycle. This represents the 1980-1991 cycle.',
  yearRange: [1980, 1991],
  productTypes: [],
  sources: YORK_1971_2004_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = stripYorkPrefix(input.normalized);
    return s.length === 10 && LEGACY_PATTERN.test(s);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = stripYorkPrefix(input.normalized);
    if (!LEGACY_PATTERN.test(s)) return null;

    const plantCode = s[0];
    const monthLetter = s[1];
    const yearLetter = s[2];
    const typeCode = s[3];
    const sequence = s.substring(4);

    const year = LEGACY_YEAR_MAP_CYCLE1[yearLetter];
    if (year === undefined) return null; // A-J will correctly fail here, making them deterministic for cycle 2.

    const month = MONTH_MAP[monthLetter] ?? null;

    let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1980-1991 cycle. `;
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
          description: `Letter "${yearLetter}" maps to year ${year} (1980–1991 cycle)`,
        },
      ],
      metadata: { plantCode, typeCode, sequence },
    };
  },
};

/**
 * Cycle 2 rule for the legacy format (covers 1992-2004).
 */
const york1992to2004Cycle2: FormatRule = {
  id: 'york-1992-2004-cycle2',
  name: 'York 1980-2004 Format (1990s/2000s)',
  description:
    '10-character legacy York format. The 2nd character encodes the month and the 3rd ' +
    'character encodes the year using a 21-year cycle. This represents the 1992-2004 cycle.',
  yearRange: [1992, 2004],
  productTypes: [],
  sources: YORK_1971_2004_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = stripYorkPrefix(input.normalized);
    return s.length === 10 && LEGACY_PATTERN.test(s);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = stripYorkPrefix(input.normalized);
    if (!LEGACY_PATTERN.test(s)) return null;

    const plantCode = s[0];
    const monthLetter = s[1];
    const yearLetter = s[2];
    const typeCode = s[3];
    const sequence = s.substring(4);

    const year = LEGACY_YEAR_MAP_CYCLE2[yearLetter];
    if (year === undefined) {
      // P-Y will fail here, making them deterministic for cycle 1.
      return null;
    }

    const month = MONTH_MAP[monthLetter] ?? null;

    // Boundary check for October 2004 transition.
    // N = 2004. Format transitioned on Oct 6, 2004.
    // If month is M (Nov) or N (Dec), it CANNOT be 2004 in this format.
    if (year === 2004 && (monthLetter === 'M' || monthLetter === 'N')) {
      return null; // Deny cycle 2, falling back exclusively to cycle 1 (1983).
    }

    let explanation = `The 3rd character ("${yearLetter}") maps to year ${year} in the 1992-2004 cycle. `;
    if (month !== null) {
      explanation += `The 2nd character ("${monthLetter}") indicates month ${month}.`;
    } else {
      explanation += `The 2nd character ("${monthLetter}") is not a standard month code.`;
    }

    // Add a warning for October 2004 specifically.
    const warnings: string[] = [];
    if (year === 2004 && monthLetter === 'L') {
      warnings.push('October 2004 was a transition month. If manufactured after Oct 5, 2004, it would use the newer format. This may be 1983 or early Oct 2004.');
    }

    return {
      year,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation,
      warnings,
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
// Format 3: york-two-letter (1960-1979)
// ---------------------------------------------------------------------------

const yorkTwoLetterLegacy: FormatRule = {
  id: 'york-two-letter-legacy',
  name: 'York Two-Letter Format (1960-1979)',
  description: 'Historical York format utilizing specific two-letter prefixes to indicate the year.',
  yearRange: [1960, 1979],
  productTypes: [],
  sources: YORK_1971_2004_SOURCES, // Reuse legacy sources as they cover nomenclature

  matches(input: NormalizedInput): boolean {
    const s = stripYorkPrefix(input.normalized);
    return TWO_LETTER_LEGACY_PATTERN.test(s);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = stripYorkPrefix(input.normalized);
    const match = s.match(TWO_LETTER_LEGACY_PATTERN);
    if (!match) return null;

    const prefix = match[1];
    const year = TWO_LETTER_YEAR_MAP[prefix];
    if (year === undefined) return null; // Failsafe

    const explanation = `The two-letter prefix "${prefix}" indicates the year ${year}.`;

    return {
      year,
      month: null, // Month is not encoded in this prefix format
      week: null,
      day: null,
      productType: 'unknown',
      explanation,
      warnings: [],
      segments: [
        {
          startIndex: 0,
          endIndex: 2,
          field: 'Year Prefix',
          value: prefix,
          description: `Prefix "${prefix}" maps to year ${year}`,
        },
      ],
      metadata: { sequence: s.substring(2) },
    };
  },
};

// ---------------------------------------------------------------------------
// Export all York format rules
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  yorkPost2004,
  york1992to2004Cycle2,
  york1980to1991Cycle1,
  yorkTwoLetterLegacy,
];
