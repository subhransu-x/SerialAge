/**
 * Carrier manufacturer registration.
 *
 * Registers the Carrier serial number decoder with the pipeline.
 * Covers Carrier, Bryant, and Payne residential HVAC equipment
 * (same parent company, same serial format).
 *
 * Source of truth: carrier_specification.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'carrier',
  name: 'Carrier',
  formats,
};

registerManufacturer(definition);
