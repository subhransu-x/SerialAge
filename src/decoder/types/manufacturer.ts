import type { SourceReference } from './source';

// ---------------------------------------------------------------------------
// Decode Segment — structured character-level explanation
// ---------------------------------------------------------------------------

/**
 * One logical field extracted from a serial number.
 *
 * Produced by a FormatRule's decode() method to describe ONLY the characters
 * the rule actually parses. The UI uses this to visualize the decode without
 * knowing any manufacturer-specific logic.
 *
 * RULES:
 * - startIndex and endIndex are 0-based indices into the NORMALIZED serial.
 * - endIndex is exclusive (same convention as String.prototype.substring).
 * - Only add a segment when the rule deterministically extracts a field.
 * - Do NOT add segments for un-decoded trailing characters (sequence numbers
 *   the decoder ignores, unknown fields, etc.) unless the format rule
 *   explicitly identifies what they represent.
 */
export interface DecodeSegment {
  /** 0-based start index into the normalized serial (inclusive) */
  readonly startIndex: number;
  /** 0-based end index into the normalized serial (exclusive) */
  readonly endIndex: number;
  /**
   * Semantic field name, short and human-readable.
   * Examples: 'Week', 'Year', 'Month', 'Plant Code'
   */
  readonly field: string;
  /** The raw extracted value from the serial (e.g. '24', 'T', 'A') */
  readonly value: string;
  /** Short human-readable description of what this field means (e.g. 'Week 24 of manufacture') */
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Product Type
// ---------------------------------------------------------------------------

/** Equipment categories the system supports */
export type ProductType =
  | 'furnace'
  | 'air-conditioner'
  | 'heat-pump'
  | 'water-heater'
  | 'package-unit'
  | 'unknown';

// ---------------------------------------------------------------------------
// Normalized Input
// ---------------------------------------------------------------------------

/**
 * Normalized user input passed to format rules.
 *
 * The normalization layer produces multiple representations so each
 * FormatRule can choose the appropriate one for pattern matching
 * without losing information.
 */
export interface NormalizedInput {
  /** Original input exactly as the user typed it */
  readonly original: string;

  /** Trimmed and uppercased version for pattern matching */
  readonly normalized: string;

  /** Normalized with hyphens removed (some formats ignore them) */
  readonly withoutHyphens: string;

  /** Normalized with spaces removed */
  readonly withoutSpaces: string;
}

// ---------------------------------------------------------------------------
// Decoded Data (intermediate result from a single FormatRule)
// ---------------------------------------------------------------------------

/**
 * The raw decoded data extracted by a FormatRule.
 *
 * This is an intermediate result before the pipeline wraps it
 * into a full DecodeResult. FormatRules return this (or null).
 */
export interface DecodedData {
  /** Manufacture year (4-digit), or null if century/year cannot be established */
  readonly year: number | null;

  /** Manufacture month (1–12), or null if not determinable */
  readonly month: number | null;

  /** Manufacture week (1–53), or null if not applicable */
  readonly week: number | null;

  /** Specific day (1–31), or null if not determinable */
  readonly day: number | null;

  /** Product type decoded from the serial, or 'unknown' */
  readonly productType: ProductType;

  /** Human-readable explanation of how the date was extracted */
  readonly explanation: string;

  /** Any warnings or caveats about this decode */
  readonly warnings: readonly string[];

  /**
   * Structured character-level breakdown of the decoded serial.
   *
   * Each segment describes one logical field extracted by this format rule.
   * Only include segments for characters the rule actually defines.
   * Leave undefined (or empty) when character-level mapping is not possible
   * (e.g. variable-position embedded formats).
   */
  readonly segments?: readonly DecodeSegment[];

  /**
   * Additional data extracted (model hints, plant codes, etc.)
   * Keys are freeform but should be documented per manufacturer.
   */
  readonly metadata: Readonly<Record<string, string>>;
}

// ---------------------------------------------------------------------------
// Format Rule Error — explicit unsupported/insufficient-info signal
// ---------------------------------------------------------------------------

/**
 * An explicit error return from a FormatRule that intentionally matched
 * a pattern but cannot or should not decode it.
 *
 * This allows rules to distinguish between:
 * - "I don't recognize this input" (return null)
 * - "I recognize this input but it uses an unsupported format" (return error)
 * - "I recognize this input but need more context" (return error)
 */
export interface FormatRuleError {
  readonly error: 'unsupported' | 'insufficient-info';
  readonly explanation: string;
}

/**
 * The return type of FormatRule.decode().
 *
 * - DecodedData: successful decode with extracted date information
 * - FormatRuleError: intentional rejection with a specific reason
 * - null: format matched structurally but decode failed (silent skip)
 */
export type FormatDecodeResult = DecodedData | FormatRuleError | null;

// ---------------------------------------------------------------------------
// Format Rule
// ---------------------------------------------------------------------------

/**
 * A single historical serial-number format for a manufacturer.
 *
 * A manufacturer will typically have MULTIPLE FormatRules
 * covering different eras, product lines, or encoding schemes.
 *
 * IMPORTANT:
 * - `matches()` is a fast pre-filter (regex test, length check).
 *   Returning true does NOT guarantee a successful decode.
 * - `decode()` does the real parsing. Returns DecodedData on success,
 *   a FormatRuleError for intentional rejections, or null on failure.
 * - Both functions receive a NormalizedInput and choose which
 *   representation to use.
 */
export interface FormatRule {
  /** Unique identifier within this manufacturer (e.g., "carrier-post-2010") */
  readonly id: string;

  /** Human-readable name for this format era */
  readonly name: string;

  /** Description of when/where this format applies */
  readonly description: string;

  /** Approximate year range this format was used: [startYear, endYear | null] */
  readonly yearRange: readonly [number, number | null];

  /** Product types this format applies to (empty array = all product types) */
  readonly productTypes: readonly ProductType[];

  /** Source references for this specific format rule */
  readonly sources: readonly SourceReference[];

  /**
   * Test whether a normalized serial number COULD match this format.
   * This is a fast pre-filter — it should be cheap.
   * Returning true means "try decoding me".
   */
  readonly matches: (serial: NormalizedInput) => boolean;

  /**
   * Attempt to decode the serial number using this format.
   *
   * Returns:
   * - DecodedData on success
   * - FormatRuleError to explicitly flag unsupported/insufficient-info
   * - null if decoding fails silently (format matched but data invalid)
   */
  readonly decode: (serial: NormalizedInput) => FormatDecodeResult;
}

// ---------------------------------------------------------------------------
// Manufacturer Definition
// ---------------------------------------------------------------------------

/**
 * Manufacturer registration object.
 * Each manufacturer plugin exports one of these via registerManufacturer().
 */
export interface ManufacturerDefinition {
  /** Canonical manufacturer ID (lowercase, kebab-case, e.g., "carrier") */
  readonly id: string;

  /** Display name (e.g., "Carrier") */
  readonly name: string;

  /**
   * All known format rules, ordered from most-recent to oldest.
   * The pipeline iterates ALL rules (does not short-circuit).
   */
  readonly formats: readonly FormatRule[];
}
