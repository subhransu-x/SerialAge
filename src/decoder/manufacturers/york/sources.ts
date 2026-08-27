/**
 * Source references for York serial number format rules.
 *
 * Sources are documented in york_research_audit.md and governed by
 * york_implementation_contract.md.
 *
 * DO NOT invent or modify source references without documented evidence.
 * DO NOT change confidence levels without evidence.
 */

import type { SourceReference } from '../../types';

// ---------------------------------------------------------------------------
// Primary sources
// ---------------------------------------------------------------------------

/**
 * Building Intelligence Center — primary authority for both formats.
 * Documents the 21-year cycle for the legacy format and the post-2004 transition.
 */
const BIC_SOURCE: SourceReference = {
  name: 'Building Intelligence Center',
  url: 'https://www.building-center.org/york-hvac-age/',
  dateReviewed: '2026-08-27',
  notes:
    'Industry reference database for HVAC age identification. Documents the 21-year ' +
    'cycle for the 1971-2004 format and the October 2004 transition to the modern format.',
  confidence: 'verified',
};

/**
 * HowToLookAtAHouse — secondary validation for the 21-year cycle and transition.
 */
const HOW_TO_LOOK_AT_A_HOUSE_SOURCE: SourceReference = {
  name: 'HowToLookAtAHouse / HVAC Forums',
  url: 'https://www.howtolookatahouse.com/',
  dateReviewed: '2026-08-27',
  notes:
    'Secondary validation for real-world examples and October 2004 transition confirmation.',
  confidence: 'verified',
};

// ---------------------------------------------------------------------------
// Format-specific source arrays
// ---------------------------------------------------------------------------

/** Sources for york-post-2004 */
export const YORK_POST_2004_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  HOW_TO_LOOK_AT_A_HOUSE_SOURCE,
] as const;

/** Sources for york-1971-2004 */
export const YORK_1971_2004_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  HOW_TO_LOOK_AT_A_HOUSE_SOURCE,
] as const;
