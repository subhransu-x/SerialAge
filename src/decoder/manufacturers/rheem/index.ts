/**
 * Rheem manufacturer registration.
 *
 * Registers the Rheem serial number decoder with the pipeline engine.
 * Also covers Ruud (same parent company, same serial format — registered separately).
 *
 * Source of truth: rheem_ruud_implementation_contract.md
 * Research audit:  rheem_ruud_research_audit.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'rheem',
  name: 'Rheem',
  formats,
};

registerManufacturer(definition);
