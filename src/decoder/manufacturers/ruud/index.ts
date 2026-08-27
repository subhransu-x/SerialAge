/**
 * Ruud manufacturer registration.
 *
 * Registers the Ruud serial number decoder with the pipeline engine.
 * Ruud shares the same serial formats as Rheem.
 *
 * Source of truth: rheem_ruud_implementation_contract.md
 * Research audit:  rheem_ruud_research_audit.md
 */

import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: 'ruud',
  name: 'Ruud',
  formats,
};

registerManufacturer(definition);
