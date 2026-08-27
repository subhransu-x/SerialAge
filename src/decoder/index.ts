/**
 * HVAC Serial Number Age Decoder — Public API
 *
 * Usage:
 *   import { decode, getAllManufacturers, isSuccessResult } from './decoder';
 *
 *   const result = decode('carrier', 'ABC123DEF');
 *   if (isSuccessResult(result)) {
 *     console.log(result.manufactureDate);   // { year: 2019, month: 3, ... }
 *     console.log(result.approximateAge);    // { years: 6, months: 5, display: '...' }
 *   }
 */

// Trigger all manufacturer registrations via side-effect imports
import './manufacturers';

// Re-export the public API
export { decode } from './engine/pipeline';
export type { DecodeOptions } from './engine/pipeline';
export {
  getAllManufacturers,
  getManufacturer,
  hasManufacturer,
} from './engine/registry';

// Re-export all types for consumer use
export type {
  // Source provenance
  SourceReference,
  SourceConfidence,
  // Manufacturer & format rules
  ProductType,
  NormalizedInput,
  DecodedData,
  DecodeSegment,
  FormatRuleError,
  FormatDecodeResult,
  FormatRule,
  ManufacturerDefinition,
  // Decode results
  DecodeStatus,
  Confidence,
  ManufactureDate,
  ApproximateAge,
  DecodeCandidate,
  DecodeResult,
  // Test cases
  DecoderTestCase,
} from './types';

// Re-export type guards
export {
  isSuccessResult,
  isAmbiguousResult,
  isFailedResult,
  hasDateInfo,
} from './types';
