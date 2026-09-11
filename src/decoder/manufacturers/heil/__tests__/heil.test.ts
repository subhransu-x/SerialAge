import { describe, it, expect, beforeAll } from 'vitest';
import { decode } from '../../../engine';
import { _resetRegistryForTesting, registerManufacturer } from '../../../engine/registry';
import { formats } from '../formats';
import { fixtures } from './fixtures';

describe('Heil/ICP Decoder', () => {
  beforeAll(() => {
    _resetRegistryForTesting();
    registerManufacturer({
      id: 'heil',
      name: 'Heil',
      formats,
    });
  });

  for (const fixture of fixtures) {
    it(`decodes ${fixture.serialNumber} correctly (${fixture.description})`, () => {
      const result = decode('heil', fixture.serialNumber);

      expect(result.status).toBe(fixture.expectedStatus);

      if (fixture.expectedStatus === 'success') {
        expect(result.manufactureDate?.year).toBe(fixture.expectedYear);
        if (fixture.expectedWeek !== undefined) {
          expect(result.manufactureDate?.week).toBe(fixture.expectedWeek);
        }
        if (fixture.expectedMonth !== undefined) {
          expect(result.manufactureDate?.month).toBe(fixture.expectedMonth);
        }
        if (fixture.expectedProductType !== undefined && fixture.expectedProductType !== 'unknown') {
          // If we had product types to test, check them here
          expect(result.productType).toBe(fixture.expectedProductType);
        }
      }
    });
  }
});
