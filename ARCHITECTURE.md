# HVAC Serial Number Age Decoder — Architecture Guide

## Overview

A client-side decoder engine that takes an equipment brand and serial number, and returns the manufacture date, approximate age, and confidence level. The engine runs entirely in the browser — no backend, no external API.

The decoder is designed to **never guess**. It explicitly models ambiguity, insufficient information, and unsupported formats rather than producing incorrect results.

---

## How the Decoder Works

### Pipeline

```
User Input (brand + serial)
  │
  ├─ 1. Validate ───────── reject empty / too short / too long
  │
  ├─ 2. Normalize ──────── trim, uppercase, produce without-hyphens and without-spaces variants
  │
  ├─ 3. Registry Lookup ── find the ManufacturerDefinition by ID
  │
  ├─ 4. Match All ──────── run every FormatRule.matches() for that manufacturer
  │
  ├─ 5. Decode ─────────── run FormatRule.decode() on each match
  │
  ├─ 5b. Date Validate ─── reject impossible dates (month 13, Feb 30, year 1800)
  │
  ├─ 6. Disambiguate ───── 0 matches → unsupported
  │                        1 match  → success
  │                        N agree  → success (highest confidence)
  │                        N differ → ambiguous (all candidates)
  │
  ├─ 7. Age Calculate ──── currentDate - manufactureDate
  │
  └─ 8. Assemble ──────── build final DecodeResult
```

### Key properties

- **Pure function**: `decode(manufacturerId, serialNumber, options?) → DecodeResult`
- **No side effects**: All types are `readonly`. Pipeline produces a new result object.
- **Deterministic**: Age calculation accepts an injectable `referenceDate` for testing.
- **All formats are tried**: Never short-circuits after the first match. This is critical for detecting ambiguity.

### Five possible outcomes

| Status | Meaning |
|---|---|
| `success` | Exactly one format matched (or multiple agreed on the same date) |
| `ambiguous` | Multiple formats matched with different dates |
| `unsupported` | Manufacturer exists but no format matched the serial number |
| `invalid-input` | Input failed validation (empty, too short, etc.) |
| `insufficient-info` | Partial match but not enough data to produce a date |

---

## How to Add a Manufacturer

### Step 1: Create the manufacturer folder

```
src/decoder/manufacturers/<brand-name>/
├── index.ts       # Registration
├── formats.ts     # Format rules
└── __tests__/
    ├── fixtures.ts    # Verified test cases
    └── decode.test.ts # Tests
```

Use lowercase kebab-case for `<brand-name>` (e.g., `carrier`, `trane`, `rheem-ruud`).

### Step 2: Define format rules

Each manufacturer has one or more `FormatRule` objects covering different historical eras or product lines.

```typescript
// src/decoder/manufacturers/<brand>/formats.ts
import type { FormatRule } from '../../types';

export const formats: FormatRule[] = [
  {
    id: '<brand>-<era>',                    // unique within this manufacturer
    name: 'Human-Readable Format Name',
    description: 'When and where this format applies',
    yearRange: [2010, null],                // [start, end | null]
    productTypes: [],                       // empty = all types
    sources: [                              // at least one real source
      {
        name: 'Source Name',
        url: 'https://...',
        dateReviewed: '2025-01-15',
        notes: 'How you verified this',
        confidence: 'verified',
      },
    ],
    matches: (input) => {
      // Fast boolean pre-filter. Return true if the serial COULD match.
      return /^YOUR_PATTERN$/.test(input.normalized);
    },
    decode: (input) => {
      // Full decode logic. Return DecodedData or null if unable to decode.
      return {
        year: 2019,
        month: 3,
        week: null,
        day: null,
        productType: 'air-conditioner',
        explanation: 'How you extracted the date',
        warnings: [],
        metadata: {},
      };
    },
  },
];
```

### Step 3: Register the manufacturer

```typescript
// src/decoder/manufacturers/<brand>/index.ts
import { registerManufacturer } from '../../engine/registry';
import { formats } from './formats';

registerManufacturer({
  id: '<brand-name>',     // must match folder name
  name: 'Display Name',   // e.g., 'Carrier'
  formats,
});
```

### Step 4: Add the import

Add one line to `src/decoder/manufacturers/index.ts`:

```typescript
import './<brand-name>';
```

### Step 5: Nothing else changes

You do NOT need to modify:

- The pipeline (`engine/pipeline.ts`)
- The types (`types/*.ts`)
- The registry (`engine/registry.ts`)
- Any other manufacturer's folder
- Any UI code

---

## How to Add a Historical Format

A manufacturer may have used different serial number encoding schemes across different eras or product lines. Each scheme is a separate `FormatRule` in the manufacturer's `formats.ts`.

```
Carrier
├── carrier-post-2010    ← Format rule 1
├── carrier-2000-2009    ← Format rule 2
├── carrier-1990-1999    ← Format rule 3
└── carrier-pre-1990     ← Format rule 4
```

### Rules for format rules

1. **`matches()` must be fast** — Use a regex test, length check, or character check. This function runs for EVERY format when a serial is submitted.

2. **`decode()` must return null on failure** — If the serial matches the pattern but the extracted date is invalid, return `null`. The pipeline will silently skip this format.

3. **The pipeline validates dates** — Even if `decode()` returns a `DecodedData`, the pipeline rejects impossible dates (month 13, Feb 30, year before 1950). You don't need to handle this in your format rule.

4. **Use the right `NormalizedInput` variant** — Each format rule receives a `NormalizedInput` with four fields:
   - `original` — raw user input
   - `normalized` — trimmed + uppercased
   - `withoutHyphens` — normalized with hyphens removed
   - `withoutSpaces` — normalized with spaces removed

   Choose the variant appropriate for your pattern. If hyphens are meaningful separators, use `normalized`. If they're just noise, use `withoutHyphens`.

5. **Order formats from newest to oldest** — This is a convention, not enforced by the engine. It makes the `formats` array easier to read.

---

## How to Add Verified Test Cases

### Test case structure

```typescript
// src/decoder/manufacturers/<brand>/__tests__/fixtures.ts
import type { DecoderTestCase } from '../../../types';

export const testCases: DecoderTestCase[] = [
  {
    description: 'Post-2010 week-based serial',
    manufacturerId: '<brand>',
    serialNumber: 'REAL_SERIAL_HERE',       // from a real, documented source
    expectedStatus: 'success',
    expectedFormatId: '<brand>-<era>',
    expectedYear: 2019,
    expectedMonth: null,                    // null if format doesn't encode month
    expectedConfidence: 'high',
    expectedProductType: 'air-conditioner',
    source: {
      name: 'Where you got this serial',
      url: 'https://...',
      dateReviewed: '2025-01-15',
      notes: 'Additional context',
      confidence: 'verified',
    },
    notes: 'Why this test case matters',
  },
];
```

### Rules for test cases

- **Every serial number must come from a real, verifiable source** — published decoder charts, manufacturer documentation, or verified real-world units.
- **Do NOT fabricate serial numbers** that look plausible. If you can't verify it, don't add it.
- **Aim for 10–20 test cases per format rule**, covering:
  - Typical inputs
  - Boundary years (first/last year of the format)
  - Edge cases (shortest/longest serial, unusual characters)
  - Expected failures (serials that should NOT match this format)

### Running tests

```typescript
// src/decoder/manufacturers/<brand>/__tests__/decode.test.ts
import { describe, it, expect } from 'vitest';
import { decode } from '../../../engine/pipeline';
import '../index'; // trigger registration
import { testCases } from './fixtures';

describe('<Brand> decoder', () => {
  for (const tc of testCases) {
    it(tc.description, () => {
      const result = decode(tc.manufacturerId, tc.serialNumber);
      expect(result.status).toBe(tc.expectedStatus);
      if (tc.expectedYear !== null) {
        expect(result.manufactureDate?.year).toBe(tc.expectedYear);
      }
      // ... etc
    });
  }
});
```

---

## How Sources Are Attached

Every `FormatRule` has a `sources` array of `SourceReference` objects:

```typescript
interface SourceReference {
  name: string;           // "Building Intelligence Center"
  url: string | null;     // URL or null for offline sources
  dateReviewed: string;   // ISO 8601 date of last review
  notes: string;          // reliability/scope notes
  confidence: 'verified' | 'probable' | 'unverified';
}
```

Sources flow through the pipeline:

1. Each `FormatRule` carries its own `sources[]`
2. When a format matches and decodes successfully, its sources are included in the `DecodeResult.sources[]`
3. When a result is ambiguous, each `DecodeCandidate` carries its own `sources[]`
4. Test cases also have a `source` field documenting where the test serial came from

**Never invent sources.** If a format rule is based on community knowledge without a specific URL, set `url: null` and `confidence: 'unverified'`.

---

## How Ambiguity Is Handled

The decoder models three levels of certainty:

### 1. Success (unambiguous)

One format matched, or multiple formats agreed on the same date.

```
status: 'success'
confidence: 'high' | 'medium' | 'low'
manufactureDate: { ... }
candidates: []
```

### 2. Ambiguous (conflicting interpretations)

Multiple formats matched with DIFFERENT dates.

```
status: 'ambiguous'
manufactureDate: null          ← no single answer
candidates: [                  ← all possibilities
  { formatUsed, manufactureDate, confidence, ... },
  { formatUsed, manufactureDate, confidence, ... },
]
```

The UI should present all candidates and let the user choose, or prompt for additional information (model number, equipment type).

### 3. Unsupported (no match)

The manufacturer is registered but no format rule matched the serial number.

```
status: 'unsupported'
manufactureDate: null
explanation: 'No known serial number format...'
```

### Type guards

Use the provided type guards to narrow `DecodeResult` safely:

```typescript
import { decode, isSuccessResult, isAmbiguousResult } from './decoder';

const result = decode('carrier', 'ABC12345');

if (isSuccessResult(result)) {
  // TypeScript knows manufactureDate, approximateAge, confidence, formatUsed are non-null
  console.log(result.manufactureDate.year);
}

if (isAmbiguousResult(result)) {
  // Show all candidates to the user
  result.candidates.forEach(c => console.log(c.manufactureDate));
}
```

---

## Project Structure

```
src/
├── decoder/                        # Core decoder (React-free)
│   ├── index.ts                    # Public API barrel
│   ├── types/                      # All TypeScript types
│   │   ├── index.ts                # Re-exports
│   │   ├── source.ts               # SourceReference
│   │   ├── manufacturer.ts         # FormatRule, ManufacturerDefinition
│   │   ├── result.ts               # DecodeResult, DecodeCandidate
│   │   ├── test-case.ts            # DecoderTestCase
│   │   └── guards.ts              # Type guards (isSuccessResult, etc.)
│   ├── engine/                     # Pipeline orchestration
│   │   ├── index.ts
│   │   ├── pipeline.ts            # Main decode() function
│   │   ├── normalize.ts           # Input validation & normalization
│   │   ├── validate-date.ts       # Decoded date validation
│   │   └── registry.ts            # Manufacturer registry
│   └── manufacturers/             # One folder per manufacturer
│       ├── index.ts               # Auto-registration barrel
│       └── _template/             # Reference template
│           ├── README.md
│           ├── index.ts
│           └── formats.ts
└── utils/                          # Shared utilities
    ├── index.ts
    └── date.ts                    # Date display & age calculation
```

---

## Dependency Flow

```
decoder/index.ts
  └── manufacturers/index.ts   (side-effect registrations)
  └── engine/pipeline.ts
        ├── engine/registry.ts
        ├── engine/normalize.ts
        ├── engine/validate-date.ts
        └── utils/date.ts
  └── types/*                  (pure type definitions)
```

- **No circular dependencies** — types flow downward, engine consumes types, manufacturers consume engine.
- **No React imports** — the decoder can be used from React, Node.js, tests, or any JavaScript runtime.
- **No external dependencies** — zero runtime dependencies beyond TypeScript itself.
