import type { ProductType } from './manufacturer';
import type { DecodeSegment } from './manufacturer';
import type { SourceReference } from './source';

// ---------------------------------------------------------------------------
// Decode Status
// ---------------------------------------------------------------------------

/** Outcome status of a decode attempt */
export type DecodeStatus =
  | 'success'            // Exactly one format matched and decoded
  | 'ambiguous'          // Multiple formats matched with different results
  | 'unsupported'        // Manufacturer recognized but no format matched
  | 'invalid-input'      // Input failed basic validation (empty, too short, etc.)
  | 'insufficient-info'; // Partial match but not enough data to determine date

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

/** How confident we are in the decoded result */
export type Confidence =
  | 'high'    // Format is well-documented, unambiguous match
  | 'medium'  // Reasonable match but some uncertainty
  | 'low';    // Best guess among multiple possibilities

// ---------------------------------------------------------------------------
// Manufacture Date
// ---------------------------------------------------------------------------

/** Decoded manufacture date with variable precision */
export interface ManufactureDate {
  readonly year: number | null;
  readonly month: number | null;
  readonly week: number | null;
  readonly day: number | null;
  /** ISO 8601-like partial date string for display (e.g., "2019-03", "2019") */
  readonly display: string;
}

// ---------------------------------------------------------------------------
// Approximate Age
// ---------------------------------------------------------------------------

/** Calculated age of the equipment relative to a reference date */
export interface ApproximateAge {
  readonly years: number;
  readonly months: number;
  /** Human-readable display string (e.g., "5 years, 3 months") */
  readonly display: string;
}

// ---------------------------------------------------------------------------
// Decode Candidate
// ---------------------------------------------------------------------------

/**
 * One possible decode result when multiple formats match.
 * Used in the `candidates` array when status is 'ambiguous'.
 */
export interface DecodeCandidate {
  readonly formatUsed: {
    readonly id: string;
    readonly name: string;
  };
  readonly manufactureDate: ManufactureDate;
  readonly approximateAge: ApproximateAge | null;
  readonly confidence: Confidence;
  readonly explanation: string;
  readonly sources: readonly SourceReference[];
  readonly productType: ProductType;
  readonly warnings: readonly string[];
  /** Character-level field breakdown from the format rule, if available */
  readonly segments: readonly DecodeSegment[];
}

// ---------------------------------------------------------------------------
// Decode Result (final output of the pipeline)
// ---------------------------------------------------------------------------

/**
 * The final output of the decode pipeline.
 * Contains everything the UI needs to display results.
 */
export interface DecodeResult {
  /** Outcome status */
  readonly status: DecodeStatus;

  /** The manufacturer that was selected / matched */
  readonly manufacturer: {
    readonly id: string;
    readonly name: string;
  };

  /** Decoded manufacture date (null if decode failed) */
  readonly manufactureDate: ManufactureDate | null;

  /**
   * Approximate age of the equipment.
   * Calculated at decode time from the reference date.
   */
  readonly approximateAge: ApproximateAge | null;

  /** Confidence in the result (null if decode failed) */
  readonly confidence: Confidence | null;

  /** Which format rule produced this result (null if none matched) */
  readonly formatUsed: {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly yearRange: readonly [number, number | null];
  } | null;

  /** Product type if determined */
  readonly productType: ProductType | null;

  /** Human-readable explanation of the decoding logic used */
  readonly explanation: string;

  /** Source references for the format rule that matched */
  readonly sources: readonly SourceReference[];

  /** Warnings, caveats, and notes */
  readonly warnings: readonly string[];

  /** The original and normalized serial numbers */
  readonly input: {
    readonly original: string;
    readonly normalized: string;
  };

  /**
   * When status is 'ambiguous', this contains ALL possible results.
   * Empty array for non-ambiguous results.
   */
  readonly candidates: readonly DecodeCandidate[];

  /**
   * Character-level field breakdown produced by the matched format rule.
   * Populated for 'success' status only; empty for all other statuses.
   * Each segment maps a character range in the normalized serial to a
   * semantic field name, extracted value, and short description.
   */
  readonly segments: readonly DecodeSegment[];
}
