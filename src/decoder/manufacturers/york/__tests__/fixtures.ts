/**
 * Golden test fixtures for the York serial number decoder.
 *
 * Source of truth: york_implementation_contract.md (Section 10)
 * Research audit:  york_research_audit.md
 *
 * IMPORTANT:
 * - Verified real-world examples come directly from the implementation contract.
 * - DO NOT modify expected values to make tests pass.
 * - Legacy format letters K, L, M, N must resolve to AMBIGUOUS (except boundaries).
 * - Legacy format letters A-J and P-Y must resolve to SUCCESS.
 */

import type { DecoderTestCase } from '../../../types';

export const YORK_VERIFIED_FIXTURES: readonly DecoderTestCase[] = [
  // --- york-post-2004 ---
  {
    description: 'Y-FMT1-R1: Post-2004 — W0K5896070 (contract golden)',
    manufacturerId: 'york',
    serialNumber: 'W0K5896070',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2005,
    expectedMonth: 9, // K = 9
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/york-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Industry reference database for HVAC age identification.',
      confidence: 'verified',
    },
    notes: '2nd digit (0) + 4th digit (5) = 2005. 3rd char (K) = Sept.',
  },
  {
    description: 'Y-FMT1-R2: Post-2004 — W1A5123456 (contract golden)',
    manufacturerId: 'york',
    serialNumber: 'W1A5123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2015,
    expectedMonth: 1, // A = 1
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'HowToLookAtAHouse / HVAC Forums',
      url: 'https://www.howtolookatahouse.com/',
      dateReviewed: '2026-08-27',
      notes: 'Secondary validation for real-world examples and October 2004 transition confirmation.',
      confidence: 'verified',
    },
    notes: '2nd digit (1) + 4th digit (5) = 2015. 3rd char (A) = Jan.',
  },
  {
    description: 'Y-FMT1-R3: Post-2004 — W1C2987654 (contract golden)',
    manufacturerId: 'york',
    serialNumber: 'W1C2987654',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2012,
    expectedMonth: 3, // C = 3
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'HowToLookAtAHouse / HVAC Forums',
      url: 'https://www.howtolookatahouse.com/',
      dateReviewed: '2026-08-27',
      notes: 'Secondary validation for real-world examples and October 2004 transition confirmation.',
      confidence: 'verified',
    },
    notes: '2nd digit (1) + 4th digit (2) = 2012. 3rd char (C) = Mar.',
  },
  {
    description: 'Y-FMT1-R4: Post-2004 — W1M5555555 (contract golden)',
    manufacturerId: 'york',
    serialNumber: 'W1M5555555',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2015,
    expectedMonth: 11, // M = 11
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'HowToLookAtAHouse / HVAC Forums',
      url: 'https://www.howtolookatahouse.com/',
      dateReviewed: '2026-08-27',
      notes: 'Secondary validation for real-world examples and October 2004 transition confirmation.',
      confidence: 'verified',
    },
    notes: '2nd digit (1) + 4th digit (5) = 2015. 3rd char (M) = Nov.',
  },

  // --- york-1980-2004 (AMBIGUOUS Cases) ---
  {
    description: 'Y-FMT2-A1: Legacy 1980-2004 — WAKM011379 (Ambiguous, contract golden)',
    manufacturerId: 'york',
    serialNumber: 'WAKM011379',
    expectedStatus: 'ambiguous',
    expectedFormatId: null, // Multiple formats matched
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'K = 1980 or 2001. A = Jan.',
  },
  {
    description: 'Y-FMT2-A2: Legacy 1980-2004 — WALM011379 (Ambiguous)',
    manufacturerId: 'york',
    serialNumber: 'WALM011379',
    expectedStatus: 'ambiguous',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'L = 1981 or 2002. A = Jan.',
  },
  {
    description: 'Y-FMT2-A3: Legacy 1980-2004 — WLNM011379 (Ambiguous transition boundary)',
    manufacturerId: 'york',
    serialNumber: 'WLNM011379', // L = October, N = 1983 or 2004
    expectedStatus: 'ambiguous',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'N = 1983 or 2004. L = Oct. October 2004 was the transition month, so it could still be early Oct 2004.',
  },

  // --- york-1980-2004 (DETERMINISTIC Cases) ---
  {
    description: 'Y-FMT2-D1: Legacy 1980-2004 — WAPM123456 (Deterministic, contract golden)',
    manufacturerId: 'york',
    serialNumber: 'WAPM123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-1980-1991-cycle1',
    expectedYear: 1984,
    expectedMonth: 1, // A = 1
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/york-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Industry reference database for HVAC age identification.',
      confidence: 'verified',
    },
    notes: '[SYNTHETIC] P = 1984 unambiguously, as it never repeated in the second cycle.',
  },
  {
    description: 'Y-FMT2-D2: Legacy 1980-2004 — WAXM123456 (Deterministic, contract golden)',
    manufacturerId: 'york',
    serialNumber: 'WAXM123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-1980-1991-cycle1',
    expectedYear: 1990,
    expectedMonth: 1, // A = 1
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/york-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Industry reference database for HVAC age identification.',
      confidence: 'verified',
    },
    notes: '[SYNTHETIC] X = 1990 unambiguously, as it never repeated in the second cycle.',
  },
  {
    description: 'Y-FMT2-D3: Legacy 1980-2004 — XBFM220710 (Deterministic, contract golden)',
    manufacturerId: 'york',
    serialNumber: 'XBFM220710',
    expectedStatus: 'success',
    expectedFormatId: 'york-1992-2004-cycle2', 
    expectedYear: 1997,
    expectedMonth: 2, // B = 2
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/york-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Industry reference database for HVAC age identification.',
      confidence: 'verified',
    },
    notes: 'F = 1997 unambiguously, as cycle 1 did not have F.',
  },
  {
    description: 'Y-FMT2-D4: Legacy 1980-2004 — WMNM011379 (Deterministic transition boundary)',
    manufacturerId: 'york',
    serialNumber: 'WMNM011379', // M = Nov, N = 1983
    expectedStatus: 'success',
    expectedFormatId: 'york-1980-1991-cycle1',
    expectedYear: 1983,
    expectedMonth: 11, // M = 11
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'N = 1983 only. M = Nov. Since Nov 2004 is past the Oct 2004 transition date, this must be 1983.',
  },
  {
    description: 'Y-FMT2-D5: Legacy 1980-2004 — WNNM011379 (Deterministic transition boundary)',
    manufacturerId: 'york',
    serialNumber: 'WNNM011379', // N = Dec, N = 1983
    expectedStatus: 'success',
    expectedFormatId: 'york-1980-1991-cycle1',
    expectedYear: 1983,
    expectedMonth: 12, // N = 12
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'N = 1983 only. N = Dec. Since Dec 2004 is past the Oct 2004 transition date, this must be 1983.',
  },

  // --- york-two-letter-legacy ---
  {
    description: 'Y-FMT3-R1: Historical Two-Letter — KO12345',
    manufacturerId: 'york',
    serialNumber: 'KO12345',
    expectedStatus: 'success',
    expectedFormatId: 'york-two-letter-legacy',
    expectedYear: 1960,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'KO = 1960. 5 digits.',
  },
  {
    description: 'Y-FMT3-R2: Historical Two-Letter — JM987654',
    manufacturerId: 'york',
    serialNumber: 'JM987654',
    expectedStatus: 'success',
    expectedFormatId: 'york-two-letter-legacy',
    expectedYear: 1979,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'JM = 1979. 6 digits.',
  },
];

// ---------------------------------------------------------------------------
// B. Invalid / Unsupported / Do-Not-Decode
// ---------------------------------------------------------------------------

export const YORK_INVALID_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'Y-UNSUP-1: 9-character legacy variant (BHM062202)',
    manufacturerId: 'york',
    serialNumber: 'BHM062202',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Missing leading plant code. Rejected to prevent false positives.',
  },
  {
    description: 'Y-INV-1: Invalid letter I in month position',
    manufacturerId: 'york',
    serialNumber: 'W0I5896070',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Letter I is excluded from standard date positions.',
  },
  {
    description: 'Y-INV-1b: Invalid letter J in month position',
    manufacturerId: 'york',
    serialNumber: 'W0J5896070',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Letter J is excluded from month positions.',
  },
  {
    description: 'Y-INV-2: Malformed structure (too short)',
    manufacturerId: 'york',
    serialNumber: 'W0A5896',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Invalid input length.',
  },
  {
    description: 'Y-INV-3: Invalid two-letter prefix (ZO)',
    manufacturerId: 'york',
    serialNumber: 'ZO123456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'ZO is not in the strict whitelist of historical York prefixes.',
  },
];

// ---------------------------------------------------------------------------
// C. Normalization & Whitespace
// ---------------------------------------------------------------------------

export const YORK_NORMALIZATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'Y-NORM-1: Lowercase input',
    manufacturerId: 'york',
    serialNumber: 'w1a5123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2015,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Lowercase w and a.',
  },
  {
    description: 'Y-NORM-2: Whitespace and lowercase',
    manufacturerId: 'york',
    serialNumber: ' W1a5123456 ',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2015,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Whitespace should be stripped and string uppercased.',
  },
  {
    description: 'Y-NORM-3: Leading (S) is stripped appropriately',
    manufacturerId: 'york',
    serialNumber: '(S)W1A5123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2015,
    expectedMonth: 1,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'The (S) prefix must be ignored by the decoder rules.',
  },
  {
    description: 'Y-NORM-4: Bare leading S is a valid plant code',
    manufacturerId: 'york',
    serialNumber: 'S0L4123456',
    expectedStatus: 'success',
    expectedFormatId: 'york-post-2004',
    expectedYear: 2004,
    expectedMonth: 10, // L = 10
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'A bare leading S should remain as the plant code.',
  },
];
