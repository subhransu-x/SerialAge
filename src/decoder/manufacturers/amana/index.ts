import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition, FormatRule } from '../../types';
import { formats as goodmanFormats } from '../goodman/formats';
import { AMANA_MODERN_SOURCES } from './sources';

/**
 * Amana Manufacturer Definition
 *
 * Amana was acquired by Goodman in 1997. The supported modern Amana format
 * uses the exact same 10-digit YYMM structure as Goodman.
 * Older dashed or spaced historical Amana formats are not supported.
 */

// We only approve the modern 10-digit format for Amana.
const goodmanStandard10 = goodmanFormats.find((f) => f.id === 'goodman-standard-10');

if (!goodmanStandard10) {
  throw new Error('Required goodman-standard-10 format rule not found.');
}

const wrappedFormats: FormatRule[] = [
  {
    ...goodmanStandard10,
    name: 'Amana Modern (10-Digit)',
    description:
      'Standard Amana HVAC serial number format (post-1997). ' +
      '10-character numeric format: YYMMXXXXXX where YY=year, MM=month.',
    sources: AMANA_MODERN_SOURCES,
  },
];

export const amana: ManufacturerDefinition = {
  id: 'amana',
  name: 'Amana',
  formats: wrappedFormats,
};

registerManufacturer(amana);
