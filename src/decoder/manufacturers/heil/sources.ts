import type { SourceReference } from '../../types';

export const HEIL_MODERN_SOURCES: readonly SourceReference[] = [
  {
    name: 'SerialAge Manufacturer Decoding Audit - Heil',
    url: null,
    dateReviewed: '2024-05-15T00:00:00.000Z',
    notes: 'Internal forensic investigation establishing the structure of modern ICP formats.',
    confidence: 'verified',
  },
  {
    name: 'ICP Technical Information Communication TIC2021-0009',
    url: null,
    dateReviewed: '2024-05-15T00:00:00.000Z',
    notes: 'Primary manufacturer engineering document confirming the format and explicitly verifying that positions 4 and 5 represent the week, not the month.',
    confidence: 'verified',
  },
];

export const HEIL_LEGACY_SOURCES: readonly SourceReference[] = [
  {
    name: 'SerialAge Manufacturer Decoding Audit - Heil',
    url: null,
    dateReviewed: '2024-05-15T00:00:00.000Z',
    notes: 'Internal forensic investigation mapping the Heil-Quaker decade formats.',
    confidence: 'verified',
  },
];

export const HEIL_DUCTLESS_SOURCES: readonly SourceReference[] = [
  {
    name: 'ICP Ductless Compatibility Guide',
    url: null,
    dateReviewed: '2024-05-15T00:00:00.000Z',
    notes: 'Primary OEM documentation confirming the V-prefix ductless format (e.g. V2028V10001 = 2020, Week 28).',
    confidence: 'verified',
  },
];
