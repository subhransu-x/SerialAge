import type { SourceReference } from '../../types';

export const PAYNE_WWYY_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/payne-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Payne documentation confirming the 10-character WWYY format pattern.',
    confidence: 'verified',
  },
];

export const PAYNE_YYMM_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/payne-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Payne documentation confirming the 9-digit YYMM format pattern.',
    confidence: 'verified',
  },
];

export const PAYNE_LEGACY_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/payne-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Payne documentation showing highly varied legacy formats that are not reliably decodable.',
    confidence: 'verified',
  },
];
