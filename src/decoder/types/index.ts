// Types barrel — re-exports all public types from the decoder type system.

// Source provenance
export type { SourceReference, SourceConfidence } from './source';

// Manufacturer & format rules
export type {
  ProductType,
  NormalizedInput,
  DecodedData,
  DecodeSegment,
  FormatRuleError,
  FormatDecodeResult,
  FormatRule,
  ManufacturerDefinition,
} from './manufacturer';

// Decode results
export type {
  DecodeStatus,
  Confidence,
  ManufactureDate,
  ApproximateAge,
  DecodeCandidate,
  DecodeResult,
} from './result';

// Test cases
export type { DecoderTestCase } from './test-case';

// Type guards
export {
  isSuccessResult,
  isAmbiguousResult,
  isFailedResult,
  hasDateInfo,
  isFormatRuleError,
} from './guards';
