import type { ManufacturerDefinition } from '../types';

/**
 * In-memory registry of all known manufacturers.
 *
 * Manufacturers register themselves via side-effect imports:
 * each manufacturer's index.ts calls registerManufacturer() at module load.
 */
const registry = new Map<string, ManufacturerDefinition>();

/**
 * Register a manufacturer's decoding rules.
 *
 * Called once per manufacturer at module load time.
 * Throws if a duplicate ID is registered (catches copy-paste errors).
 *
 * @param definition - The manufacturer definition to register
 * @throws Error if a manufacturer with the same ID is already registered
 */
export function registerManufacturer(definition: ManufacturerDefinition): void {
  if (registry.has(definition.id)) {
    throw new Error(
      `Duplicate manufacturer registration: "${definition.id}" is already registered. ` +
      `Each manufacturer must have a unique ID.`
    );
  }

  if (definition.formats.length === 0) {
    throw new Error(
      `Manufacturer "${definition.id}" has no format rules. ` +
      `Each manufacturer must have at least one FormatRule.`
    );
  }

  // Validate format ID uniqueness within this manufacturer
  const formatIds = new Set<string>();
  for (const format of definition.formats) {
    if (formatIds.has(format.id)) {
      throw new Error(
        `Duplicate format ID "${format.id}" in manufacturer "${definition.id}". ` +
        `Each format rule must have a unique ID within its manufacturer.`
      );
    }
    formatIds.add(format.id);
  }

  registry.set(definition.id, definition);
}

/**
 * Look up a manufacturer by its canonical ID.
 *
 * @param id - Manufacturer ID (lowercase, kebab-case)
 * @returns The manufacturer definition, or undefined if not found
 */
export function getManufacturer(id: string): ManufacturerDefinition | undefined {
  return registry.get(id);
}

/**
 * Get all registered manufacturers.
 * Useful for populating brand selection dropdowns in the UI.
 *
 * @returns Array of all registered manufacturer definitions
 */
export function getAllManufacturers(): ManufacturerDefinition[] {
  return Array.from(registry.values());
}

/**
 * Check if a manufacturer ID is registered.
 *
 * @param id - Manufacturer ID to check
 */
export function hasManufacturer(id: string): boolean {
  return registry.has(id);
}

/**
 * Clear all registrations.
 * ONLY for use in tests — allows a clean slate between test runs.
 *
 * @internal
 */
export function _resetRegistryForTesting(): void {
  registry.clear();
}
