// Template: Format rules for a manufacturer
// Each entry in this array is one historical serial-number format.
// See README.md for full instructions.

import type { FormatRule } from '../../types';

export const formats: FormatRule[] = [
  // Add your FormatRule objects here.
  // See README.md for the complete structure and examples.
  //
  // Example skeleton:
  // {
  //   id: 'brand-era-name',
  //   name: 'Human Readable Format Name',
  //   description: 'Description of when/where this format applies',
  //   yearRange: [2010, null],
  //   productTypes: [],
  //   sources: [{ name: '...', url: '...', dateReviewed: '...', notes: '...', confidence: 'verified' }],
  //   matches: (input) => false,
  //   decode: (input) => null,
  // },
];
