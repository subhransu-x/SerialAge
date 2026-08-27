/**
 * Trane serial number format rules.
 *
 * Implements ONLY the formats approved for production use in
 * trane_implementation_contract.md:
 *
 *   1. trane-modern-10  — 10-character format (2010–present)
 *   2. trane-standard-9 — 9-character format (2002–2009)
 *   3. trane-letter-9   — 9-character letter-prefix format (1983–2001)
 *
 * Plus an explicit unsupported trap for documented pre-1983 legacy formats
 * and any other structurally recognized but unsupported inputs.
 *
 * CRITICAL RULES (per AI_ENGINEERING_RULES.md):
 * - No formats outside the approved three are implemented.
 * - No guessing on ambiguous or unsupported patterns.
 * - All regex patterns come directly from trane_implementation_contract.md.
 * - The letter-year dictionary comes directly from the contract.
 *
 * Source of truth: trane_implementation_contract.md
 * Research audit:  trane_research_audit.md
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import {
  TRANE_MODERN_10_SOURCES,
  TRANE_STANDARD_9_SOURCES,
  TRANE_LETTER_9_SOURCES,
  TRANE_LEGACY_UNSUPPORTED_SOURCES,
} from './sources';

// ---------------------------------------------------------------------------
// Regex patterns — EXACT from trane_implementation_contract.md Section 4
// ---------------------------------------------------------------------------

/**
 * Format A: trane-modern-10
 * Regex from contract: /^([1-9][0-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
 * Length: exactly 10.
 */
const MODERN_10_PATTERN = /^([1-9][0-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;

/**
 * Format B: trane-standard-9
 * Regex from contract: /^([2-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
 * Length: exactly 9.
 */
const STANDARD_9_PATTERN = /^([2-9])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;

/**
 * Format C: trane-letter-9
 * Regex from contract: /^([WXYSCBDEFGHJKLMNPRZ])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/i
 * Length: exactly 9.
 * Letters I, O, Q, T, U, V are intentionally excluded (not assigned by Trane).
 */
const LETTER_9_PATTERN = /^([WXYSCBDEFGHJKLMNPRZ])(0[1-9]|[1-4][0-9]|5[0-3])[A-Z0-9]{6}$/;

/**
 * Legacy unsupported pattern: any 10-char serial starting with a letter.
 * Per contract Section 3: "Any 10-character serial starting with a letter" → Unsupported.
 * Per research audit Part 6: "Any 10-char starting with a letter → Conflicts with pre-1983 styles."
 */
const LEGACY_10_LETTER_START_PATTERN = /^[A-Z][A-Z0-9]{9}$/;

// ---------------------------------------------------------------------------
// Year-letter mapping dictionary
// EXACT from trane_implementation_contract.md Section 4 (Format C)
// and trane_research_audit.md Part 1.
// ---------------------------------------------------------------------------

const LETTER_YEAR_MAP: Readonly<Record<string, number>> = {
  W: 1983,
  X: 1984,
  Y: 1985,
  S: 1986,
  B: 1987,
  C: 1988,
  D: 1989,
  E: 1990,
  F: 1991,
  G: 1992,
  H: 1993,
  J: 1994,
  K: 1995,
  L: 1996,
  M: 1997,
  N: 1998,
  P: 1999,
  R: 2000,
  Z: 2001,
} as const;

// ---------------------------------------------------------------------------
// Unsupported explanation texts
// ---------------------------------------------------------------------------

const LEGACY_UNSUPPORTED_EXPLANATION =
  'Pre-1983 Trane serial numbers use highly variable encoding that cannot be reliably decoded. ' +
  'Check the data plate for a printed manufacture date, or consult a licensed HVAC technician.';

// ---------------------------------------------------------------------------
// Format 1: trane-modern-10 (2010 – present)
// ---------------------------------------------------------------------------

const traneModern10: FormatRule = {
  id: 'trane-modern-10',
  name: 'Trane Modern 10-Character (2010–Present)',
  description:
    '10-character alphanumeric format used by Trane from 2010 to the present. ' +
    'Characters 1-2 encode the year (e.g., "11" = 2011). ' +
    'Characters 3-4 encode the fiscal week of manufacture (01–53). ' +
    'The remaining 6 characters are a plant/sequence code.',
  yearRange: [2010, null],
  productTypes: [],
  sources: TRANE_MODERN_10_SOURCES,

  matches(input: NormalizedInput): boolean {
    // Length guard first (fast), then regex
    return input.normalized.length === 10 && MODERN_10_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.normalized.match(MODERN_10_PATTERN);
    if (!match) return null;

    const yearTwoDigit = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);

    // Century: 2010–present means year prefix is always 2000-based.
    // The regex enforces [1-9][0-9], so minimum is 10 → 2010, maximum is 99 → 2099.
    const fullYear = 2000 + yearTwoDigit;

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Characters 1-2 indicate the year of manufacture (${match[1]} = ${fullYear}). ` +
        `Characters 3-4 indicate the fiscal week of manufacture (week ${week}).`,
      warnings: [],
      segments: [
        {
          startIndex: 0,
          endIndex: 2,
          field: 'Year',
          value: match[1],
          description: `Year ${fullYear} of manufacture`,
        },
        {
          startIndex: 2,
          endIndex: 4,
          field: 'Week',
          value: match[2],
          description: `Fiscal week ${week} of manufacture`,
        },
      ],
      metadata: {
        suffix: input.normalized.substring(4),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 2: trane-standard-9 (2002 – 2009)
// ---------------------------------------------------------------------------

const traneStandard9: FormatRule = {
  id: 'trane-standard-9',
  name: 'Trane Standard 9-Character (2002–2009)',
  description:
    '9-character alphanumeric format used by Trane from 2002 to 2009. ' +
    'Character 1 encodes the last digit of the year (e.g., "8" = 2008). ' +
    'Characters 2-3 encode the fiscal week of manufacture (01–53). ' +
    'Valid first characters: 2 through 9 (2002 through 2009). ' +
    'Delineated from the 2010+ format by strict length (9 vs 10 characters).',
  yearRange: [2002, 2009],
  productTypes: [],
  sources: TRANE_STANDARD_9_SOURCES,

  matches(input: NormalizedInput): boolean {
    return input.normalized.length === 9 && STANDARD_9_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.normalized.match(STANDARD_9_PATTERN);
    if (!match) return null;

    const yearDigit = parseInt(match[1], 10);
    const week = parseInt(match[2], 10);

    // The 2002-2009 era: single digit 2-9 maps to 2002-2009.
    // Per research audit: "Character 1 = Year (e.g., '8' = 2008, '2' = 2002)."
    const fullYear = 2000 + yearDigit;

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Character 1 indicates the year of manufacture (${match[1]} = ${fullYear}). ` +
        `Characters 2-3 indicate the fiscal week of manufacture (week ${week}).`,
      warnings: [],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Year',
          value: match[1],
          description: `Year ${fullYear} of manufacture`,
        },
        {
          startIndex: 1,
          endIndex: 3,
          field: 'Week',
          value: match[2],
          description: `Fiscal week ${week} of manufacture`,
        },
      ],
      metadata: {
        suffix: input.normalized.substring(3),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 3: trane-letter-9 (1983 – 2001)
// ---------------------------------------------------------------------------

const traneLetter9: FormatRule = {
  id: 'trane-letter-9',
  name: 'Trane Letter-Prefix 9-Character (1983–2001)',
  description:
    '9-character format used by Trane from 1983 to 2001. ' +
    'Character 1 is a specific letter that maps to a manufacture year via a fixed dictionary. ' +
    'Characters 2-3 encode the fiscal week of manufacture (01–53). ' +
    'Letters I, O, Q, T, U, V are intentionally excluded from the mapping. ' +
    'Letter-year mapping: W=1983, X=1984, Y=1985, S=1986, B=1987, C=1988, D=1989, E=1990, ' +
    'F=1991, G=1992, H=1993, J=1994, K=1995, L=1996, M=1997, N=1998, P=1999, R=2000, Z=2001.',
  yearRange: [1983, 2001],
  productTypes: [],
  sources: TRANE_LETTER_9_SOURCES,

  matches(input: NormalizedInput): boolean {
    return input.normalized.length === 9 && LETTER_9_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.normalized.match(LETTER_9_PATTERN);
    if (!match) return null;

    const letter = match[1]; // Already uppercased by normalize pipeline
    const week = parseInt(match[2], 10);

    const fullYear = LETTER_YEAR_MAP[letter];

    // Defensive guard: should never happen given the regex restricts to mapped letters,
    // but protects against a dictionary/regex drift.
    if (fullYear === undefined) {
      return null;
    }

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Character 1 is a year code (letter "${letter}" = ${fullYear}). ` +
        `Characters 2-3 indicate the fiscal week of manufacture (week ${week}).`,
      warnings: [],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Year Code',
          value: letter,
          description: `Letter "${letter}" maps to year ${fullYear}`,
        },
        {
          startIndex: 1,
          endIndex: 3,
          field: 'Week',
          value: match[2],
          description: `Fiscal week ${week} of manufacture`,
        },
      ],
      metadata: {
        yearLetter: letter,
        suffix: input.normalized.substring(3),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Unsupported trap: pre-1983 and other non-decodable Trane patterns
//
// Per trane_implementation_contract.md Section 3 (Unsupported Formats):
//   - "Any 10-character serial starting with a letter."
//   - "Any serial number shorter than 9 characters."
//   - Pre-1983 formats (length 5-8 chars).
//
// Per trane_research_audit.md Part 6 (Do-Not-Decode List):
//   - 10-char starting with letter → Unsupported
//   - 7-to-8 char string          → Unsupported
//   - Pre-1983 (e.g., H011870M03) → Unsupported
//
// NOTE: The pipeline validates that strings < 3 chars are caught upstream
// by validateInput(). This rule covers 3-8 char inputs and the letter-start
// 10-char pattern that the modern-10 rule cannot match.
// ---------------------------------------------------------------------------

const traneLegacyUnsupported: FormatRule = {
  id: 'trane-legacy-unsupported',
  name: 'Trane Pre-1983 / Unsupported Legacy Formats',
  description:
    'Matches documented unsupported Trane serial patterns: ' +
    '(1) any 10-character serial starting with a letter (pre-1983 style conflict), ' +
    '(2) any string with 3–8 characters (likely pre-1983 or unknown era). ' +
    'These formats cannot be reliably decoded per trane_research_audit.md Part 6.',
  yearRange: [1970, 1982],
  productTypes: [],
  sources: TRANE_LEGACY_UNSUPPORTED_SOURCES,

  matches(input: NormalizedInput): boolean {
    const s = input.normalized;

    // Condition 1: 3–8 chars — too short for any supported format.
    // Contract Section 3: "Any serial number shorter than 9 characters."
    if (s.length >= 3 && s.length <= 8) return true;

    // Condition 2: 10-char string starting with a letter.
    // Contract Section 3: "Any 10-character serial starting with a letter."
    // The modern-10 regex requires [1-9][0-9] at the start (digit-digit), so
    // any letter-start 10-char serial will never match trane-modern-10.
    if (s.length === 10 && LEGACY_10_LETTER_START_PATTERN.test(s)) return true;

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
// Export all Trane format rules, ordered most-recent first
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  traneModern10,        // 2010–present (10 chars) — check first
  traneStandard9,       // 2002–2009 (9 chars, digit start)
  traneLetter9,         // 1983–2001 (9 chars, letter start from dictionary)
  traneLegacyUnsupported, // Pre-1983 trap (check last)
];
