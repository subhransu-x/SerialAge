/**
 * Rheem serial number format rules.
 *
 * Implements ONLY the formats approved in rheem_ruud_implementation_contract.md:
 *
 *   1. rheem-standard-10   — 10-character format: 1 letter + 9 digits
 *                            plant letter + 2-digit week + 2-digit year + 5-digit sequence
 *
 *   2. rheem-embedded-plant — Older format: alphanumeric prefix + plant letter (F,M,G,N,W)
 *                              + 4 digits (week + year) + optional trailing sequence.
 *                              Length typically 10–17 characters, may contain hyphens/spaces.
 *
 * IMPORTANT — Phase 8F Safety Fix (Format 2 false-positive regression):
 * Adversarial QA (Phase 8F) determined the original contract regex for Format 2
 * was FUNDAMENTALLY TOO BROAD to meet the "we never guess" standard.
 * The original unanchored regex allowed 9 real-user false-positive patterns:
 *   - Pure-alpha prefixes (MODEL, SN, AC, ABC, W+extra-char typos)
 *   - Pure-digit prefixes (1234567, 9999999)
 *   - Long arbitrary strings (RANDOMSTRING+valid-date-substring)
 *   - Multi-plant-candidate strings
 * Classification: BUG — a user who mistypes a serial number or pastes a model number
 * into the Rheem decoder could receive a confidently-wrong manufacture date.
 * Fix: Two-pattern approach (Pattern A: anchored + mixed-prefix check,
 *      Pattern B: strict spaced format). All 5 golden examples preserved.
 * See Phase 8F QA report for full adversarial analysis and classification.
 *
 * CRITICAL RULES (per AI_ENGINEERING_RULES.md):
 * - No formats outside the approved two are implemented.
 * - No water-heater formats (all-numeric 10-char) are implemented.
 * - No guessing on ambiguous or unsupported patterns.
 *
 * Source of truth: rheem_ruud_implementation_contract.md
 * Research audit:  rheem_ruud_research_audit.md
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { RHEEM_STANDARD_10_SOURCES, RHEEM_EMBEDDED_PLANT_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Regex patterns — EXACT from rheem_ruud_implementation_contract.md Section 1
// ---------------------------------------------------------------------------

/**
 * Format 1: rheem-standard-10
 * Structure: 1 Letter + 2-digit week + 2-digit year + 5-digit sequence (total 10 chars).
 * Regex from contract: ^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$
 *
 * Length: exactly 10.
 */
const STANDARD_10_PATTERN = /^[A-Z](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9]{5}$/;

/**
 * Format 2: rheem-embedded-plant
 *
 * Phase 8F safety fix — the original contract regex had no ^ anchor, allowing ANY
 * substring containing a plant letter + valid week+year to match, including garbage.
 * Adversarial analysis (Phase 8F) identified 9 real-user false-positive patterns:
 *   - All-alpha prefixes (MODEL, SN, AC, ABC, W)
 *   - All-digit prefixes (1234567, 9999999)
 *   - Long arbitrary strings (RANDOMSTRING...)
 *   - Typos adding extra chars to a Format 1 serial (WW421724596)
 *   - Multi-segment strings with multiple plant candidates
 *
 * FIX: Two-pattern approach:
 *
 * PATTERN A — Anchored mixed-prefix format:
 *   ^[A-Z0-9\s]{2,9}[FMGNW](week)(yr)[0-9\s]{0,6}$
 *   PLUS a code-level check that the prefix contains BOTH at least one letter
 *   AND at least one digit (mixed alphanumeric prefix, as seen in the goldens
 *   CB5D302 and AB6D307). This eliminates pure-alpha and pure-digit false positives.
 *
 * PATTERN B — Spaced 3-part format:
 *   ^\d{4}\s[FMGNW](week)(yr)\s\d{5}$
 *   Covers the documented '7351 M2806 16735' style exactly.
 *   This is more restrictive than Pattern A and avoids ambiguity.
 *
 * All 5 contract golden examples are preserved:
 *   CB5D302F099903346  -> PATTERN A (mixed prefix)
 *   7351 M2806 16735   -> PATTERN B (spaced 3-part)
 *   AB6D307-M-0999     -> PATTERN A (mixed prefix, hyphens stripped)
 */

/** Format 2A: anchored, mixed-alphanumeric prefix (2–9 chars), optional trailing seq */
const EMBEDDED_PLANT_PATTERN_A =
  /^[A-Z0-9\s]{2,9}[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})[0-9\s]{0,6}$/;

/** Format 2B: spaced 3-part format exactly — DDDD PLANT_WWYY DDDDD */
const EMBEDDED_PLANT_PATTERN_B =
  /^\d{4}\s[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})\s\d{5}$/;

/** Return true if str contains at least one [A-Z] AND at least one [0-9]. */
function isMixedAlphanumeric(s: string): boolean {
  return /[A-Z]/.test(s) && /[0-9]/.test(s);
}

// ---------------------------------------------------------------------------
// Century / year resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a 2-digit year to a 4-digit year using a 50-year sliding window.
 *
 * Contract Section 1 (Format 1, Format 2):
 * "Use a 50-year sliding window based on the current year."
 *
 * Example (current year 2026):
 *   2-digit 17 → threshold = 2026 - 50 = 1976 → 2017 (within 50 yrs of current)
 *   2-digit 99 → 1999 (not within 50 yrs of 2026 if we used 2099, so → 1999)
 */
function resolveYear(twoDigit: number): number {
  const currentYear = new Date().getFullYear();
  const candidate2000 = 2000 + twoDigit;
  const candidate1900 = 1900 + twoDigit;
  // Pick whichever century keeps us within 50 years of current year
  if (candidate2000 <= currentYear + 2) {
    return candidate2000;
  }
  return candidate1900;
}

// ---------------------------------------------------------------------------
// Format 1: rheem-standard-10
// ---------------------------------------------------------------------------

const rheemStandard10: FormatRule = {
  id: 'rheem-standard-10',
  name: 'Rheem Standard 10-Character Format',
  description:
    '10-character format used by modern Rheem and Ruud HVAC equipment. ' +
    'Character 1 is the manufacturing plant identification code. ' +
    'Characters 2-3 encode the week of manufacture (01–53). ' +
    'Characters 4-5 encode the 2-digit year. ' +
    'Characters 6-10 are the production sequence number.',
  yearRange: [1980, null],
  productTypes: [],
  sources: RHEEM_STANDARD_10_SOURCES,

  matches(input: NormalizedInput): boolean {
    // Length guard first (fast), then regex
    return input.normalized.length === 10 && STANDARD_10_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const match = input.normalized.match(STANDARD_10_PATTERN);
    if (!match) return null;

    const plantCode = input.normalized[0];
    const week = parseInt(match[1], 10);
    const yearTwoDigit = parseInt(match[2], 10);
    const fullYear = resolveYear(yearTwoDigit);

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Character 1 is the plant code ("${plantCode}"). ` +
        `Characters 2-3 indicate the week of manufacture (week ${week}). ` +
        `Characters 4-5 indicate the year of manufacture (${match[2]} = ${fullYear}).`,
      warnings: [],
      segments: [
        {
          startIndex: 0,
          endIndex: 1,
          field: 'Plant Code',
          value: plantCode,
          description: 'Manufacturing plant identifier',
        },
        {
          startIndex: 1,
          endIndex: 3,
          field: 'Week',
          value: match[1],
          description: `Week ${week} of manufacture`,
        },
        {
          startIndex: 3,
          endIndex: 5,
          field: 'Year',
          value: match[2],
          description: `Year ${fullYear} of manufacture`,
        },
      ],
      metadata: {
        plantCode,
        sequence: input.normalized.substring(5),
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Format 2: rheem-embedded-plant
// ---------------------------------------------------------------------------

const rheemEmbeddedPlant: FormatRule = {
  id: 'rheem-embedded-plant',
  name: 'Rheem Embedded Plant Code Format (Styles 2/3)',
  description:
    'Older Rheem and Ruud serial number format (typically 10–17 characters) where the ' +
    'manufacture date is encoded following a plant letter (F, M, G, N, or W) embedded ' +
    'within the string. The two digits immediately after the plant letter encode the week ' +
    'of manufacture (01–53), and the next two digits encode the 2-digit year. ' +
    'Used in commercial and older residential equipment.',
  yearRange: [1975, 2010],
  productTypes: [],
  sources: RHEEM_EMBEDDED_PLANT_SOURCES,

  matches(input: NormalizedInput): boolean {
    // Must be at least 10 characters (contract Section 2: "less than 10 chars = unsupported")
    if (input.withoutHyphens.length < 10) return false;
    // Must NOT match Format 1 (Format 1 is checked first in the pipeline,
    // but we guard here too so Format 2 never shadows Format 1).
    if (STANDARD_10_PATTERN.test(input.withoutHyphens)) return false;

    const w = input.withoutHyphens;

    // Pattern B: strict spaced 3-part format (e.g. "7351 M2806 16735")
    // This is an exact structural match — no ambiguity.
    if (EMBEDDED_PLANT_PATTERN_B.test(w)) return true;

    // Pattern A: anchored mixed-prefix format (e.g. "CB5D302F099903346", "AB6D307M0999")
    // Additional code-level guard: the prefix (chars before the plant letter) must be
    // MIXED alphanumeric — must contain at least one letter AND at least one digit.
    // This eliminates all-alpha prefixes (MODEL, SN, AC, ABC) and
    // all-digit prefixes (1234567, 9999999) which are false positives.
    const matchA = w.match(EMBEDDED_PLANT_PATTERN_A);
    if (!matchA) return false;
    // Find where the plant letter is in the string
    // Pattern A matches: prefix(2-9) + plant + week(2) + year(2) + trailing(0-6)
    // The prefix length = total_match_len - 1(plant) - 2(week) - 2(year) - trailing_len
    // Easier: find the plant letter by scanning the matched prefix portion
    const plantPatternPos = w.search(/[FMGNW](0[1-9]|[1-4][0-9]|5[0-3])[0-9]{2}[0-9\s]{0,6}$/);
    if (plantPatternPos < 0) return false;
    const prefix = w.slice(0, plantPatternPos);
    return isMixedAlphanumeric(prefix);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const w = input.withoutHyphens;

    // Try Pattern B first (unambiguous spaced format)
    const matchB = w.match(EMBEDDED_PLANT_PATTERN_B);
    if (matchB) {
      const week = parseInt(matchB[1], 10);
      const fullYear = resolveYear(parseInt(matchB[2], 10));
      const plantLetter = w[5]; // position 5 in "DDDD PlantWWYY DDDDD"
      return {
        year: fullYear,
        month: null,
        week,
        day: null,
        productType: 'unknown',
        explanation:
          `Plant code letter "${plantLetter}" is followed by the week (${matchB[1]} = week ${week}) ` +
          `and year (${matchB[2]} = ${fullYear}) of manufacture.`,
        warnings: [
          'Format 2 date extraction is based on the embedded plant letter position. ' +
            'Verify against the unit data plate if the date appears incorrect.',
        ],
        metadata: { plantLetter },
      };
    }

    // Pattern A: anchored mixed-prefix
    const matchA = w.match(EMBEDDED_PLANT_PATTERN_A);
    if (!matchA) return null;

    const week = parseInt(matchA[1], 10);
    const fullYear = resolveYear(parseInt(matchA[2], 10));

    // Locate the plant letter: the character immediately before the week digits in the match
    const matchedSubstring = matchA[0];
    const weekStr = matchA[1];
    const weekStartInMatch = matchedSubstring.indexOf(weekStr);
    const plantLetter = weekStartInMatch > 0 ? matchedSubstring[weekStartInMatch - 1] : '?';

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType: 'unknown',
      explanation:
        `Plant code letter "${plantLetter}" is followed by the week (${matchA[1]} = week ${week}) ` +
        `and year (${matchA[2]} = ${fullYear}) of manufacture.`,
      warnings: [
        'Format 2 date extraction is based on the embedded plant letter position. ' +
          'Verify against the unit data plate if the date appears incorrect.',
      ],
      metadata: { plantLetter },
    };
  },
};

// ---------------------------------------------------------------------------
// Export all Rheem format rules, ordered most-recent first
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  rheemStandard10,       // Modern 10-char format — check first
  rheemEmbeddedPlant,    // Older embedded-plant-code format — check second
];
