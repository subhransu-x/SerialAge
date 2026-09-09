/**
 * Golden test fixtures for Carrier serial number decoder.
 *
 * Source of truth: Phase 1 & 2 research (2026-09-09)
 *
 * IMPORTANT:
 * - Verified real-world examples come from documented sources.
 * - Synthetic examples are explicitly labeled as such.
 * - DO NOT modify expected values to make tests pass.
 * - DO NOT fabricate real-world serial numbers.
 */

import type { DecoderTestCase } from '../../../types';

// ---------------------------------------------------------------------------
// A. Verified Real-World Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_VERIFIED_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-WWYY-R1: Standard WWYY — Week 40, 2006 (BIC Style 1 example)',
    manufacturerId: 'carrier',
    serialNumber: '4006A17330',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2006,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-08-22',
      notes: 'Style 1 example serial',
      confidence: 'verified',
    },
    notes: 'Primary verified example from BIC documentation.',
  },
  {
    description: 'C-WWYY-R2: Standard WWYY — Week 34, 2005 (Clarke-Rush/ComfortMonster)',
    manufacturerId: 'carrier',
    serialNumber: '3405E12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2005,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Clarke-Rush.com',
      url: 'https://clarke-rush.com',
      dateReviewed: '2026-08-22',
      notes: 'Confirmed by multiple sources',
      confidence: 'verified',
    },
    notes: 'Cross-verified by Clarke-Rush and ComfortMonster.',
  },
  {
    description: 'C-YYMM-R1: Legacy YYMM — March 1985 (BIC Style 2 example)',
    manufacturerId: 'carrier',
    serialNumber: '850304091',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-yymm-legacy',
    expectedYear: 1985,
    expectedMonth: 3,
    expectedConfidence: 'medium',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-08-22',
      notes: 'Style 2 example serial',
      confidence: 'verified',
    },
    notes: 'Primary verified YYMM example from BIC.',
  },
  {
    description: 'C-STYLE3-R1: Style 3 US — October 1984 (BIC example W4D14008)',
    manufacturerId: 'carrier',
    serialNumber: 'W4D14008',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style3-us',
    expectedYear: 1984,
    expectedMonth: 10,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-09-09',
      notes: 'Style 3 US example. W=October, 4=1984.',
      confidence: 'verified',
    },
    notes: 'Real BIC Style 3 US example. W=October per verified BIC mapping.',
  },
  {
    description: 'C-STYLE3-R2: Style 3 Canada — October 1984 (BIC example 4WD14008)',
    manufacturerId: 'carrier',
    serialNumber: '4WD14008',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style3-ca',
    expectedYear: 1984,
    expectedMonth: 10,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-09-09',
      notes: 'Style 3 CA example. 4=1984, W=October.',
      confidence: 'verified',
    },
    notes: 'Real BIC Style 3 CA example. Canadian format reverses year and month positions.',
  },
  {
    description: 'C-STYLE4-R1: Style 4 — January 1971 (BIC example A167890)',
    manufacturerId: 'carrier',
    serialNumber: 'A167890',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style4-unambiguous',
    expectedYear: 1971,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-09-09',
      notes: 'Style 4 example. A=January, 1=1971.',
      confidence: 'verified',
    },
    notes: 'Real BIC Style 4 example. Unambiguous year digit 1=1971.',
  },
];

// ---------------------------------------------------------------------------
// B. Synthetic Structural Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_SYNTHETIC_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-WWYY-S1: Earliest plausible WWYY — Week 01, 1985',
    manufacturerId: 'carrier',
    serialNumber: '0185A00001',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1985,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic boundary test. Should trigger transitional era warning.',
  },
  {
    description: 'C-WWYY-S2: Latest plausible WWYY — Week 52, 2024',
    manufacturerId: 'carrier',
    serialNumber: '5224Z99999',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2024,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic boundary test. Maximum valid week, recent year.',
  },
  {
    description: 'C-YYMM-S1: Earliest YYMM — January 1980',
    manufacturerId: 'carrier',
    serialNumber: '800100001',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-yymm-legacy',
    expectedYear: 1980,
    expectedMonth: 1,
    expectedConfidence: 'medium',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic boundary test. Earliest plausible YYMM serial.',
  },
  {
    description: 'C-YYMM-S2: Latest YYMM — December 1989',
    manufacturerId: 'carrier',
    serialNumber: '891299999',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-yymm-legacy',
    expectedYear: 1989,
    expectedMonth: 12,
    expectedConfidence: 'medium',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic boundary test. Latest plausible YYMM serial.',
  },
  // --- WWYY 1980–1984 era (previously broken, now fixed) ---
  {
    description: 'C-WWYY-1980-S1: Week 01, 1980 — tests fixed century threshold',
    manufacturerId: 'carrier',
    serialNumber: '0180A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1980,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Verifies WWYY_CENTURY_THRESHOLD=80. Previously decoded as 2080.',
  },
  {
    description: 'C-WWYY-1980-S2: Week 02, 1980',
    manufacturerId: 'carrier',
    serialNumber: '0280A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1980,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Tests 1980 WWYY decode.',
  },
  {
    description: 'C-WWYY-1981-S1: Week 03, 1981',
    manufacturerId: 'carrier',
    serialNumber: '0381A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1981,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Tests 1981 WWYY decode.',
  },
  {
    description: 'C-WWYY-1984-S1: Week 52, 1984',
    manufacturerId: 'carrier',
    serialNumber: '5284Z99999',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1984,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Tests 1984 WWYY decode (last year of transitional era).',
  },
  // --- Style 3 boundary tests ---
  {
    description: 'C-STYLE3-S1: Style 3 US — January 1980 (earliest)',
    manufacturerId: 'carrier',
    serialNumber: 'M0A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style3-us',
    expectedYear: 1980,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. M=January, 0=1980.',
  },
  {
    description: 'C-STYLE3-S2: Style 3 US — December 1984 (latest)',
    manufacturerId: 'carrier',
    serialNumber: 'Z4A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style3-us',
    expectedYear: 1984,
    expectedMonth: 12,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Z=December, 4=1984.',
  },
  // --- Style 4 boundary tests ---
  {
    description: 'C-STYLE4-S1: Style 4 — December 1978 (year digit 8)',
    manufacturerId: 'carrier',
    serialNumber: 'L812345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style4-unambiguous',
    expectedYear: 1978,
    expectedMonth: 12,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. L=December, 8=1978.',
  },
  {
    description: 'C-STYLE4-S2-moved: See CARRIER_AMBIGUOUS_FIXTURES for digit-9 ambiguity test',
    manufacturerId: 'carrier',
    serialNumber: 'A167890',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-style4-unambiguous',
    expectedYear: 1971,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Verifies non-ambiguous Style 4 decode. Digit-9 ambiguity tested separately in CARRIER_AMBIGUOUS_FIXTURES.',
  },
];

// ---------------------------------------------------------------------------
// C. Invalid Input Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_INVALID_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-INV-01: Empty string',
    manufacturerId: 'carrier',
    serialNumber: '',
    expectedStatus: 'invalid-input',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Empty input should be caught by pipeline validation.',
  },
  {
    description: 'C-INV-02: Whitespace only',
    manufacturerId: 'carrier',
    serialNumber: '   ',
    expectedStatus: 'invalid-input',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Whitespace-only should be caught by pipeline validation.',
  },
  {
    description: 'C-INV-03: Too short',
    manufacturerId: 'carrier',
    serialNumber: 'ABC123',
    expectedStatus: 'invalid-input',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. ABC123 has length 6 which is >= 3 (min) but this tests the format matching, not input validation.',
  },
];

// ---------------------------------------------------------------------------
// D. Unsupported Format Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_UNSUPPORTED_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-UNS-01: Style 6 (1960s/70s week+letter year) — 46U152456',
    manufacturerId: 'carrier',
    serialNumber: '46U152456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: {
      name: 'Building Intelligence Center',
      url: 'https://building-center.org',
      dateReviewed: '2026-09-09',
      notes: 'Style 6 example — not implemented due to pattern collision risk',
      confidence: 'verified',
    },
    notes: 'Style 6 format remains unsupported. Must trigger explicit unsupported, not generic no-match.',
  },
  {
    description: 'C-UNS-02: WWYY with invalid week 53 — 5320A12345',
    manufacturerId: 'carrier',
    serialNumber: '5320A12345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Week 53 exceeds maximum valid week (52). Structural match for WWYY but week validation should reject it.',
  },
  {
    description: 'C-UNS-03: YYMM with invalid month 13 — 831300001',
    manufacturerId: 'carrier',
    serialNumber: '831300001',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Month 13 is invalid. YYMM structural match but month validation should reject it.',
  },
  {
    description: 'C-UNS-04: Style 3 with year digit 5 (out of range) — W5D14008',
    manufacturerId: 'carrier',
    serialNumber: 'W5D14008',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Year digit 5 is outside valid range 0-4 for Style 3.',
  },
];

// ---------------------------------------------------------------------------
// E. Ambiguous / Structural Edge Case Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_AMBIGUOUS_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-AMB-01: Structurally matches WWYY but wrong length. No 8-char format matches digits-only.',
    manufacturerId: 'carrier',
    serialNumber: '8503A4091',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. 9 chars with letter at position 5 — does not match WWYY (length 10 required), does not match YYMM (not all digits). Falls through as unsupported.',
  },
  {
    description: 'C-AMB-02: Style 4 digit 9 — ambiguous (1969 or 1979)',
    manufacturerId: 'carrier',
    serialNumber: 'A912345',
    expectedStatus: 'ambiguous',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. A=January, 9=ambiguous (1969 or 1979). Must report two candidates.',
  },
];

// ---------------------------------------------------------------------------
// F. Edge Case / Boundary Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_EDGE_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-EDGE-01: Last WWYY of 1999 — Week 52, 1999',
    manufacturerId: 'carrier',
    serialNumber: '5299Z99999',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 1999,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Last possible WWYY serial in 1999 before Y2K.',
  },
  {
    description: 'C-EDGE-02: Y2K transition — Week 01, 2000',
    manufacturerId: 'carrier',
    serialNumber: '0100A00001',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2000,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. YY=00 → 2000 (not 1900). Tests century threshold at the boundary.',
  },
  {
    description: 'C-EDGE-03: Week 00 is invalid',
    manufacturerId: 'carrier',
    serialNumber: '0000A12345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Week 00 is below the minimum valid week (01).',
  },
];

// ---------------------------------------------------------------------------
// G. Normalization Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_NORMALIZATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'C-NORM-01: Lowercase input should be uppercased and decoded',
    manufacturerId: 'carrier',
    serialNumber: '4006a17330',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2006,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Tests case normalization. Same serial as C-WWYY-R1 but lowercase.',
  },
  {
    description: 'C-NORM-02: Whitespace-padded input should be trimmed and decoded',
    manufacturerId: 'carrier',
    serialNumber: '  4006A17330  ',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2006,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Tests whitespace trimming.',
  },
];

// ---------------------------------------------------------------------------
// H. Adversarial / Threat Fixtures
// ---------------------------------------------------------------------------

export const CARRIER_ADVERSARIAL_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'Threat 1: False positive YYMM — 220100001 should NOT decode as Jan 2022',
    manufacturerId: 'carrier',
    serialNumber: '220100001',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic adversarial. Year 22 is outside 80-89 range for YYMM. Must not false-positive.',
  },
  {
    description: 'Threat 2: Century rollover — 0105A12345 must decode to 2005, not 1905',
    manufacturerId: 'carrier',
    serialNumber: '0105A12345',
    expectedStatus: 'success',
    expectedFormatId: 'carrier-wwyy-standard',
    expectedYear: 2005,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic adversarial. Tests century threshold: YY=05 < 80 → 2005.',
  },
];

// ---------------------------------------------------------------------------
// All fixtures combined for convenient iteration
// ---------------------------------------------------------------------------

export const ALL_CARRIER_FIXTURES: readonly DecoderTestCase[] = [
  ...CARRIER_VERIFIED_FIXTURES,
  ...CARRIER_SYNTHETIC_FIXTURES,
  ...CARRIER_INVALID_FIXTURES,
  ...CARRIER_UNSUPPORTED_FIXTURES,
  ...CARRIER_AMBIGUOUS_FIXTURES,
  ...CARRIER_EDGE_FIXTURES,
  ...CARRIER_NORMALIZATION_FIXTURES,
  ...CARRIER_ADVERSARIAL_FIXTURES,
];
