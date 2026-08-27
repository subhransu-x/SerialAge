/**
 * Trane manufacturer registration.
 *
 * Registers the Trane serial number decoder with the pipeline engine.
 * Also covers American Standard (same parent company, same serial format).
 *
 * Source of truth: trane_implementation_contract.md
 * Research audit:  trane_research_audit.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'trane',
  name: 'Trane',
  formats,
};

registerManufacturer(definition);
