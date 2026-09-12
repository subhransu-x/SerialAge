import type { FormatRule, NormalizedInput, FormatDecodeResult } from '../../types';

export const tempstarFormat: FormatRule = {
  id: 'tempstar-10-character',
  name: 'Tempstar 10-Character',
  description: 'Verified format from 1990 to present.',
  yearRange: [1990, null],
  productTypes: [],
  sources: [],
  matches: (input: NormalizedInput) => /^[A-Z]\d{9}$/i.test(input.normalized),
  decode: (input: NormalizedInput): FormatDecodeResult => {
    const serial = input.normalized;
    const plantLetter = serial.charAt(0);
    const yy = serial.slice(1, 3);
    const ww = serial.slice(3, 5);
    const sequence = serial.slice(5, 10);

    const yyNum = parseInt(yy, 10);
    
    // Explicit rejection/unsupported handling for YY 87-89
    if (yyNum === 87 || yyNum === 88 || yyNum === 89) {
      return {
        error: 'unsupported',
        explanation: 'Tempstar serial numbers from 1987-1989 are in an unsupported format era.'
      };
    }

    let year: number;
    const currentYear = new Date().getFullYear();
    const currentYearYY = currentYear % 100;

    // Century determination
    if (yyNum >= 90 && yyNum <= 99) {
      year = 1900 + yyNum;
    } else if (yyNum >= 0 && yyNum <= currentYearYY) {
      year = 2000 + yyNum;
    } else {
      return {
        error: 'unsupported',
        explanation: `Year code ${yy} is outside the verified 1990-current range.`
      };
    }

    // Validate WW
    const weekNum = parseInt(ww, 10);
    if (weekNum < 1 || weekNum > 53) {
      return null; // Return null instead of error for invalid week logic to let the pipeline handle it as a silent skip or invalid
    }

    // Determine plant location
    let plantName = 'Unknown';
    if (plantLetter === 'L') {
      plantName = 'Lewisburg, TN';
    }

    return {
      year,
      month: null,
      week: weekNum,
      day: null,
      productType: 'unknown',
      explanation: `Tempstar serial format where the 2nd and 3rd characters indicate the year (${year}) and the 4th and 5th characters indicate the week (${weekNum}).`,
      warnings: [],
      metadata: { plant: plantName },
      segments: [
        { startIndex: 0, endIndex: 1, field: 'Plant Code', value: plantLetter, description: plantName },
        { startIndex: 1, endIndex: 3, field: 'Year Code', value: yy, description: `Manufactured in ${year}` },
        { startIndex: 3, endIndex: 5, field: 'Week Code', value: ww, description: `Manufactured in week ${weekNum}` },
        { startIndex: 5, endIndex: 10, field: 'Sequence', value: sequence, description: 'Production sequence number' }
      ]
    };
  }
};
