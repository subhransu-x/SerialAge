/**
 * Provenance metadata for a decoding rule.
 * Every format rule MUST have at least one source.
 * DO NOT invent sources — leave fields empty if unverified.
 */
export interface SourceReference {
  /** Human-readable name (e.g., "Building Intelligence Center") */
  readonly name: string;

  /** URL to the source document, or null if offline/print-only */
  readonly url: string | null;

  /** ISO 8601 date string when this source was last reviewed */
  readonly dateReviewed: string;

  /** Freeform notes about the source's reliability or scope */
  readonly notes: string;

  /** How much trust we place in this source */
  readonly confidence: SourceConfidence;
}

/** Trust level for a source reference */
export type SourceConfidence = 'verified' | 'probable' | 'unverified';
