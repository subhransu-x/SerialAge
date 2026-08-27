import type { ManufacturerDefinition } from '../../types';
import { registerManufacturer } from '../../engine/registry';
import { lennoxFormats } from './formats';

export const lennox: ManufacturerDefinition = {
  id: 'lennox',
  name: 'Lennox',
  formats: lennoxFormats,
};

registerManufacturer(lennox);

