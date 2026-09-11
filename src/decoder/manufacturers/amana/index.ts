import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

/**
 * Amana Manufacturer Definition
 *
 * Amana was acquired by Goodman in 1997. The supported modern Amana format
 * uses the exact same 10-digit YYMM structure as Goodman.
 * Older dashed or spaced historical Amana formats are not supported.
 */

export const amana: ManufacturerDefinition = {
  id: 'amana',
  name: 'Amana',
  formats,
};

registerManufacturer(amana);
