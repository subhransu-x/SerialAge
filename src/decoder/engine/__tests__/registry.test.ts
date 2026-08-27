import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerManufacturer,
  getManufacturer,
  getAllManufacturers,
  hasManufacturer,
  _resetRegistryForTesting,
} from '../../engine/registry';
import type { ManufacturerDefinition, FormatRule, NormalizedInput } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a minimal valid FormatRule for testing registration logic */
function makeStubFormat(id: string): FormatRule {
  return {
    id,
    name: `Stub Format ${id}`,
    description: 'A stub format for testing',
    yearRange: [2000, null],
    productTypes: [],
    sources: [],
    matches: (_input: NormalizedInput) => false,
    decode: (_input: NormalizedInput) => null,
  };
}

/** Create a minimal valid ManufacturerDefinition */
function makeStubManufacturer(
  id: string,
  name: string,
  formatIds: string[] = ['default-format'],
): ManufacturerDefinition {
  return {
    id,
    name,
    formats: formatIds.map((fid) => makeStubFormat(fid)),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Manufacturer Registry', () => {
  beforeEach(() => {
    _resetRegistryForTesting();
  });

  describe('registerManufacturer', () => {
    it('registers a valid manufacturer', () => {
      const def = makeStubManufacturer('carrier', 'Carrier');
      registerManufacturer(def);
      expect(hasManufacturer('carrier')).toBe(true);
    });

    it('throws on duplicate manufacturer ID', () => {
      const def1 = makeStubManufacturer('carrier', 'Carrier');
      const def2 = makeStubManufacturer('carrier', 'Carrier Corp');
      registerManufacturer(def1);
      expect(() => registerManufacturer(def2)).toThrow('Duplicate manufacturer');
    });

    it('throws if manufacturer has no format rules', () => {
      const def: ManufacturerDefinition = {
        id: 'empty-brand',
        name: 'Empty Brand',
        formats: [],
      };
      expect(() => registerManufacturer(def)).toThrow('no format rules');
    });

    it('throws on duplicate format IDs within a manufacturer', () => {
      const def = makeStubManufacturer('carrier', 'Carrier', ['format-a', 'format-a']);
      expect(() => registerManufacturer(def)).toThrow('Duplicate format ID');
    });

    it('allows different manufacturers with the same format IDs', () => {
      const def1 = makeStubManufacturer('carrier', 'Carrier', ['post-2010']);
      const def2 = makeStubManufacturer('trane', 'Trane', ['post-2010']);
      registerManufacturer(def1);
      registerManufacturer(def2);
      expect(getAllManufacturers()).toHaveLength(2);
    });
  });

  describe('getManufacturer', () => {
    it('returns the definition for a registered manufacturer', () => {
      const def = makeStubManufacturer('rheem', 'Rheem');
      registerManufacturer(def);
      const result = getManufacturer('rheem');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Rheem');
    });

    it('returns undefined for an unregistered manufacturer', () => {
      expect(getManufacturer('nonexistent')).toBeUndefined();
    });
  });

  describe('getAllManufacturers', () => {
    it('returns an empty array when no manufacturers are registered', () => {
      expect(getAllManufacturers()).toEqual([]);
    });

    it('returns all registered manufacturers', () => {
      registerManufacturer(makeStubManufacturer('carrier', 'Carrier'));
      registerManufacturer(makeStubManufacturer('trane', 'Trane'));
      registerManufacturer(makeStubManufacturer('rheem', 'Rheem'));
      const all = getAllManufacturers();
      expect(all).toHaveLength(3);
      expect(all.map((m) => m.id)).toEqual(['carrier', 'trane', 'rheem']);
    });
  });

  describe('hasManufacturer', () => {
    it('returns false for unregistered ID', () => {
      expect(hasManufacturer('carrier')).toBe(false);
    });

    it('returns true after registration', () => {
      registerManufacturer(makeStubManufacturer('carrier', 'Carrier'));
      expect(hasManufacturer('carrier')).toBe(true);
    });
  });

  describe('_resetRegistryForTesting', () => {
    it('clears all registrations', () => {
      registerManufacturer(makeStubManufacturer('carrier', 'Carrier'));
      expect(getAllManufacturers()).toHaveLength(1);
      _resetRegistryForTesting();
      expect(getAllManufacturers()).toHaveLength(0);
    });
  });
});
