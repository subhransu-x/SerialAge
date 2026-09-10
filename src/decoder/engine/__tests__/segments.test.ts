/**
 * DecodeSegment architecture tests.
 *
 * Verifies:
 * 1. Segments are populated for every supported manufacturer's successful decode.
 * 2. Segment positions, values, fields, and descriptions are exact.
 * 3. Segments are NOT produced for unsupported/invalid/ambiguous results.
 * 4. No segment is fabricated for characters the format rule does not define.
 * 5. Ambiguity does not become deterministic — segments live on each candidate.
 * 6. Source metadata is preserved alongside segments.
 * 7. Original/normalized input is preserved alongside segments.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decode } from '../../engine/pipeline';
import {
  registerManufacturer,
  _resetRegistryForTesting,
} from '../../engine/registry';
import type { FormatRule } from '../../types';

// Carrier/Bryant/Payne formats
import { formats as carrierFormats } from '../../manufacturers/carrier/formats';
import { BRYANT_WWYY_SOURCES, BRYANT_YYMM_SOURCES, BRYANT_LEGACY_SOURCES } from '../../manufacturers/bryant/sources';
import { PAYNE_WWYY_SOURCES, PAYNE_YYMM_SOURCES, PAYNE_LEGACY_SOURCES } from '../../manufacturers/payne/sources';

// Goodman/Amana formats
import { formats as goodmanFormats } from '../../manufacturers/goodman/formats';
import { AMANA_MODERN_SOURCES } from '../../manufacturers/amana/sources';

// Other manufacturer formats
import { lennoxFormats } from '../../manufacturers/lennox/formats';
import { formats as traneFormats } from '../../manufacturers/trane/formats';
import { formats as yorkFormats } from '../../manufacturers/york/formats';

const REF = new Date(2026, 7, 23); // August 23 2026 — deterministic

// ---------------------------------------------------------------------------
// Registration helpers
// ---------------------------------------------------------------------------

function registerCarrier() {
  registerManufacturer({ id: 'carrier', name: 'Carrier', formats: carrierFormats });
}

function registerBryant() {
  const wrapped: FormatRule[] = carrierFormats.map((f) => {
    let sources = f.sources;
    if (f.id === 'carrier-wwyy-standard') sources = BRYANT_WWYY_SOURCES;
    if (f.id === 'carrier-yymm-legacy') sources = BRYANT_YYMM_SOURCES;
    if (f.id === 'carrier-legacy-unsupported') sources = BRYANT_LEGACY_SOURCES;
    return { ...f, sources };
  });
  registerManufacturer({ id: 'bryant', name: 'Bryant', formats: wrapped });
}

function registerPayne() {
  const wrapped: FormatRule[] = carrierFormats.map((f) => {
    let sources = f.sources;
    if (f.id === 'carrier-wwyy-standard') sources = PAYNE_WWYY_SOURCES;
    if (f.id === 'carrier-yymm-legacy') sources = PAYNE_YYMM_SOURCES;
    if (f.id === 'carrier-legacy-unsupported') sources = PAYNE_LEGACY_SOURCES;
    return { ...f, sources };
  });
  registerManufacturer({ id: 'payne', name: 'Payne', formats: wrapped });
}

function registerGoodman() {
  registerManufacturer({ id: 'goodman', name: 'Goodman', formats: goodmanFormats });
}

function registerAmana() {
  const base = goodmanFormats.find((f) => f.id === 'goodman-standard-10')!;
  const wrapped: FormatRule[] = [
    { ...base, name: 'Amana Modern (10-Digit)', sources: AMANA_MODERN_SOURCES },
  ];
  registerManufacturer({ id: 'amana', name: 'Amana', formats: wrapped });
}

function registerLennox() {
  registerManufacturer({ id: 'lennox', name: 'Lennox', formats: lennoxFormats });
}

function registerTrane() {
  registerManufacturer({ id: 'trane', name: 'Trane', formats: traneFormats });
}

function registerYork() {
  registerManufacturer({ id: 'york', name: 'York', formats: yorkFormats });
}

// ---------------------------------------------------------------------------
// 1. Carrier — carrier-wwyy-standard (Week + Year + Plant Code)
// ---------------------------------------------------------------------------

describe('Segments: Carrier WWYY Standard', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerCarrier(); });

  it('populates three segments with correct positions/values', () => {
    const result = decode('carrier', '4006A17330', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('carrier-wwyy-standard');
    expect(result.segments).toHaveLength(3);

    const [week, year, plant] = result.segments;

    expect(week.field).toBe('Week');
    expect(week.startIndex).toBe(0);
    expect(week.endIndex).toBe(2);
    expect(week.value).toBe('40');
    expect(week.description).toContain('40');

    expect(year.field).toBe('Year');
    expect(year.startIndex).toBe(2);
    expect(year.endIndex).toBe(4);
    expect(year.value).toBe('06');
    expect(year.description).toContain('2006');

    expect(plant.field).toBe('Plant Code');
    expect(plant.startIndex).toBe(4);
    expect(plant.endIndex).toBe(5);
    expect(plant.value).toBe('A');
  });

  it('does not produce segments for the trailing sequence (positions 5-9)', () => {
    const result = decode('carrier', '4006A17330', { referenceDate: REF });
    expect(result.status).toBe('success');
    const hasTrailingSegment = result.segments.some((s) => s.startIndex >= 5);
    expect(hasTrailingSegment).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Carrier — carrier-yymm-legacy (Year + Month)
// ---------------------------------------------------------------------------

describe('Segments: Carrier YYMM Legacy', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerCarrier(); });

  it('populates two segments with correct positions/values', () => {
    const result = decode('carrier', '850304091', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('carrier-yymm-legacy');
    expect(result.segments).toHaveLength(2);

    const [year, month] = result.segments;
    expect(year.field).toBe('Year');
    expect(year.startIndex).toBe(0);
    expect(year.endIndex).toBe(2);
    expect(year.value).toBe('85');
    expect(year.description).toContain('1985');

    expect(month.field).toBe('Month');
    expect(month.startIndex).toBe(2);
    expect(month.endIndex).toBe(4);
    expect(month.value).toBe('03');
    expect(month.description).toContain('3');
  });
});

// ---------------------------------------------------------------------------
// 3. Goodman — goodman-standard-10 (Year + Month)
// ---------------------------------------------------------------------------

describe('Segments: Goodman Standard 10', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerGoodman(); });

  it('populates correct Year and Month segments', () => {
    const result = decode('goodman', '1903123456', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.segments).toHaveLength(2);

    const [year, month] = result.segments;
    expect(year.field).toBe('Year');
    expect(year.startIndex).toBe(0);
    expect(year.endIndex).toBe(2);
    expect(year.value).toBe('19');
    expect(year.description).toContain('2019');

    expect(month.field).toBe('Month');
    expect(month.startIndex).toBe(2);
    expect(month.endIndex).toBe(4);
    expect(month.value).toBe('03');
  });
});

// ---------------------------------------------------------------------------
// 4. Lennox — lennox-standard-10 (Year at 2-3, Month letter at 4)
// ---------------------------------------------------------------------------

describe('Segments: Lennox Standard 10', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerLennox(); });

  it('populates Year at positions 2-4 and Month letter at position 4-5', () => {
    // XX19E12345 — prefix "XX", year "19" at index 2-3, month "E"=May at index 4
    const result = decode('lennox', 'XX19E12345', { referenceDate: REF });
    expect(result.status).toBe('success');

    const yearSeg = result.segments.find((s) => s.field === 'Year');
    expect(yearSeg).toBeDefined();
    expect(yearSeg!.startIndex).toBe(2);
    expect(yearSeg!.endIndex).toBe(4);
    expect(yearSeg!.value).toBe('19');
    expect(yearSeg!.description).toContain('2019');

    const monthSeg = result.segments.find((s) => s.field === 'Month');
    expect(monthSeg).toBeDefined();
    expect(monthSeg!.startIndex).toBe(4);
    expect(monthSeg!.endIndex).toBe(5);
    expect(monthSeg!.value).toBe('E');
    expect(monthSeg!.description).toContain('5'); // E = month 5
  });

  it('does not add segments for positions beyond what the rule defines', () => {
    const result = decode('lennox', 'XX19E12345', { referenceDate: REF });
    // Positions 0-1 (plant prefix) and 5-9 (sequence) are NOT defined
    const hasUndefinedSeg = result.segments.some((s) => s.startIndex >= 5 || s.endIndex <= 2);
    expect(hasUndefinedSeg).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Trane — trane-modern-10 (Year + Week)
// ---------------------------------------------------------------------------

describe('Segments: Trane Modern 10', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerTrane(); });

  it('populates Year at 0-2 and Week at 2-4', () => {
    const result = decode('trane', '1503ABCDEF', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('trane-modern-10');
    expect(result.segments).toHaveLength(2);

    const [year, week] = result.segments;
    expect(year.field).toBe('Year');
    expect(year.startIndex).toBe(0);
    expect(year.endIndex).toBe(2);
    expect(year.value).toBe('15');
    expect(year.description).toContain('2015');

    expect(week.field).toBe('Week');
    expect(week.startIndex).toBe(2);
    expect(week.endIndex).toBe(4);
    expect(week.value).toBe('03');
  });
});

// ---------------------------------------------------------------------------
// 6. Trane — trane-standard-9 (Year digit + Week)
// ---------------------------------------------------------------------------

describe('Segments: Trane Standard 9', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerTrane(); });

  it('populates Year at 0-1 and Week at 1-3', () => {
    const result = decode('trane', '803ABCDEF', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('trane-standard-9');
    expect(result.segments).toHaveLength(2);

    const [year, week] = result.segments;
    expect(year.field).toBe('Year');
    expect(year.startIndex).toBe(0);
    expect(year.endIndex).toBe(1);
    expect(year.value).toBe('8');
    expect(year.description).toContain('2008');

    expect(week.field).toBe('Week');
    expect(week.startIndex).toBe(1);
    expect(week.endIndex).toBe(3);
    expect(week.value).toBe('03');
  });
});

// ---------------------------------------------------------------------------
// 7. Trane — trane-letter-9 (Year Code letter + Week)
// ---------------------------------------------------------------------------

describe('Segments: Trane Letter 9', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerTrane(); });

  it('populates Year Code at 0-1 and Week at 1-3', () => {
    // W = 1983, 03 = week 3
    const result = decode('trane', 'W03ABCDEF', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('trane-letter-9');
    expect(result.segments).toHaveLength(2);

    const [yearCode, week] = result.segments;
    expect(yearCode.field).toBe('Year Code');
    expect(yearCode.startIndex).toBe(0);
    expect(yearCode.endIndex).toBe(1);
    expect(yearCode.value).toBe('W');
    expect(yearCode.description).toContain('1983');

    expect(week.field).toBe('Week');
    expect(week.startIndex).toBe(1);
    expect(week.endIndex).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 8. Rheem / Ruud
// ---------------------------------------------------------------------------
// Rheem/Ruud structural matchers do not currently map individual character
// segments due to the variable length of prefixes and potential spacing.


// ---------------------------------------------------------------------------
// 10. York — york-post-2004 (Year tens + Month + Year units)
// ---------------------------------------------------------------------------

describe('Segments: York Post-2004', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerYork(); });

  it('populates Year (tens), Month, Year (units) at non-contiguous positions', () => {
    // A1C5123456 — plant "A"[0], digit1 "1"[1], monthLetter "C"[2]=month3, digit2 "5"[3] → year 2015
    const result = decode('york', 'A1C5123456', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.formatUsed?.id).toBe('york-post-2004');

    const yearTens = result.segments.find((s) => s.field === 'Year (tens)');
    const monthSeg = result.segments.find((s) => s.field === 'Month');
    const yearUnits = result.segments.find((s) => s.field === 'Year (units)');

    expect(yearTens).toBeDefined();
    expect(yearTens!.startIndex).toBe(1);
    expect(yearTens!.endIndex).toBe(2);
    expect(yearTens!.value).toBe('1');

    expect(monthSeg).toBeDefined();
    expect(monthSeg!.startIndex).toBe(2);
    expect(monthSeg!.endIndex).toBe(3);
    expect(monthSeg!.value).toBe('C');
    expect(monthSeg!.description).toContain('3');

    expect(yearUnits).toBeDefined();
    expect(yearUnits!.startIndex).toBe(3);
    expect(yearUnits!.endIndex).toBe(4);
    expect(yearUnits!.value).toBe('5');
  });
});

// ---------------------------------------------------------------------------
// 11. York ambiguous — both cycles match, segments on candidates only
// ---------------------------------------------------------------------------

describe('Segments: York Ambiguous', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerYork(); });

  it('ambiguous top-level result has empty segments', () => {
    // WAKM011379 — K in both cycles: Cycle1=1980, Cycle2=2001
    const result = decode('york', 'WAKM011379', { referenceDate: REF });
    expect(result.status).toBe('ambiguous');
    expect(result.segments).toHaveLength(0);
  });

  it('each ambiguous candidate carries its own segments', () => {
    const result = decode('york', 'WAKM011379', { referenceDate: REF });
    expect(result.status).toBe('ambiguous');
    expect(result.candidates.length).toBeGreaterThan(1);
    for (const candidate of result.candidates) {
      expect(candidate.segments.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 12. Bryant — inherits carrier-wwyy-standard segments
// ---------------------------------------------------------------------------

describe('Segments: Bryant (Carrier-inherited)', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerBryant(); });

  it('produces same character-level segments as Carrier WWYY', () => {
    const result = decode('bryant', '2403T12345', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0].field).toBe('Week');
    expect(result.segments[0].value).toBe('24');
    expect(result.segments[1].field).toBe('Year');
    expect(result.segments[1].value).toBe('03');
    expect(result.segments[1].description).toContain('2003');
    expect(result.segments[2].field).toBe('Plant Code');
    expect(result.segments[2].value).toBe('T');
  });
});

// ---------------------------------------------------------------------------
// 13. Payne — inherits carrier-wwyy-standard segments
// ---------------------------------------------------------------------------

describe('Segments: Payne (Carrier-inherited)', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerPayne(); });

  it('produces same character-level segments as Carrier WWYY', () => {
    const result = decode('payne', '1219A12345', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0].field).toBe('Week');
    expect(result.segments[1].field).toBe('Year');
    expect(result.segments[1].description).toContain('2019');
    expect(result.segments[2].field).toBe('Plant Code');
  });
});

// ---------------------------------------------------------------------------
// 14. Amana — inherits goodman-standard-10 segments
// ---------------------------------------------------------------------------

describe('Segments: Amana (Goodman-inherited)', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerAmana(); });

  it('produces same character-level segments as Goodman YYMM', () => {
    const result = decode('amana', '2005123456', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].field).toBe('Year');
    expect(result.segments[0].description).toContain('2020');
    expect(result.segments[1].field).toBe('Month');
    expect(result.segments[1].value).toBe('05');
  });
});

// ---------------------------------------------------------------------------
// 15. Unsupported formats produce no segments
// ---------------------------------------------------------------------------

describe('Segments: Unsupported/Invalid results have no segments', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerCarrier(); registerTrane(); });

  it('carrier Style 4 (A167890) now decodes and populates segments', () => {
    const result = decode('carrier', 'A167890', { referenceDate: REF }); // 7-char Style 4
    // Style 4 is now implemented — returns success with Month and Year segments
    expect(result.status).toBe('success');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('invalid-input returns empty segments', () => {
    const result = decode('carrier', '', { referenceDate: REF });
    expect(result.status).toBe('invalid-input');
    expect(result.segments).toHaveLength(0);
  });

  it('trane legacy-unsupported returns empty segments', () => {
    const result = decode('trane', 'ABCDEF', { referenceDate: REF }); // 6 chars, unsupported
    expect(result.status).toBe('unsupported');
    expect(result.segments).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 16. Source metadata is preserved alongside segments
// ---------------------------------------------------------------------------

describe('Source metadata is preserved when segments are present', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerCarrier(); });

  it('carrier success has both sources and segments populated', () => {
    const result = decode('carrier', '4006A17330', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.segments.length).toBeGreaterThan(0);
    // Sources must not be contaminated by the segments field
    for (const source of result.sources) {
      expect(source).not.toHaveProperty('segments');
    }
  });
});

// ---------------------------------------------------------------------------
// 17. Original and normalized input are preserved alongside segments
// ---------------------------------------------------------------------------

describe('Input is preserved alongside segments', () => {
  beforeEach(() => { _resetRegistryForTesting(); registerCarrier(); });

  it('original serial (with whitespace/case) and normalized serial are both preserved', () => {
    const result = decode('carrier', '  4006a17330  ', { referenceDate: REF });
    expect(result.status).toBe('success');
    expect(result.input.original).toBe('  4006a17330  ');
    expect(result.input.normalized).toBe('4006A17330');
    expect(result.segments.length).toBeGreaterThan(0);
  });
});
