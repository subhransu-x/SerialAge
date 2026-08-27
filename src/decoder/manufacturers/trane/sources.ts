/**
 * Source references for Trane serial number format rules.
 *
 * Sources are documented in trane_research_audit.md and governed by
 * trane_implementation_contract.md Section 5.
 *
 * DO NOT invent or modify source references without documented evidence.
 * DO NOT change confidence levels without evidence.
 */

import type { SourceReference } from '../../types';

// ---------------------------------------------------------------------------
// Primary sources — used by all three supported Trane formats
// ---------------------------------------------------------------------------

/**
 * Building Intelligence Center — primary authority for all three supported formats.
 * Confirms the length-based format delineation: 9-char (1983-2001, 2002-2009)
 * vs 10-char (2010-present). Documents the letter-year mapping table.
 */
const BIC_SOURCE: SourceReference = {
  name: 'Building Intelligence Center',
  url: 'https://www.building-center.org/trane-hvac-age/',
  dateReviewed: '2026-08-27',
  notes:
    'Industry reference database for HVAC age identification. Documents Trane serial formats ' +
    'from 1983 to present. Confirms length-based delineation: 9-char for 1983-2009, ' +
    '10-char for 2010+. Documents the letter-year mapping table for 1983-2001.',
  confidence: 'verified',
};

/**
 * InspectorHandbook.com — corroborates the letter-prefix table for 1983-2001.
 */
const INSPECTOR_HANDBOOK_SOURCE: SourceReference = {
  name: 'InspectorHandbook.com',
  url: 'https://inspectorhandbook.com',
  dateReviewed: '2026-08-27',
  notes:
    'Professional home inspection reference. Corroborates the letter-prefix table for Trane ' +
    'serial numbers manufactured from 1983 to 2001.',
  confidence: 'verified',
};

/**
 * PickHVAC.com — validates the 10-char vs 9-char rule with real examples.
 */
const PICK_HVAC_SOURCE: SourceReference = {
  name: 'PickHVAC.com',
  url: 'https://pickhvac.com',
  dateReviewed: '2026-08-27',
  notes:
    'HVAC technician guide. Provides verified examples of 2010+ (10-char) and 2002-2009 (9-char) ' +
    'formats. Validates the year-week position rules.',
  confidence: 'verified',
};

// ---------------------------------------------------------------------------
// Format-specific source arrays
// As required by trane_implementation_contract.md Section 5.
// ---------------------------------------------------------------------------

/** Sources for trane-modern-10 (2010–present) */
export const TRANE_MODERN_10_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  PICK_HVAC_SOURCE,
] as const;

/** Sources for trane-standard-9 (2002–2009) */
export const TRANE_STANDARD_9_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  PICK_HVAC_SOURCE,
] as const;

/** Sources for trane-letter-9 (1983–2001) */
export const TRANE_LETTER_9_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  INSPECTOR_HANDBOOK_SOURCE,
] as const;

/** Sources for the legacy-unsupported trap rule */
export const TRANE_LEGACY_UNSUPPORTED_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
] as const;
