import { describe, it, expect } from 'vitest';
import { enhancedWarrantyWarnings } from '../enhancedWarrantyWarnings';

describe('Enhanced Warranty Warning States', () => {
  it('contains all required states with non-empty text', () => {
    const states = ['NO_MATCH', 'INSUFFICIENT_INFORMATION', 'MATCHED_PROGRAM_RANGE'] as const;
    
    for (const state of states) {
      const warning = enhancedWarrantyWarnings[state];
      expect(warning).toBeDefined();
      expect(warning.id).toBe(state);
      expect(warning.title.length).toBeGreaterThan(0);
      expect(warning.body.length).toBeGreaterThan(0);
      expect(warning.notes.length).toBeGreaterThan(0);
    }
  });

  it('ensures the matched state contains the mandatory verification disclaimer', () => {
    const matchedWarning = enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE'];
    expect(matchedWarning.verificationDisclaimer).toBe(
      "SerialAge cannot confirm warranty eligibility or diagnose your equipment. Verify the exact coverage with Payne/Carrier or an authorized HVAC professional."
    );
  });

  it('ensures no warning claims guaranteed coverage or confirmed defects', () => {
    const forbiddenWords = [
      'guarantee', 'guaranteed',
      'will cover', 'is covered',
      'defective', 'defect',
      'failed', 'failure',
      'broken', 'danger'
    ];

    const allText = Object.values(enhancedWarrantyWarnings).map(w => 
      `${w.title} ${w.body} ${w.verificationDisclaimer || ''}`.toLowerCase()
    );

    for (const text of allText) {
      for (const word of forbiddenWords) {
        expect(text).not.toContain(word);
      }
    }
  });
});
