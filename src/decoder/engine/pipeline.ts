import type {
  DecodeResult,
  DecodeCandidate,
  Confidence,
  FormatRule,
  NormalizedInput,
  DecodedData,
  FormatRuleError,
} from '../types';
import { isFormatRuleError } from '../types';
import { getManufacturer } from './registry';
import { validateInput, normalizeInput } from './normalize';
import { validateDecodedDate } from './validate-date';
import { buildManufactureDate, calculateAge } from '../../utils/date';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** A successful decode from a single format rule */
interface FormatMatch {
  readonly format: FormatRule;
  readonly data: DecodedData;
}

/** An explicit error from a format rule that intentionally rejected the input */
interface ExplicitError {
  readonly format: FormatRule;
  readonly error: FormatRuleError;
}

/** Result of running all format rules: successful decodes and explicit errors */
interface CollectResult {
  readonly matches: FormatMatch[];
  readonly errors: ExplicitError[];
}

// ---------------------------------------------------------------------------
// Pipeline options
// ---------------------------------------------------------------------------

export interface DecodeOptions {
  /**
   * Reference date for age calculation.
   * Defaults to the current date. Inject a fixed date for deterministic tests.
   */
  readonly referenceDate?: Date;
}

// ---------------------------------------------------------------------------
// Main decode function — the public API
// ---------------------------------------------------------------------------

/**
 * Decode a serial number for a given manufacturer.
 *
 * This is the main entry point for the decoder pipeline:
 *   Validate → Normalize → Lookup → Match All → Decode → Disambiguate → Age → Result
 *
 * @param manufacturerId - Canonical manufacturer ID (e.g., "carrier")
 * @param serialNumber   - Raw serial number as entered by the user
 * @param options        - Optional configuration (reference date for testing)
 * @returns A complete DecodeResult ready for UI consumption
 */
export function decode(
  manufacturerId: string,
  serialNumber: string,
  options: DecodeOptions = {},
): DecodeResult {
  const referenceDate = options.referenceDate ?? new Date();

  // -------------------------------------------------------------------------
  // Step 1: Validate raw input
  // -------------------------------------------------------------------------
  const validationError = validateInput(serialNumber);
  if (validationError !== null) {
    return buildErrorResult('invalid-input', manufacturerId, serialNumber, validationError);
  }

  // -------------------------------------------------------------------------
  // Step 2: Normalize input
  // -------------------------------------------------------------------------
  const input = normalizeInput(serialNumber);

  // -------------------------------------------------------------------------
  // Step 3: Look up manufacturer in registry
  // -------------------------------------------------------------------------
  const manufacturer = getManufacturer(manufacturerId);
  if (!manufacturer) {
    return buildErrorResult(
      'unsupported',
      manufacturerId,
      serialNumber,
      `Manufacturer "${manufacturerId}" is not registered in the decoder.`,
    );
  }

  // -------------------------------------------------------------------------
  // Step 4 & 5: Run all format rules (match + decode)
  // -------------------------------------------------------------------------
  const { matches, errors } = collectMatches(manufacturer.formats, input, referenceDate);

  // -------------------------------------------------------------------------
  // Step 6: Disambiguate
  // -------------------------------------------------------------------------

  // If valid decodes exist, they take priority over any explicit errors.
  // Explicit errors from other rules must NOT override a valid successful decode.
  if (matches.length === 1 || (matches.length > 1 && allMatchesAgree(matches))) {
    return buildSuccessResult(matches, manufacturer, input, referenceDate);
  }

  if (matches.length > 1) {
    // Multiple conflicting results → ambiguous
    return buildAmbiguousResult(matches, manufacturer, input, referenceDate);
  }

  // No valid decodes. Check for explicit errors from rules.
  if (errors.length > 0) {
    // Use the first explicit error — rules are ordered most-recent-first,
    // so the first explicit error is the most relevant.
    const firstError = errors[0];
    const status = firstError.error.error === 'insufficient-info'
      ? 'insufficient-info' as const
      : 'unsupported' as const;

    return {
      status,
      manufacturer: { id: manufacturer.id, name: manufacturer.name },
      manufactureDate: null,
      approximateAge: null,
      confidence: null,
      formatUsed: null,
      productType: null,
      explanation: firstError.error.explanation,
      sources: [...firstError.format.sources],
      warnings: [],
      input: { original: input.original, normalized: input.normalized },
      candidates: [],
      segments: [],
    };
  }

  // No matches, no explicit errors — generic fallback
  return {
    status: 'unsupported',
    manufacturer: { id: manufacturer.id, name: manufacturer.name },
    manufactureDate: null,
    approximateAge: null,
    confidence: null,
    formatUsed: null,
    productType: null,
    explanation:
      `No known serial number format for ${manufacturer.name} matched the input "${input.normalized}".`,
    sources: [],
    warnings: [],
    input: { original: input.original, normalized: input.normalized },
    candidates: [],
    segments: [],
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Run all format rules against the input, collecting successful decodes
 * and explicit error signals separately.
 *
 * Rejects decoded results with impossible dates (month 13, Feb 30, etc.)
 *
 * Priority semantics:
 * - Valid DecodedData results are always collected as matches
 * - FormatRuleError results are collected as explicit errors
 * - null results are silently skipped
 * - The caller decides priority: valid matches always win over explicit errors
 */
function collectMatches(
  formats: readonly FormatRule[],
  input: NormalizedInput,
  referenceDate: Date,
): CollectResult {
  const matches: FormatMatch[] = [];
  const errors: ExplicitError[] = [];

  for (const format of formats) {
    // Step 4: Fast pre-filter
    if (!format.matches(input)) {
      continue;
    }

    // Step 5: Attempt full decode
    const result = format.decode(input);

    // Handle null (silent skip)
    if (result === null) {
      continue;
    }

    // Handle explicit errors
    if (isFormatRuleError(result)) {
      errors.push({ format, error: result });
      continue;
    }

    // Handle successful decode — validate the date
    const dateError = validateDecodedDate(
      result.year,
      result.month,
      result.week,
      result.day,
      referenceDate,
    );
    if (dateError !== null) {
      // Silently skip — this format produced an impossible date.
      // This is a format rule bug, not a user error.
      continue;
    }

    matches.push({ format, data: result });
  }

  return { matches, errors };
}

/**
 * Check whether all matches decode to the same year and month.
 */
function allMatchesAgree(matches: FormatMatch[]): boolean {
  if (matches.length <= 1) return true;

  const first = matches[0];
  return matches.every(
    (m) => m.data.year === first.data.year && m.data.month === first.data.month,
  );
}

/**
 * Pick the highest-confidence source from a set of matching format rules.
 */
function pickBestMatch(matches: FormatMatch[]): FormatMatch {
  const priority: Record<string, number> = { high: 3, medium: 2, low: 1 };

  // Use source confidence as a proxy for match quality
  return matches.reduce((best, current) => {
    const bestScore = bestSourceScore(best.format);
    const currentScore = bestSourceScore(current.format);
    return currentScore > bestScore ? current : best;
  });

  function bestSourceScore(format: FormatRule): number {
    if (format.sources.length === 0) return 0;
    return Math.max(...format.sources.map((s) => priority[s.confidence] ?? 0));
  }
}

/**
 * Determine confidence level for a successful decode.
 */
function determineConfidence(match: FormatMatch, totalMatches: number): Confidence {
  // If only one format matched, use its source confidence directly
  if (totalMatches === 1) {
    const bestSource = match.format.sources[0];
    if (bestSource?.confidence === 'verified') return 'high';
    if (bestSource?.confidence === 'probable') return 'medium';
    return 'low';
  }

  // Multiple matches that agree → medium (consensus but multiple interpretations exist)
  return 'medium';
}

/**
 * Build a success DecodeResult from matching format(s).
 */
function buildSuccessResult(
  matches: FormatMatch[],
  manufacturer: { id: string; name: string },
  input: NormalizedInput,
  referenceDate: Date,
): DecodeResult {
  const best = matches.length === 1 ? matches[0] : pickBestMatch(matches);
  const confidence = determineConfidence(best, matches.length);

  const manufactureDate = buildManufactureDate(
    best.data.year,
    best.data.month,
    best.data.week,
    best.data.day,
  );

  const approximateAge = calculateAge(manufactureDate, referenceDate);

  const warnings = [...best.data.warnings];
  if (matches.length > 1) {
    warnings.push(
      `${matches.length} format rules matched but all agreed on the same manufacture date.`,
    );
  }

  return {
    status: 'success',
    manufacturer: { id: manufacturer.id, name: manufacturer.name },
    manufactureDate,
    approximateAge,
    confidence,
    formatUsed: {
      id: best.format.id,
      name: best.format.name,
      description: best.format.description,
      yearRange: best.format.yearRange,
    },
    productType: best.data.productType,
    explanation: best.data.explanation,
    sources: [...best.format.sources],
    warnings,
    input: { original: input.original, normalized: input.normalized },
    candidates: [],
    segments: [...(best.data.segments ?? [])],
  };
}

/**
 * Build an ambiguous DecodeResult when formats disagree.
 */
function buildAmbiguousResult(
  matches: FormatMatch[],
  manufacturer: { id: string; name: string },
  input: NormalizedInput,
  referenceDate: Date,
): DecodeResult {
  const candidates: DecodeCandidate[] = matches.map((match) => {
    const mfgDate = buildManufactureDate(
      match.data.year,
      match.data.month,
      match.data.week,
      match.data.day,
    );
    const age = calculateAge(mfgDate, referenceDate);

    // Determine per-candidate confidence from source quality
    const bestSource = match.format.sources[0];
    let confidence: Confidence = 'low';
    if (bestSource?.confidence === 'verified') confidence = 'medium'; // downgrade because ambiguous
    else if (bestSource?.confidence === 'probable') confidence = 'low';

    return {
      formatUsed: { id: match.format.id, name: match.format.name },
      manufactureDate: mfgDate,
      approximateAge: age,
      confidence,
      explanation: match.data.explanation,
      sources: [...match.format.sources],
      productType: match.data.productType,
      warnings: [...match.data.warnings],
      segments: [...(match.data.segments ?? [])],
    };
  });

  return {
    status: 'ambiguous',
    manufacturer: { id: manufacturer.id, name: manufacturer.name },
    manufactureDate: null,
    approximateAge: null,
    confidence: null,
    formatUsed: null,
    productType: null,
    explanation:
      `This serial number matches ${matches.length} different format rules for ${manufacturer.name} ` +
      `with different manufacture dates. Additional context may be needed to determine the correct date.`,
    sources: [],
    warnings: [
      'Multiple decode interpretations exist. The manufacture date could not be determined unambiguously.',
    ],
    input: { original: input.original, normalized: input.normalized },
    candidates,
    segments: [],
  };
}

/**
 * Build an error DecodeResult for validation failures or unknown manufacturers.
 */
function buildErrorResult(
  status: 'invalid-input' | 'unsupported' | 'insufficient-info',
  manufacturerId: string,
  serialNumber: string,
  explanation: string,
): DecodeResult {
  return {
    status,
    manufacturer: { id: manufacturerId, name: manufacturerId },
    manufactureDate: null,
    approximateAge: null,
    confidence: null,
    formatUsed: null,
    productType: null,
    explanation,
    sources: [],
    warnings: [],
    input: { original: serialNumber, normalized: serialNumber.trim().toUpperCase() },
    candidates: [],
    segments: [],
  };
}
