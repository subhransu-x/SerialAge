import { describe, it, expect } from 'vitest';
import { validateInput, normalizeInput } from '../../engine/normalize';

// ---------------------------------------------------------------------------
// validateInput
// ---------------------------------------------------------------------------

describe('validateInput', () => {
  it('rejects empty string', () => {
    expect(validateInput('')).toContain('empty');
  });

  it('rejects whitespace-only input', () => {
    expect(validateInput('   ')).toContain('empty');
  });

  it('rejects input shorter than 3 characters', () => {
    expect(validateInput('AB')).toContain('too short');
  });

  it('accepts input of exactly 3 characters', () => {
    expect(validateInput('ABC')).toBeNull();
  });

  it('accepts normal serial number', () => {
    expect(validateInput('3119E12345')).toBeNull();
  });

  it('rejects input longer than 50 characters', () => {
    const longInput = 'A'.repeat(51);
    expect(validateInput(longInput)).toContain('too long');
  });

  it('accepts input of exactly 50 characters', () => {
    const input = 'A'.repeat(50);
    expect(validateInput(input)).toBeNull();
  });

  it('accepts input with leading/trailing whitespace (trimmed internally)', () => {
    expect(validateInput('  ABC123  ')).toBeNull();
  });

  it('rejects input that is only whitespace even if long', () => {
    expect(validateInput('          ')).toContain('empty');
  });
});

// ---------------------------------------------------------------------------
// normalizeInput
// ---------------------------------------------------------------------------

describe('normalizeInput', () => {
  it('preserves original input exactly', () => {
    const result = normalizeInput('  abc-123  ');
    expect(result.original).toBe('  abc-123  ');
  });

  it('trims and uppercases for normalized', () => {
    const result = normalizeInput('  abc-123  ');
    expect(result.normalized).toBe('ABC-123');
  });

  it('removes hyphens from the uppercased, trimmed value', () => {
    const result = normalizeInput('  ab-cd-123  ');
    expect(result.withoutHyphens).toBe('ABCD123');
  });

  it('removes spaces from the uppercased, trimmed value', () => {
    const result = normalizeInput('  AB CD 123  ');
    expect(result.withoutSpaces).toBe('ABCD123');
  });

  it('handles input with no hyphens or spaces', () => {
    const result = normalizeInput('ABC123');
    expect(result.normalized).toBe('ABC123');
    expect(result.withoutHyphens).toBe('ABC123');
    expect(result.withoutSpaces).toBe('ABC123');
  });

  it('handles mixed hyphens and spaces', () => {
    const result = normalizeInput('AB-CD 12-34');
    expect(result.normalized).toBe('AB-CD 12-34');
    expect(result.withoutHyphens).toBe('ABCD 1234');
    expect(result.withoutSpaces).toBe('AB-CD12-34');
  });

  it('handles lowercase conversion', () => {
    const result = normalizeInput('abcDEF');
    expect(result.normalized).toBe('ABCDEF');
  });
});
