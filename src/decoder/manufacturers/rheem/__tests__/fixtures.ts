/**
 * Golden test fixtures for the Rheem serial number decoder.
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

export const RHEEM_VERIFIED_FIXTURES: readonly DecoderTestCase[] = [
  // --- rheem-standard-10 (Format 1) ---
  {
    description: 'R-FMT1-R1: Standard 10-char — W plant, week 42, year 2017 (contract golden)',
    manufacturerId: 'rheem',
    serialNumber: 'W421724596',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
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
    description: 'R-FMT1-R2: Standard 10-char — F plant, week 03, year 1992 (contract golden)',
    manufacturerId: 'rheem',
    serialNumber: 'F039212345',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
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

  // --- rheem-embedded-plant (Format 2) ---
  {
    description: 'R-FMT2-R1: Embedded plant — CB5D302F099903346 → F plant, week 09, year 1999 (contract golden)',
    manufacturerId: 'rheem',
    serialNumber: 'CB5D302F099903346',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-embedded-plant',
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
    description: 'R-FMT2-R2: Embedded plant — 7351 M2806 16735 → M plant, week 28, year 2006 (contract golden)',
    manufacturerId: 'rheem',
    serialNumber: '7351 M2806 16735',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-embedded-plant',
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
    description: 'R-FMT2-R3: Embedded plant — AB6D307-M-0999 → M plant, week 09, year 1999 (contract golden)',
    manufacturerId: 'rheem',
    serialNumber: 'AB6D307-M-0999',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-embedded-plant',
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

export const RHEEM_INVALID_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'R-INV-1: Week 55 is out of range (01-53) — contract invalid',
    manufacturerId: 'rheem',
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
    description: 'R-INV-2: 9-character input — too short (contract minimum is 10)',
    manufacturerId: 'rheem',
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
    description: 'R-INV-3: All-numeric 10-digit string — water heater format, not supported',
    manufacturerId: 'rheem',
    serialNumber: '1291123456',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      'All-numeric 10-digit pattern is the Rheem water heater format. ' +
      'Contract Section 2 explicitly excludes water heater decoding. ' +
      'Format 1 requires a leading letter. Format 2 requires a prefix before the plant letter.',
  },
  {
    description: 'R-INV-4: Short garbage input — contract invalid',
    manufacturerId: 'rheem',
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
    description: 'R-INV-5: Empty string — invalid input',
    manufacturerId: 'rheem',
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

/**
 * Boundary tests for year/week extremes.
 * Labeled synthetic per AI_ENGINEERING_RULES.md Rule 17.
 */
export const RHEEM_BOUNDARY_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'R-BND-1 [SYNTHETIC]: Format 1 — minimum week (01)',
    manufacturerId: 'rheem',
    serialNumber: 'W011724596',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Week 01 is the minimum valid week. Confirms lower week boundary.',
  },
  {
    description: 'R-BND-2 [SYNTHETIC]: Format 1 — maximum week (53)',
    manufacturerId: 'rheem',
    serialNumber: 'W531724596',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Synthetic. Week 53 is the maximum valid week. Confirms upper week boundary.',
  },
  {
    description: 'R-BND-3 [SYNTHETIC]: Format 1 — invalid week 54 — must fail',
    manufacturerId: 'rheem',
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
    description: 'R-BND-4 [SYNTHETIC]: Format 1 — invalid week 00 — must fail',
    manufacturerId: 'rheem',
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

export const RHEEM_NORMALIZATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description: 'R-NRM-1: Lowercase Format 1 — should normalize and decode correctly',
    manufacturerId: 'rheem',
    serialNumber: 'w421724596',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
    expectedYear: 2017,
    expectedMonth: null,
    expectedConfidence: 'high',
    expectedProductType: 'unknown',
    source: null,
    notes: 'Lowercase version of golden fixture R-FMT1-R1. Normalization uppercases input.',
  },
  {
    description: 'R-NRM-2: Leading/trailing whitespace — should strip and decode',
    manufacturerId: 'rheem',
    serialNumber: '  W421724596  ',
    expectedStatus: 'success',
    expectedFormatId: 'rheem-standard-10',
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

/**
 * Adversarial tests specifically targeting Format 2's broad regex.
 * The contract regex has no ^ anchor and plant letters F,M,G,N,W are common.
 * These tests document the expected behavior for potentially ambiguous inputs.
 */
export const RHEEM_ADVERSARIAL_FIXTURES: readonly DecoderTestCase[] = [
  {
    description:
      'R-ADV-1 [SYNTHETIC]: Short string with M + valid digits — below minimum length, must reject',
    manufacturerId: 'rheem',
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
      'R-ADV-2 [SYNTHETIC]: Trane modern-10 serial — must not match Rheem Format 1 or Format 2',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires letter at position 0. ' +
      'Rheem Format 2 requires [A-Z0-9\\-\\s]+ prefix before a plant letter. ' +
      '"11241KADBB" contains no F/M/G/N/W in valid plant-letter position.',
  },
  {
    description:
      'R-ADV-3 [SYNTHETIC]: Goodman all-numeric serial — must not match Rheem',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires letter at position 0. Format 2 needs plant letter in middle.',
  },
  {
    description:
      'R-ADV-4 [SYNTHETIC]: Lennox 10-char serial — must not match Rheem',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires letter at position 0 (fails: "5" is not a letter). ' +
      'Format 2: "K" at position 4 is not in plant letter set {F,M,G,N,W}.',
  },
  {
    description:
      'R-ADV-5 [SYNTHETIC]: Carrier modern 10-char serial — must not match Rheem',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires letter at position 0. ' +
      'Format 2: "A" at position 4 is not in plant letter set {F,M,G,N,W}.',
  },
  {
    description:
      'R-ADV-6 [PHASE-8F-FIXED]: Long random string with embedded M — NOW correctly rejected after Phase 8F fix',
    manufacturerId: 'rheem',
    serialNumber: 'RANDOMSTRINGM280612345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '[PHASE 8F FIX] This input was previously accepted as a false positive by the unanchored ' +
      'contract regex. Phase 8F adversarial QA classified the original behavior as a BUG. ' +
      'The fixed two-pattern approach correctly rejects this because "RANDOMSTRING" is a pure-alpha ' +
      'prefix (no digits), failing the mixed-alphanumeric prefix requirement of Pattern A.',
  },
  {
    description:
      'R-ADV-NEW-1 [PHASE-8F]: Typo extra W prefix (WW421724596) — must reject after fix',
    manufacturerId: 'rheem',
    serialNumber: 'WW421724596',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '[PHASE 8F FIX] An extra W prefix was previously accepted via the unanchored regex. ' +
      'Now correctly rejected: prefix WW is pure-alpha (no digits), fails Pattern A mixed check; ' +
      'does not match Pattern B (spaced 3-part).',
  },
  {
    description:
      'R-ADV-NEW-2 [PHASE-8F]: Model-number prefix MODELF... — must reject after fix',
    manufacturerId: 'rheem',
    serialNumber: 'MODELF039212345',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '[PHASE 8F FIX] Pure-alpha prefix MODEL previously triggered a false positive. ' +
      'Now correctly rejected: MODEL has no digits, fails mixed-prefix requirement.',
  },
  {
    description:
      'R-ADV-NEW-3 [PHASE-8F]: All-digit prefix 1234567F... — must reject after fix',
    manufacturerId: 'rheem',
    serialNumber: '1234567F059900000',
    expectedStatus: 'unsupported',
    expectedFormatId: null,
    expectedYear: null,
    expectedMonth: null,
    expectedConfidence: null,
    expectedProductType: null,
    source: null,
    notes:
      '[PHASE 8F FIX] All-digit prefix 1234567 previously triggered a false positive. ' +
      'Now correctly rejected: prefix has no letters, fails mixed-prefix requirement.',
  },
  {
    description:
      'R-ADV-7 [SYNTHETIC]: Week 00 in embedded format — must reject',
    manufacturerId: 'rheem',
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
      'R-ADV-8 [SYNTHETIC]: Week 54 in embedded format — must reject',
    manufacturerId: 'rheem',
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

export const RHEEM_ISOLATION_FIXTURES: readonly DecoderTestCase[] = [
  {
    description:
      'R-ISO-1: Trane letter-9 serial (R1742DWBF) — must fail under Rheem decoder',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires exactly 10. ' +
      'Rheem Format 2 requires minimum 10. ' +
      '9-char input fails both Rheem formats. No false positive.',
  },
  {
    description:
      'R-ISO-2: Trane modern-10 serial (11241KADBB) — must fail under Rheem decoder',
    manufacturerId: 'rheem',
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
      'Rheem Format 1 requires letter at position 0. Fails immediately. ' +
      'Format 2: "11241KADBB" contains no F/M/G/N/W in a plant-letter context.',
  },
] as const;
