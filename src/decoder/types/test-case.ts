import type { DecodeStatus, Confidence } from './result';
import type { ProductType } from './manufacturer';
import type { SourceReference } from './source';

/**
 * A single verified test case for a decoding format.
 *
 * These are used both in automated tests AND as living documentation
 * of known serial number formats.
 *
 * IMPORTANT: All test serial numbers must come from published decoder
 * charts, manufacturer documentation, or verified real-world units.
 * Do NOT fabricate serial numbers.
 */
export interface DecoderTestCase {
  /** Human-readable description of what this test verifies */
  readonly description: string;

  /** The manufacturer ID this test applies to */
  readonly manufacturerId: string;

  /** The raw serial number input (exactly as a user would type) */
  readonly serialNumber: string;

  /** Expected decode status */
  readonly expectedStatus: DecodeStatus;

  /** Expected format rule ID that should match (null if no match expected) */
  readonly expectedFormatId: string | null;

  /** Expected manufacture year (null if decode should fail) */
  readonly expectedYear: number | null;

  /** Expected manufacture month (null if format doesn't encode month) */
  readonly expectedMonth: number | null;

  /** Expected confidence level (null if decode should fail) */
  readonly expectedConfidence: Confidence | null;

  /** Expected product type (null if not determinable) */
  readonly expectedProductType: ProductType | null;

  /** Source reference for this specific test case's expected values */
  readonly source: SourceReference | null;

  /** Notes about this test case (edge cases, caveats, etc.) */
  readonly notes: string;
}
