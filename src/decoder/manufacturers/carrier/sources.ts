/**
 * Source references for Carrier serial number format rules.
 *
 * These sources are documented in carrier_specification.md and verified
 * in carrier_spec_audit.md. DO NOT invent or modify source references.
 */

import type { SourceReference } from '../../types';

// ---------------------------------------------------------------------------
// Format 1 (WWYY Standard) sources
// ---------------------------------------------------------------------------

export const WWYY_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org',
    dateReviewed: '2026-08-22',
    notes:
      'Industry reference database for HVAC age identification. Lists Carrier "Style 1" format with example 4006A17330.',
    confidence: 'verified',
  },
  {
    name: 'InspectorHandbook.com',
    url: 'https://inspectorhandbook.com',
    dateReviewed: '2026-08-22',
    notes:
      'Professional inspection reference. Confirms week-year format for Carrier/Bryant/Payne.',
    confidence: 'verified',
  },
  {
    name: 'Clarke-Rush.com (Carrier authorized dealer)',
    url: 'https://clarke-rush.com',
    dateReviewed: '2026-08-22',
    notes:
      'Factory-authorized Carrier dealer. Describes WWYY format with first 2 digits = week, next 2 = year.',
    confidence: 'verified',
  },
  {
    name: 'ComfortMonster.com',
    url: 'https://comfortmonster.com',
    dateReviewed: '2026-08-22',
    notes:
      'HVAC information resource. Confirms WWYY with 10-character format.',
    confidence: 'verified',
  },
  {
    name: 'ServMed.net',
    url: 'https://servmed.net',
    dateReviewed: '2026-08-22',
    notes:
      'HVAC industry reference. Confirms 10-character WWYYAXXXXX breakdown.',
    confidence: 'verified',
  },
  {
    name: 'PickHVAC.com',
    url: 'https://pickhvac.com',
    dateReviewed: '2026-08-22',
    notes: 'Consumer HVAC guide. Confirms same format.',
    confidence: 'verified',
  },
  {
    name: 'CarrierColorado.com',
    url: 'https://carriercolorado.com',
    dateReviewed: '2026-08-22',
    notes:
      'Confirms format and provides walk-through example.',
    confidence: 'verified',
  },
] as const;

// ---------------------------------------------------------------------------
// Format 2 (YYMM Legacy) sources
// ---------------------------------------------------------------------------

export const YYMM_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org',
    dateReviewed: '2026-08-22',
    notes:
      'Lists 850304091 as Style 2 example. Structure verified. Era boundaries uncertain. Only 2 documented examples.',
    confidence: 'probable',
  },
  {
    name: 'InspectorHandbook.com',
    url: 'https://inspectorhandbook.com',
    dateReviewed: '2026-08-22',
    notes:
      'Describes YYMM format for 1980s. Gives 8308 → August 1983 example.',
    confidence: 'verified',
  },
  {
    name: 'HowToLookAtAHouse.com',
    url: 'https://howtolookatahouse.com',
    dateReviewed: '2026-08-22',
    notes:
      'Confirms YYMM variant exists for older units. Licensed inspector author.',
    confidence: 'probable',
  },
] as const;

// ---------------------------------------------------------------------------
// Unsupported legacy format sources
// ---------------------------------------------------------------------------

export const LEGACY_UNSUPPORTED_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org',
    dateReviewed: '2026-08-22',
    notes:
      'Documents Styles 3–6 for pre-1985 Carrier serials. These formats have decade ambiguity, conflicting documentation, or insufficient verified examples.',
    confidence: 'verified',
  },
  {
    name: 'InspectorHandbook.com',
    url: 'https://inspectorhandbook.com',
    dateReviewed: '2026-08-22',
    notes:
      'Confirms existence of 1970s and early 1980s letter-digit formats.',
    confidence: 'verified',
  },
] as const;
