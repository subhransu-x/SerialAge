import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { AMANA_MODERN_SOURCES } from './sources';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Standard 10-digit numeric format: YYMMXXXXXX */
const STANDARD_10_PATTERN = /^\d{10}$/;

// ---------------------------------------------------------------------------
// Format 1: amana-modern-10
// ---------------------------------------------------------------------------

const amanaModern10: FormatRule = {
  id: 'amana-modern-10',
  name: 'Amana Modern (10-Digit)',
  description:
    'Standard Amana HVAC serial number format. ' +
    '10-character numeric format: YYMMXXXXXX where YY=year, MM=month.',
  yearRange: [1997, null], // Century cannot be safely resolved from YYMM
  productTypes: [],
  sources: AMANA_MODERN_SOURCES,

  matches(input: NormalizedInput): boolean {
    return STANDARD_10_PATTERN.test(input.normalized);
  },

  decode(input: NormalizedInput): FormatDecodeResult {
    const s = input.normalized;

    const yearDigits = s.substring(0, 2);
    const monthDigits = s.substring(2, 4);

    // Validate month limits
    const month = parseInt(monthDigits, 10);
    if (month < 1 || month > 12) {
      return null; // Let the pipeline try other matches or return unsupported
    }

    // The Amana YYMM format cannot establish the century from the serial alone.
    // It also collides with the Amana Appliance YYWW format (where WW=01-12).
    // We return a successful parse with year=null, and provide warnings.
    return {
      year: null,
      month,
      week: null,
      day: null,
      productType: 'unknown',
      explanation: 'Decoded as standard Amana 10-digit format (YYMM).',
      warnings: [
        'Century cannot be safely established from the serial alone.',
        'If this is an Amana appliance rather than HVAC, this serial may actually be YYWW (Year-Week) format instead of YYMM.',
      ],
      segments: [
        {
          startIndex: 0,
          endIndex: 2,
          field: 'Year Code',
          value: yearDigits,
          description: 'Two-digit year (century not encoded).',
        },
        {
          startIndex: 2,
          endIndex: 4,
          field: 'Month Code',
          value: monthDigits,
          description: 'Two-digit production month.',
        },
        {
          startIndex: 4,
          endIndex: 10,
          field: 'Sequence',
          value: s.substring(4, 10),
          description: '6-digit production sequence number.',
        },
      ],
      metadata: {},
    };
  },
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const formats: readonly FormatRule[] = [
  amanaModern10
];
