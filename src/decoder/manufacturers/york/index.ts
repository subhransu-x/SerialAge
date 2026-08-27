/**
 * York manufacturer registration.
 *
 * Registers the York serial number decoder with the pipeline engine.
 * Covers modern (post-2004) and legacy (1971-2004) formats.
 *
 * Source of truth: york_implementation_contract.md
 * Research audit:  york_research_audit.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'york',
  name: 'York',
  formats,
};

registerManufacturer(definition);
