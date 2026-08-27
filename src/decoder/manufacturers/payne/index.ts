import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition, FormatRule } from '../../types';
import { formats as carrierFormats } from '../carrier/formats';
import { PAYNE_WWYY_SOURCES, PAYNE_YYMM_SOURCES, PAYNE_LEGACY_SOURCES } from './sources';

const wrappedFormats: FormatRule[] = carrierFormats.map((f) => {
  let overrideSources = f.sources;
  if (f.id === 'carrier-wwyy-standard') overrideSources = PAYNE_WWYY_SOURCES;
  if (f.id === 'carrier-yymm-legacy') overrideSources = PAYNE_YYMM_SOURCES;
  if (f.id === 'carrier-legacy-unsupported') overrideSources = PAYNE_LEGACY_SOURCES;

  return {
    ...f,
    name: f.name.replace('Carrier', 'Payne'),
    description: f.description.replace('Carrier/Bryant/Payne', 'Payne'),
    sources: overrideSources,
  };
});

/**
 * Payne Manufacturer Definition
 *
 * Payne shares its serial number formats entirely with Carrier,
 * as it has been part of the BDP Company (Carrier) since 1955.
 */
export const payne: ManufacturerDefinition = {
  id: 'payne',
  name: 'Payne',
  formats: wrappedFormats,
};

registerManufacturer(payne);
