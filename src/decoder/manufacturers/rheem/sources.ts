/**
 * Source references for Rheem serial number format rules.
 */

import type { SourceReference } from '../../types';

const BIC_SOURCE: SourceReference = {
  name: 'Building Intelligence Center',
  url: 'https://www.building-center.org/rheem-hvac-age/',
  dateReviewed: '2026-08-27',
  notes: 'Industry reference database for HVAC age identification. Documents Rheem modern structural serial formats.',
  confidence: 'verified',
};

const PICK_HVAC_SOURCE: SourceReference = {
  name: 'PickHVAC.com',
  url: 'https://pickhvac.com',
  dateReviewed: '2026-08-27',
  notes: 'HVAC technician guide. Corroborates the modern Rheem format rules.',
  confidence: 'verified',
};

export const RHEEM_STRUCTURAL_SOURCES: readonly SourceReference[] = [
  BIC_SOURCE,
  PICK_HVAC_SOURCE,
] as const;
