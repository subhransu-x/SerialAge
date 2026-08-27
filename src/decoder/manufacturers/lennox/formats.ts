import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';
import { LENNOX_SOURCES } from './sources';

const monthMap: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6,
  G: 7, H: 8, J: 9, K: 10, L: 11, M: 12
};

export const lennoxFormats: FormatRule[] = [
  {
    id: 'lennox-standard-10',
    name: 'Lennox Standard (10-Character)',
    description: '10 characters: positions 3-4 are year, position 5 is month letter (A-M, skipping I).',
    yearRange: [1974, null],
    productTypes: [],
    sources: LENNOX_SOURCES.modernStandard,

    matches(input: NormalizedInput): boolean {
      return /^.{2}(\d{2})([A-HJ-M]).{5}$/i.test(input.normalized);
    },

    decode(input: NormalizedInput): FormatDecodeResult {
      const match = input.normalized.match(/^.{2}(\d{2})([A-HJ-M]).{5}$/i);
      if (!match) return null;
      
      const yearRaw = parseInt(match[1], 10);
      const monthLetter = match[2].toUpperCase();
      
      const month = monthMap[monthLetter];
      
      const year = yearRaw >= 74 ? 1900 + yearRaw : 2000 + yearRaw;
      
      return {
        year,
        month,
        week: null,
        day: null,
        productType: 'unknown',
        warnings: [],
        segments: [
          {
            startIndex: 2,
            endIndex: 4,
            field: 'Year',
            value: match[1],
            description: `Year ${year} of manufacture`,
          },
          {
            startIndex: 4,
            endIndex: 5,
            field: 'Month',
            value: monthLetter,
            description: `Month ${month} of manufacture (letter code)`,
          },
        ],
        metadata: {
           plantCode: input.normalized.substring(0, 2),
           sequence: input.normalized.substring(5, 10),
        },
        explanation: 'Positions 3-4 indicate the year of manufacture. Position 5 (letter) indicates the month of manufacture.',
      };
    },
  },
];
