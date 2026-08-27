// Template: Manufacturer registration file
// Copy this folder and customize for your manufacturer.
// See README.md in this directory for full instructions.

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'CHANGE_ME',        // lowercase kebab-case, must match folder name
  name: 'CHANGE_ME',      // Human-readable display name
  formats,
};

registerManufacturer(definition);
