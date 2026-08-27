import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition, FormatRule } from '../../types';
import { formats as carrierFormats } from '../carrier/formats';
import { BRYANT_WWYY_SOURCES, BRYANT_YYMM_SOURCES, BRYANT_LEGACY_SOURCES } from './sources';

/**
 * Bryant Manufacturer Definition
 *
 * Bryant shares its serial number formats entirely with Carrier,
 * as it has been part of the BDP Company (Carrier) since 1955.
 */
const wrappedFormats: FormatRule[] = carrierFormats.map((f) => {
  let overrideSources = f.sources;
  if (f.id === 'carrier-wwyy-standard') overrideSources = BRYANT_WWYY_SOURCES;
  if (f.id === 'carrier-yymm-legacy') overrideSources = BRYANT_YYMM_SOURCES;
  if (f.id === 'carrier-legacy-unsupported') overrideSources = BRYANT_LEGACY_SOURCES;

  return {
    ...f,
    name: f.name.replace('Carrier', 'Bryant'),
    description: f.description.replace('Carrier/Bryant/Payne', 'Bryant'),
    sources: overrideSources,
  };
});

export const bryant: ManufacturerDefinition = {
  id: 'bryant',
  name: 'Bryant',
  formats: wrappedFormats,
};

registerManufacturer(bryant);
