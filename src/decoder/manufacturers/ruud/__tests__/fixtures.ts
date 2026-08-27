/**
 * Golden test fixtures for the Ruud serial number decoder.
 *
 * Source of truth: rheem_ruud_implementation_contract.md (Sections 4 and 6)
 * Research audit:  rheem_ruud_research_audit.md
 *
 * IMPORTANT:
 * - Verified real-world examples come directly from the implementation contract.
 * - Adversarial inputs are contract-specified or clearly labeled [SYNTHETIC].
 * - DO NOT modify expected values to make tests pass.
 * - DO NOT add serial numbers not present in the contract without explicit labeling.
 * - Synthetic structural/boundary tests are explicitly labeled as such.
 */

import type { DecoderTestCase } from '../../../types';

// ---------------------------------------------------------------------------
// A. Verified Contract Fixtures (rheem_ruud_implementation_contract.md Section 4)
// ---------------------------------------------------------------------------

export const RUUD_VERIFIED_FIXTURES: readonly DecoderTestCase[] = [
  // --- ruud-standard-10 (Format 1) ---
  {
    description: 'RU-FMT1-R1: Standard 10-char — W plant, week 42, year 2017 (contract golden)',
    manufacturerId: 'ruud',
    serialNumber: 'W421724596',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/rheem-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 4 primary golden fixture for Format 1.',
      confidence: 'verified',
    },
    notes: 'W=plant, 42=week, 17=2017, 24596=sequence. Primary Format 1 golden fixture.',
  },
  {
    description: 'RU-FMT1-R2: Standard 10-char — F plant, week 03, year 1992 (contract golden)',
    manufacturerId: 'ruud',
    serialNumber: 'F039212345',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 1992,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/rheem-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 4 second golden fixture for Format 1.',
      confidence: 'verified',
    },
    notes: 'F=plant, 03=week 3, 92=1992, 12345=sequence. Tests century resolution for 1992.',
  },

  // --- ruud-embedded-plant (Format 2) ---
  {
    description: 'RU-FMT2-R1: Embedded plant — CB5D302F099903346 → F plant, week 09, year 1999 (contract golden)',
    manufacturerId: 'ruud',
    serialNumber: 'CB5D302F099903346',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-embedded-plant',
    expectedYear: 1999,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/rheem-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 4 golden fixture for Format 2 Style 2.',
      confidence: 'verified',
    },
    notes: 'F=plant letter embedded in prefix. F09=week 9, 99=1999. Contract example.',
  },
  {
    description: 'RU-FMT2-R2: Embedded plant — 7351 M2806 16735 → M plant, week 28, year 2006 (contract golden)',
    manufacturerId: 'ruud',
    serialNumber: '7351 M2806 16735',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-embedded-plant',
    expectedYear: 2006,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/rheem-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 4 golden fixture for Format 2 Style 3 with spaces.',
      confidence: 'verified',
    },
    notes: 'M=plant, 28=week, 06=2006. Contains spaces per contract. Tests whitespace in serial.',
  },
  {
    description: 'RU-FMT2-R3: Embedded plant — AB6D307-M-0999 → M plant, week 09, year 1999 (contract golden)',
    manufacturerId: 'ruud',
    serialNumber: 'AB6D307-M-0999',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-embedded-plant',
    expectedYear: 1999,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: {
      name: 'Building Intelligence Center',
      url: 'https://www.building-center.org/rheem-hvac-age/',
      dateReviewed: '2026-08-27',
      notes: 'Contract Section 4 golden fixture for Format 2 with hyphens.',
      confidence: 'verified',
    },
    notes: 'M=plant, 09=week, 99=1999. Hyphenated format per contract.',
  },
] as const;

// ---------------------------------------------------------------------------
// B. Invalid / Unsupported Fixtures (contract Section 4, explicit invalids)
// ---------------------------------------------------------------------------

export const RUUD_INVALID_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'RU-INV-1: Week 55 is out of range (01-53) — contract invalid',
    manufacturerId: 'ruud',
    serialNumber: 'W551724596',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Week 55 fails the regex week range (0[1-9]|[1-4][0-9]|5[0-3]). Contract Section 4.',
  },
  {
    description: 'RU-INV-2: 9-character input — too short (contract minimum is 10)',
    manufacturerId: 'ruud',
    serialNumber: 'W42172459',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: '9 chars — fails Format 1 (requires exactly 10) and Format 2 (minimum 10). Contract Section 2.',
  },
  {
    description: 'RU-INV-3: All-numeric 10-digit string — water heater format, not supported',
    manufacturerId: 'ruud',
    serialNumber: '1291123456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'All-numeric 10-digit pattern is the Ruud water heater format. ' +
      'Contract Section 2 explicitly excludes water heater decoding.',
  },
  {
    description: 'RU-INV-4: Short garbage input — contract invalid',
    manufacturerId: 'ruud',
    serialNumber: 'XYZ123',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Only 6 chars — far below minimum. No format matches. Contract Section 4.',
  },
  {
    description: 'RU-INV-5: Empty string — invalid input',
    manufacturerId: 'ruud',
    serialNumber: '',
    expectedStatus: 'invalid-input',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Empty string must be caught by the pipeline input validation layer.',
  },
] as const;

// ---------------------------------------------------------------------------
// C. Boundary Cases — synthetic, per contract section extremes
// ---------------------------------------------------------------------------

export const RUUD_BOUNDARY_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'RU-BND-1 [SYNTHETIC]: Format 1 — minimum week (01)',
    manufacturerId: 'ruud',
    serialNumber: 'W011724596',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Week 01 is the minimum valid week. Confirms lower week boundary.',
  },
  {
    description: 'RU-BND-2 [SYNTHETIC]: Format 1 — maximum week (53)',
    manufacturerId: 'ruud',
    serialNumber: 'W531724596',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Week 53 is the maximum valid week. Confirms upper week boundary.',
  },
  {
    description: 'RU-BND-3 [SYNTHETIC]: Format 1 — invalid week 54 — must fail',
    manufacturerId: 'ruud',
    serialNumber: 'W541724596',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Week 54 exceeds maximum. Regex should reject.',
  },
  {
    description: 'RU-BND-4 [SYNTHETIC]: Format 1 — invalid week 00 — must fail',
    manufacturerId: 'ruud',
    serialNumber: 'W001724596',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. Week 00 is below minimum. Regex should reject.',
  },
] as const;

// ---------------------------------------------------------------------------
// D. Normalization Fixtures — case insensitivity, whitespace
// ---------------------------------------------------------------------------

export const RUUD_NORMALIZATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'RU-NRM-1: Lowercase Format 1 — should normalize and decode correctly',
    manufacturerId: 'ruud',
    serialNumber: 'w421724596',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Lowercase version of golden fixture RU-FMT1-R1. Normalization uppercases input.',
  },
  {
    description: 'RU-NRM-2: Leading/trailing whitespace — should strip and decode',
    manufacturerId: 'ruud',
    serialNumber: '  W421724596  ',
    expectedStatus: 'success',
    expectedFormatId: 'ruud-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Leading and trailing spaces trimmed by normalization pipeline.',
  },
] as const;

// ---------------------------------------------------------------------------
// E. Adversarial Fixtures — Format 2 false-positive analysis
// ---------------------------------------------------------------------------

export const RUUD_ADVERSARIAL_FIXTURES: readonly DecoderTestCase[] = [
  {
    description:
      'RU-ADV-1 [SYNTHETIC]: Short string with M + valid digits — below minimum length, must reject',
    manufacturerId: 'ruud',
    serialNumber: 'AM2806',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic adversarial. 6 chars — below 10-char minimum for Format 2. ' +
      'Demonstrates the length guard prevents short false positives.',
  },
  {
    description:
      'RU-ADV-2 [SYNTHETIC]: Trane modern-10 serial — must not match Ruud Format 1 or Format 2',
    manufacturerId: 'ruud',
    serialNumber: '11241KADBB',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic isolation. Trane modern-10 serial starts with digits, not a letter. ' +
      'Ruud Format 1 requires letter at position 0. ' +
      'Ruud Format 2 requires [A-Z0-9\\-\\s]+ prefix before a plant letter. ' +
      '"11241KADBB" contains no F/M/G/N/W in valid plant-letter position.',
  },
  {
    description:
      'RU-ADV-3 [SYNTHETIC]: Goodman all-numeric serial — must not match Ruud',
    manufacturerId: 'ruud',
    serialNumber: '2104123456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic isolation. Goodman 10-digit format is all numeric — no leading letter. ' +
      'Ruud Format 1 requires letter at position 0. Format 2 needs plant letter in middle.',
  },
  {
    description:
      'RU-ADV-4 [SYNTHETIC]: Lennox 10-char serial — must not match Ruud',
    manufacturerId: 'ruud',
    serialNumber: '5806K12345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic isolation. Lennox format starts with 2 digits, then letter at position 3. ' +
      'Ruud Format 1 requires letter at position 0 (fails: "5" is not a letter). ' +
      'Format 2: "K" at position 4 is not in plant letter set {F,M,G,N,W}.',
  },
  {
    description:
      'RU-ADV-5 [SYNTHETIC]: Carrier modern 10-char serial — must not match Ruud',
    manufacturerId: 'ruud',
    serialNumber: '4206A12345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Synthetic isolation. Carrier format starts with 2 digits. ' +
      'Ruud Format 1 requires letter at position 0. ' +
      'Format 2: "A" at position 4 is not in plant letter set {F,M,G,N,W}.',
  },
  {
    description:
      'RU-ADV-6 [PHASE-8F-FIXED]: Long random string with embedded M — NOW correctly rejected after Phase 8F fix',
    manufacturerId: 'ruud',
    serialNumber: 'RANDOMSTRINGM280612345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '[PHASE 8F FIX] Previously accepted as a false positive. Now correctly rejected: ' +
      '"RANDOMSTRING" is a pure-alpha prefix (no digits), fails mixed-prefix requirement.',
  },
  {
    description:
      'RU-ADV-NEW-1 [PHASE-8F]: Typo extra W prefix (WW421724596) — must reject after fix',
    manufacturerId: 'ruud',
    serialNumber: 'WW421724596',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: '[PHASE 8F FIX] Pure-alpha WW prefix, fails mixed-prefix requirement.',
  },
  {
    description:
      'RU-ADV-NEW-2 [PHASE-8F]: MODELF039212345 (all-alpha prefix) — must reject after fix',
    manufacturerId: 'ruud',
    serialNumber: 'MODELF039212345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: '[PHASE 8F FIX] Pure-alpha MODEL prefix, fails mixed-prefix requirement.',
  },
  {
    description:
      'RU-ADV-NEW-3 [PHASE-8F]: 1234567F059900000 (all-digit prefix) — must reject after fix',
    manufacturerId: 'ruud',
    serialNumber: '1234567F059900000',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: '[PHASE 8F FIX] All-digit prefix 1234567, fails mixed-prefix requirement (no letters).',
  },
  {
    description:
      'RU-ADV-7 [SYNTHETIC]: Week 00 in embedded format — must reject',
    manufacturerId: 'ruud',
    serialNumber: 'CB5D302F009903346',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. F00 = week 00 which is below minimum. Regex rejects week 00.',
  },
  {
    description:
      'RU-ADV-8 [SYNTHETIC]: Week 54 in embedded format — must reject',
    manufacturerId: 'ruud',
    serialNumber: 'CB5D302F549903346',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes: 'Synthetic. F54 = week 54 which exceeds maximum (53). Regex rejects week 54.',
  },
] as const;

// ---------------------------------------------------------------------------
// F. Manufacturer Isolation Fixtures
// ---------------------------------------------------------------------------

export const RUUD_ISOLATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description:
      'RU-ISO-1: Trane letter-9 serial (R1742DWBF) — must fail under Ruud decoder',
    manufacturerId: 'ruud',
    serialNumber: 'R1742DWBF',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Trane letter-9 format is exactly 9 characters. ' +
      'Ruud Format 1 requires exactly 10. ' +
      'Ruud Format 2 requires minimum 10. ' +
      '9-char input fails both Ruud formats. No false positive.',
  },
  {
    description:
      'RU-ISO-2: Trane modern-10 serial (11241KADBB) — must fail under Ruud decoder',
    manufacturerId: 'ruud',
    serialNumber: '11241KADBB',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'Trane modern-10 starts with "11" (two digits). ' +
      'Ruud Format 1 requires letter at position 0. Fails immediately. ' +
      'Format 2: "11241KADBB" contains no F/M/G/N/W in a plant-letter context.',
  },
] as const;
