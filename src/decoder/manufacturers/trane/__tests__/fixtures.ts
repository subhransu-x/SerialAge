/**
 * Golden test fixtures for the Trane serial number decoder.
 *
 * Source of truth: trane_implementation_contract.md (Sections 8 and 9)
 * Research audit:  trane_research_audit.md (Parts 3, 5, 6, 7)
 *
 * IMPORTANT:
 * - Verified real-world examples come from documented sources (contract Section 8).
 * - Adversarial inputs come directly from contract Section 9.
 * - DO NOT modify expected values to make tests pass.
 * - DO NOT fabricate serial numbers outside what the contract provides.
 * - Synthetic structural/boundary tests are explicitly labeled as such.
 */

import type { DecoderTestCase } from '../../../types';

// ---------------------------------------------------------------------------
// A. Verified Real-World Fixtures — from contract Section 8 (Golden Fixtures)
// ---------------------------------------------------------------------------

export const TRANE_VERIFIED_FIXTURES: readonly DecoderTestCase[] = [
  // --- trane-modern-10 (2010–present) ---
  {
    description: 'T-MOD-R1: Modern 10-char — 2011 Week 24 (PickHVAC verified)',
    manufacturerId: 'trane',
    serialNumber: '11241KADBB',
    expectedStatus: 'success',
    expectedFormatId: 'trane-modern-10',
    expectedYear: 2011,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'PickHVAC.com',
      url: 'https://pickhvac.com',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 primary example for trane-modern-10.',
      confidence: 'verified',
    },
    notes: 'Primary contract golden fixture for 2010+ format. Chars 1-2 = year, 3-4 = week.',
  },
  {
    description: 'T-MOD-R2: Modern 10-char — 2010 Week 16 (BIC verified)',
    manufacturerId: 'trane',
    serialNumber: '10161KEDAA',
    expectedStatus: 'success',
    expectedFormatId: 'trane-modern-10',
    expectedYear: 2010,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/trane-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 second example for trane-modern-10. Earliest year in format.',
      confidence: 'verified',
    },
    notes: 'Boundary year for 2010+ format. Also tests that "10" → 2010 (not confused with 2002-2009).',
  },

  // --- trane-standard-9 (2002–2009) ---
  {
    description: 'T-STD-R1: Standard 9-char — 2008 Week 14 (PickHVAC verified)',
    manufacturerId: 'trane',
    serialNumber: '81422S41G',
    expectedStatus: 'success',
    expectedFormatId: 'trane-standard-9',
    expectedYear: 2008,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'PickHVAC.com',
      url: 'https://pickhvac.com',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 primary example for trane-standard-9.',
      confidence: 'verified',
    },
    notes: 'Primary contract golden fixture for 2002-2009 format. Char 1 = last year digit.',
  },
  {
    description: 'T-STD-R2: Standard 9-char — 2009 Week 15 (BIC verified)',
    manufacturerId: 'trane',
    serialNumber: '91531S41F',
    expectedStatus: 'success',
    expectedFormatId: 'trane-standard-9',
    expectedYear: 2009,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/trane-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 second example for trane-standard-9. Latest year in format.',
      confidence: 'verified',
    },
    notes: 'Latest possible year in the 2002-2009 era format.',
  },

  // --- trane-letter-9 (1983–2001) ---
  {
    description: 'T-LTR-R1: Letter-prefix 9-char — R=2000 Week 17 (BIC verified)',
    manufacturerId: 'trane',
    serialNumber: 'R1742DWBF',
    expectedStatus: 'success',
    expectedFormatId: 'trane-letter-9',
    expectedYear: 2000,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/trane-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 primary example for trane-letter-9. R=2000.',
      confidence: 'verified',
    },
    notes: 'Primary contract golden fixture for 1983-2001 format. Letter R maps to year 2000.',
  },
  {
    description: 'T-LTR-R2: Letter-prefix 9-char — M=1997 Week 35 (BIC verified)',
    manufacturerId: 'trane',
    serialNumber: 'M35123456',
    expectedStatus: 'success',
    expectedFormatId: 'trane-letter-9',
    expectedYear: 1997,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/trane-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 example for trane-letter-9. M=1997.',
      confidence: 'verified',
    },
    notes: 'Letter M maps to 1997. Week 35 is a typical mid-year production week.',
  },
  {
    description: 'T-LTR-R3: Letter-prefix 9-char — W=1983 Week 01 (BIC verified, boundary)',
    manufacturerId: 'trane',
    serialNumber: 'W01123456',
    expectedStatus: 'success',
    expectedFormatId: 'trane-letter-9',
    expectedYear: 1983,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/trane-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 8 example for trane-letter-9. W=1983, earliest supported year.',
      confidence: 'verified',
    },
    notes: 'W is the first letter in the mapping (1983). Week 01 is the boundary low week.',
  },
] as const;

// ---------------------------------------------------------------------------
// B. Adversarial Fixtures — from contract Section 9
// ---------------------------------------------------------------------------

/**
 * Adversarial test cases that MUST fail cleanly.
 * Source: trane_implementation_contract.md Section 9.
 */
export const TRANE_ADVERSARIAL_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'T-ADV-1: Week 60 is out of bounds (01-53) — contract Section 9',
    manufacturerId: 'trane',
    serialNumber: '11601KADBB',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Week 60 fails the regex week validation (0[1-9]|[1-4][0-9]|5[0-3]). ' +
      'Must not decode. Contract Section 9, adversarial row 1.',
  },
  {
    description: 'T-ADV-2: Letter "A" is not a valid year letter — contract Section 9',
    manufacturerId: 'trane',
    serialNumber: 'A12345678',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '"A" is not in the letter-year dictionary (WXYSCBDEFGHJKLMNPRZ). ' +
      'Must not decode. Contract Section 9, adversarial row 2.',
  },
  {
    description: 'T-ADV-3: 8-character input is too short — contract Section 9',
    manufacturerId: 'trane',
    serialNumber: '12345678',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '8 characters is shorter than the minimum supported length (9). ' +
      'Must not decode. Contract Section 9, adversarial row 3.',
  },
  {
    description: 'T-ADV-4: 9-char starting with "0" — invalid for 2002-2009 era — contract Section 9',
    manufacturerId: 'trane',
    serialNumber: '01531S41F',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Format 2002-2009 requires first char [2-9]. "0" fails the regex. ' +
      '"0" also not in letter-year dictionary. Must not decode. Contract Section 9, adversarial row 4.',
  },
  {
    description: 'T-ADV-5: 10-char letter-start legacy — explicitly unsupported — contract Section 9',
    manufacturerId: 'trane',
    serialNumber: 'H011870M03',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '"H011870M03" is 10 chars starting with a letter. ' +
      'Per contract Section 3 and research audit Part 6, this is a pre-1983 style conflict. ' +
      'The legacy-unsupported trap must catch it. Contract Section 9, adversarial row 5.',
  },
] as const;

// ---------------------------------------------------------------------------
// C. Boundary Cases — synthetic, per contract Section 7 (ambiguity resolution)
// ---------------------------------------------------------------------------

/**
 * Boundary tests for year/week extremes and format transitions.
 * Labeled synthetic per AI_ENGINEERING_RULES.md Rule 17.
 */
export const TRANE_BOUNDARY_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'T-BND-1 [SYNTHETIC]: trane-standard-9 — first year (2002, week 01)',
    manufacturerId: 'trane',
    serialNumber: '201AABBCC',
    expectedStatus: 'success',
    expectedFormatId: 'trane-standard-9',
    expectedYear: 2002,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Synthetic. Confirms "2" → 2002 (earliest year in the 2002-2009 era). Week 01 is minimum week.',
  },
  {
    description: 'T-BND-2 [SYNTHETIC]: trane-standard-9 — last year (2009, week 53)',
    manufacturerId: 'trane',
    serialNumber: '953AABBCC',
    expectedStatus: 'success',
    expectedFormatId: 'trane-standard-9',
    expectedYear: 2009,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Synthetic. Confirms "9" → 2009 (latest year in the 2002-2009 era). Week 53 is maximum week.',
  },
  {
    description: 'T-BND-3 [SYNTHETIC]: trane-letter-9 — last letter Z=2001, week 53',
    manufacturerId: 'trane',
    serialNumber: 'Z53AABBCC',
    expectedStatus: 'success',
    expectedFormatId: 'trane-letter-9',
    expectedYear: 2001,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Synthetic. Confirms "Z" → 2001 (latest year in the 1983-2001 era). Week 53 is maximum week.',
  },
  {
    description: 'T-BND-4 [SYNTHETIC]: trane-modern-10 — week 53 (maximum allowed)',
    manufacturerId: 'trane',
    serialNumber: '2353AABBCC',
    expectedStatus: 'success',
    expectedFormatId: 'trane-modern-10',
    expectedYear: 2023,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Synthetic. Confirms that week 53 (the maximum) is valid for trane-modern-10.',
  },
  {
    description: 'T-BND-5 [SYNTHETIC]: Invalid week 54 for trane-modern-10 — must fail',
    manufacturerId: 'trane',
    serialNumber: '2354AABBCC',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic. Confirms that week 54 fails the regex (max is 53). Must not decode.',
  },
  {
    description: 'T-BND-6 [SYNTHETIC]: Invalid week 00 for trane-modern-10 — must fail',
    manufacturerId: 'trane',
    serialNumber: '2300AABBCC',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic. Confirms that week 00 fails the regex (min is 01). Must not decode.',
  },
] as const;

// ---------------------------------------------------------------------------
// D. Unsupported / Legacy Fixtures
// ---------------------------------------------------------------------------

export const TRANE_UNSUPPORTED_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'T-UNS-1: 7-char input — pre-1983 or unknown era',
    manufacturerId: 'trane',
    serialNumber: '1234567',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Research audit Part 6: "Any 7-to-8 char string → Unsupported." 7 chars triggers the legacy trap.',
  },
  {
    description: 'T-UNS-2: 5-char input — far too short, pre-1983 era',
    manufacturerId: 'trane',
    serialNumber: '12345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Research audit Part 6: short strings from pre-1983 eras must be trapped as unsupported.',
  },
  {
    description: 'T-UNS-3: 10-char letter-start (different letter) — must be unsupported',
    manufacturerId: 'trane',
    serialNumber: 'A1234567BB',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Contract Section 3: "Any 10-character serial starting with a letter" → Unsupported. ' +
      '"A" at position 1 of a 10-char string triggers the legacy trap.',
  },
] as const;

// ---------------------------------------------------------------------------
// E. Normalization Fixtures — case insensitivity
// ---------------------------------------------------------------------------

export const TRANE_NORMALIZATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'T-NRM-1: Lowercase modern-10 — should normalize and decode correctly',
    manufacturerId: 'trane',
    serialNumber: '11241kadbb',
    expectedStatus: 'success',
    expectedFormatId: 'trane-modern-10',
    expectedYear: 2011,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Lowercase version of golden fixture T-MOD-R1. Normalization uppercases input before matching.',
  },
  {
    description: 'T-NRM-2: Lowercase letter-9 — should normalize and decode correctly',
    manufacturerId: 'trane',
    serialNumber: 'r1742dwbf',
    expectedStatus: 'success',
    expectedFormatId: 'trane-letter-9',
    expectedYear: 2000,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Lowercase version of golden fixture T-LTR-R1. The "r" normalizes to "R" → year 2000.',
  },
  {
    description: 'T-NRM-3: Padded with spaces — should strip and decode correctly',
    manufacturerId: 'trane',
    serialNumber: '  11241KADBB  ',
    expectedStatus: 'success',
    expectedFormatId: 'trane-modern-10',
    expectedYear: 2011,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes:
      'Leading/trailing spaces are trimmed by the normalization pipeline before format matching.',
  },
] as const;

// ---------------------------------------------------------------------------
// F. Manufacturer Isolation Fixtures
// ---------------------------------------------------------------------------

/**
 * Cross-manufacturer input behavior documentation.
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * The Trane decoder operates on structural patterns only. When a user selects
 * "Trane" as the manufacturer, the decoder applies only Trane format rules.
 * It cannot know the serial was "meant" for a different manufacturer.
 *
 * Some Carrier/Goodman/Lennox serials will structurally match Trane patterns
 * and produce a plausible-but-wrong result. This is expected behavior for
 * wrong-manufacturer input — the user must select the correct manufacturer.
 *
 * We test serials that are STRUCTURALLY INCOMPATIBLE with all Trane formats.
 */
export const TRANE_ISOLATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    // Carrier YYMM legacy: 9 all-digit, starts with 8 (matches trane-standard-9 structurally)
    // BUT: "850304091" → char1="8" (valid), week chars "50" → week 50 (valid!), suffix "04091"
    // This WOULD decode under trane-standard-9 as 2008 week 50. Documents the cross-talk.
    // We test a Carrier legacy that is truly incompatible: 7-char Style 4 = unsupported.
    description: 'T-ISO-1: Carrier Style 4 legacy 7-char (A167890) — must fail under Trane (unsupported trap)',
    manufacturerId: 'trane',
    serialNumber: 'A167890',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '"A167890" is a Carrier Style 4 legacy serial (7 chars). Under Trane this is 7 chars, ' +
      'which triggers the legacy-unsupported trap (3-8 chars → Unsupported). No cross-talk.',
  },
  {
    description: 'T-ISO-2: Carrier Style 3 8-char (W4D14008) — must fail under Trane (unsupported trap)',
    manufacturerId: 'trane',
    serialNumber: 'W4D14008',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '"W4D14008" is a Carrier Style 3 8-char legacy serial. Under Trane, 8 chars triggers ' +
      'the legacy-unsupported trap. No successful decode.',
  },
  {
    description: 'T-ISO-3: Random alphanumeric 11-char string — must fail under Trane (no match)',
    manufacturerId: 'trane',
    serialNumber: 'ABCDE123456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '11-char input. No Trane format supports 11 chars (9 or 10 only). ' +
      'No legacy trap matches 11-char (trap covers 3-8 and 10-char-letter-start). ' +
      'Falls through to generic unsupported.',
  },
] as const;
