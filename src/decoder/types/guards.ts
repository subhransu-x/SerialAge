import type { DecodeResult, DecodeStatus } from './result';
import type { FormatRuleError, FormatDecodeResult } from './manufacturer';

/**
 * Type guard: result is a successful decode.
 *
 * When this returns true, TypeScript knows:
 * - `result.manufactureDate` is non-null
 * - `result.confidence` is non-null
 * - `result.formatUsed` is non-null
 */
export function isSuccessResult(
  result: DecodeResult,
): result is DecodeResult & {
  status: 'success';
  manufactureDate: NonNullable<DecodeResult['manufactureDate']>;
  approximateAge: DecodeResult['approximateAge']; // Age can be null if year is unknown
  confidence: NonNullable<DecodeResult['confidence']>;
  formatUsed: NonNullable<DecodeResult['formatUsed']>;
} {
  return result.status === 'success';
}

/**
 * Type guard: result is ambiguous (multiple conflicting decode candidates).
 *
 * When this returns true, `result.candidates` is guaranteed non-empty.
 */
export function isAmbiguousResult(
  result: DecodeResult,
): result is DecodeResult & { status: 'ambiguous' } {
  return result.status === 'ambiguous';
}

/**
 * Type guard: result is a failure (any non-success status).
 */
export function isFailedResult(
  result: DecodeResult,
): result is DecodeResult & {
  status: Exclude<DecodeStatus, 'success'>;
  manufactureDate: null;
  approximateAge: null;
} {
  return result.status !== 'success';
}

/**
 * Check if a result has usable date information.
 * True for 'success' and for individual candidates within 'ambiguous'.
 */
export function hasDateInfo(
  result: DecodeResult,
): result is DecodeResult & {
  manufactureDate: NonNullable<DecodeResult['manufactureDate']>;
} {
  return result.manufactureDate !== null;
}

/**
 * Type guard: checks if a FormatRule.decode() return value is a FormatRuleError.
 *
 * Distinguishes between:
 * - DecodedData (successful decode — has 'year' property)
 * - FormatRuleError (intentional rejection — has 'error' property)
 * - null (silent skip)
 */
export function isFormatRuleError(
  result: FormatDecodeResult,
): result is FormatRuleError {
  return result !== null && 'error' in result;
}
