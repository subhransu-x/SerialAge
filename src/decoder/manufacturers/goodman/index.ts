/**
 * Goodman manufacturer registration.
 *
 * Registers the Goodman serial number decoder with the pipeline.
 * Covers Goodman and Amana residential HVAC equipment.
 *
 * Source of truth: goodman_implementation_contract.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'goodman',
  name: 'Goodman',
  formats,
};

registerManufacturer(definition);
