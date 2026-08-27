import type { SourceReference } from '../../types';

export const BRYANT_WWYY_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/bryant-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Bryant documentation confirming the 10-character WWYY format pattern (Style 1).',
    confidence: 'verified',
  },
];

export const BRYANT_YYMM_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/bryant-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Bryant documentation confirming the 9-digit YYMM format pattern (Style 2).',
    confidence: 'verified',
  },
];

export const BRYANT_LEGACY_SOURCES: readonly SourceReference[] = [
  {
    name: 'Building Intelligence Center',
    url: 'https://building-center.org/bryant-hvac-age/',
    dateReviewed: '2026-08-27',
    notes: 'Bryant documentation showing highly varied legacy formats (Styles 3, 4, 5) that are not reliably decodable.',
    confidence: 'verified',
  },
];
