import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { tempstarFormat } from './formats';

export const tempstar: ManufacturerDefinition = {
  id: 'tempstar',
  name: 'Tempstar',
  formats: [tempstarFormat]
};

registerManufacturer(tempstar);
