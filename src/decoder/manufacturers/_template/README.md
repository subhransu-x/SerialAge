# Adding a New Manufacturer

Follow these steps to add decoding support for a new HVAC/water heater manufacturer.

## Prerequisites

- Real source documentation (decoder charts, manufacturer tech docs)
- At least one verified serial number with a known manufacture date
- At least one `FormatRule` with proper `SourceReference` metadata

## Step-by-Step

### 1. Create the manufacturer folder

Copy this template directory:

```
cp -r src/decoder/manufacturers/_template src/decoder/manufacturers/<brand-name>
```

Use lowercase kebab-case for the folder name (e.g., `carrier`, `trane`, `rheem-ruud`).

### 2. Define format rules in `formats.ts`

Edit `src/decoder/manufacturers/<brand-name>/formats.ts`:

```typescript
import type { FormatRule } from '../../types';

export const formats: FormatRule[] = [
  {
    id: '<brand>-<era-name>',        // e.g., 'carrier-post-2010'
    name: 'Human Readable Name',
    description: 'When/where this format applies',
    yearRange: [2010, null],         // [startYear, endYear | null]
    productTypes: [],                // empty = all product types
    sources: [
      {
        name: 'Source Name',
        url: 'https://...',
        dateReviewed: '2025-01-15',
        notes: 'How you verified this',
        confidence: 'verified',
      },
    ],
    matches: (input) => {
      // Fast pre-filter: return true if the serial COULD match this format
      return /^YOUR_PATTERN$/.test(input.normalized);
    },
    decode: (input) => {
      // Full decode logic. Return DecodedData or null.
      // Extract year, month, etc. from the serial number.
      return null; // replace with real logic
    },
  },
];
```

### 3. Register the manufacturer in `index.ts`

Edit `src/decoder/manufacturers/<brand-name>/index.ts`:

```typescript
import { registerManufacturer } from '../../engine/registry';
import type { ManufacturerDefinition } from '../../types';
import { formats } from './formats';

const definition: ManufacturerDefinition = {
  id: '<brand-name>',     // must match folder name
  name: 'Display Name',   // e.g., 'Carrier'
  formats,
};

registerManufacturer(definition);
```

### 4. Add the import to the manufacturers barrel

Add one line to `src/decoder/manufacturers/index.ts`:

```typescript
import './<brand-name>';
```

### 5. Add test fixtures

Create `src/decoder/manufacturers/<brand-name>/__tests__/fixtures.ts`:

```typescript
import type { DecoderTestCase } from '../../../types';

export const testCases: DecoderTestCase[] = [
  {
    description: 'Describe what this test verifies',
    manufacturerId: '<brand-name>',
    serialNumber: 'REAL_SERIAL_HERE',
    expectedStatus: 'success',
    expectedFormatId: '<brand>-<era-name>',
    expectedYear: 2019,
    expectedMonth: 3,
    expectedConfidence: 'high',
    expectedProductType: 'air-conditioner',
    source: {
      name: 'Where you got this serial number',
      url: 'https://...',
      dateReviewed: '2025-01-15',
      notes: 'Notes',
      confidence: 'verified',
    },
    notes: 'Additional context',
  },
  // Add 10-20 verified test cases per format
];
```

### 6. Write the test runner

Create `src/decoder/manufacturers/<brand-name>/__tests__/decode.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { decode } from '../../../engine/pipeline';
import '../index'; // trigger registration
import { testCases } from './fixtures';

describe('<Brand Name> decoder', () => {
  for (const tc of testCases) {
    it(tc.description, () => {
      const result = decode(tc.manufacturerId, tc.serialNumber);
      expect(result.status).toBe(tc.expectedStatus);

      if (tc.expectedYear !== null) {
        expect(result.manufactureDate?.year).toBe(tc.expectedYear);
      }
      if (tc.expectedMonth !== null) {
        expect(result.manufactureDate?.month).toBe(tc.expectedMonth);
      }
      if (tc.expectedFormatId !== null) {
        expect(result.formatUsed?.id).toBe(tc.expectedFormatId);
      }
      if (tc.expectedConfidence !== null) {
        expect(result.confidence).toBe(tc.expectedConfidence);
      }
      if (tc.expectedProductType !== null) {
        expect(result.productType).toBe(tc.expectedProductType);
      }
    });
  }
});
```

## What you do NOT need to modify

- ❌ `src/decoder/engine/pipeline.ts`
- ❌ `src/decoder/engine/registry.ts`
- ❌ `src/decoder/types/*`
- ❌ Any other manufacturer's folder
- ❌ Any UI code

## Checklist

- [ ] All serial numbers in test fixtures are from real, verifiable sources
- [ ] Every `FormatRule` has at least one `SourceReference` with a real URL
- [ ] `matches()` is a fast pre-filter (no heavy computation)
- [ ] `decode()` returns `null` for edge cases it can't handle
- [ ] Format IDs are unique and follow `<brand>-<era>` naming
- [ ] At least 5 test cases per format rule
