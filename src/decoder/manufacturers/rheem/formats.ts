/**
 * Rheem serial number format rules.
 */

import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { RHEEM_STRUCTURAL_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Structural matching regex
// ---------------------------------------------------------------------------
// Modern Rheem HVAC serials are structurally represented as:
// [OPTIONAL ENGINEERING PREFIX] + [1-LETTER PLANT CODE] + [WW] + [YY] + [NUMERIC SEQUENCE]
//
// Rules:
// - Plant code is A-Z.
// - WW is 01-53.
// - YY is 00-99.
// - Numeric Sequence is at least 4 digits, anchoring to the end of the string.
//
// Because the regex strictly requires \d{4,}$ to the end of the string,
// it unambiguously identifies the structural suffix without multiple candidates.
const STRUCTURAL_PATTERN = /([A-Z])(0[1-9]|[1-4][0-9]|5[0-3])([0-9]{2})([0-9]{4,})$/i;

// ---------------------------------------------------------------------------
// Century / year resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a 2-digit year to a 4-digit year using a 50-year sliding window.
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
// Format: rheem-modern-structural
// ---------------------------------------------------------------------------

const rheemModernStructural: FormatRule = {
  id: 'rheem-modern-structural',
  name: 'Rheem Structural Format',
  description:
    'Modern Rheem and Ruud HVAC equipment format. Extracts the manufacture date structurally ' +
    'by identifying the plant letter immediately preceding the week and year digits, ' +
    'followed by a purely numeric terminal sequence.',
  yearRange: [1975, null],
  productTypes: [],
  sources: RHEEM_STRUCTURAL_SOURCES,

  matches(input: NormalizedInput): boolean {
    // Fast regex check
    const cleanStr = input.normalized.replace(/[\s-]/g, '');
    return STRUCTURAL_PATTERN.test(cleanStr);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const cleanStr = input.normalized.replace(/[\s-]/g, '');
    const match = cleanStr.match(STRUCTURAL_PATTERN);
    if (!match) return null;

    const plantLetter = match[1].toUpperCase();
    const week = parseInt(match[2], 10);
    const yearTwoDigit = parseInt(match[3], 10);
    const fullYear = resolveYear(yearTwoDigit);
    const sequence = match[4];

    // Find indices for segments. 
    // We must match against `input.normalized` to get correct visual positions.
    // So we'll map carefully or leave segments empty if we can't cleanly align.
    // Since `input.normalized` might contain hyphens, we will strip them before finding.
    // If we want segments, we must calculate positions. Since normalization handles spaces and hyphens,
    // we'll just provide basic segments if it matches exactly, otherwise we skip precise segment mapping 
    // or we map against the `normalized` string without spaces.
    // Actually, `input.normalized` has spaces stripped already, but hyphens might remain if they weren't stripped?
    // Wait, `NormalizedInput.normalized` trims whitespace and uppercases. `withoutHyphens` also removes hyphens.
    
    const warnings: string[] = [];
    let productType: 'unknown' | 'hvac' | 'water-heater' = 'unknown';

    // Water Heater Collision Rule:
    // If the serial is exactly 1 letter followed by exactly 9 digits, it matches the water heater format.
    // "M141209135 must NOT be automatically interpreted as HVAC unless the current product scope explicitly establishes it as HVAC."
    if (/^[A-Z][0-9]{9}$/i.test(cleanStr)) {
      productType = 'unknown';
      warnings.push(
        'This 10-character format is shared between Rheem HVAC equipment and Rheem Water Heaters. ' +
        'This date decode is valid for both, but this tool specializes in HVAC.'
      );
    }

    return {
      year: fullYear,
      month: null,
      week,
      day: null,
      productType,
      explanation:
        `Plant code letter "${plantLetter}" is followed by the week (${match[2]} = week ${week}) ` +
        `and year (${match[3]} = ${fullYear}) of manufacture.`,
      warnings,
      metadata: { plantLetter, sequence },
    };
  },
};

// ---------------------------------------------------------------------------
// Export all Rheem format rules
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  rheemModernStructural,
];
