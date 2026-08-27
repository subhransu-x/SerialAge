/**
 * Source references for Rheem serial number format rules.
 *
 * Sources are documented in rheem_ruud_research_audit.md and governed by
 * rheem_ruud_implementation_contract.md.
 *
 * DO NOT invent or modify source references without documented evidence.
 * DO NOT change confidence levels without evidence.
 */

import type { SourceReference } from '../../types';

// ---------------------------------------------------------------------------
// Primary sources — used by all supported Rheem formats
// ---------------------------------------------------------------------------

/**
 * Building Intelligence Center — primary authority for both formats.
 * Documents Style 1 (10-char) and Style 2/3 (embedded plant code).
 */
const BIC_SOURCE: SourceReference = {
  name: 'Building Intelligence Center',
  url: 'https://www.building-center.org/rheem-hvac-age/',
  dateReviewed: '2026-08-27',
  notes:
    'Industry reference database for HVAC age identification. Documents Rheem serial formats ' +
    'including the modern 10-character format (Style 1: plant letter + week + year + sequence) ' +
    'and the older embedded plant-code format (Style 2/3: prefix + plant letter F/M/G/N + week + year).',
  confidence: 'verified',
};

/**
 * PickHVAC.com — corroborates the Style 1 (10-char) format with real-world examples.
 */
const PICK_HVAC_SOURCE: SourceReference = {
  name: 'PickHVAC.com',
  url: 'https://pickhvac.com',
  dateReviewed: '2026-08-27',
  notes:
    'HVAC technician guide. Corroborates the 10-character modern Rheem format ' +
    '(letter + week + year + 5 sequence digits). Validates the week and year position rules.',
  confidence: 'verified',
};

// ---------------------------------------------------------------------------
// Format-specific source arrays
// ---------------------------------------------------------------------------

/** Sources for rheem-standard-10 (modern 10-character format) */
export const RHEEM_STANDARD_10_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  PICK_HVAC_SOURCE,
] as const;

/** Sources for rheem-embedded-plant (older embedded plant-code formats) */
export const RHEEM_EMBEDDED_PLANT_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
] as const;
