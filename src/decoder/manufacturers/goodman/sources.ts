import type { SourceReference } from '../../types';

export const STANDARD_10_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://www.building-center.org/goodman-hvac-age/',
    dateReviewed: '2026-08-23',
    notes: 'Primary source for standard 10-digit format rules.',
    confidence: 'verified',
  },
  {
    name: 'Inspector Handbook',
    url: 'https://inspectorhandbook.com/how-to-determine-age-of-goodman-hvac/',
    dateReviewed: '2026-08-23',
    notes: 'Secondary verification of 10-digit rules.',
    confidence: 'verified',
  },
];

export const LEGACY_PTAC_SOURCES: readonly SourceReference[] = [
  {
    name: 'Inspector Handbook',
    url: 'https://inspectorhandbook.com/how-to-determine-age-of-goodman-hvac/',
    dateReviewed: '2026-08-23',
    notes: 'Mentions legacy PTAC rules but indicates ambiguity.',
    confidence: 'probable',
  },
];
