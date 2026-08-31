/**
 * Warning state definitions for the enhanced warranty eligibility checker.
 * This is currently purely structural and dormant.
 */

export type EnhancedWarrantyStateId =
  | 'NO_MATCH'
  | 'INSUFFICIENT_INFORMATION'
  | 'MATCHED_PROGRAM_RANGE';

export type WarningSeverity = 'none' | 'info' | 'warning' | 'alert';

export interface SourceLink {
  readonly label: string;
  readonly url: string;
}

export interface EnhancedWarrantyWarning {
  /** Unique identifier for the eligibility state */
  readonly id: EnhancedWarrantyStateId;

  /** Visual severity level for the UI */
  readonly severity: WarningSeverity;

  /** Short headline for the warning box */
  readonly title: string;

  /** Primary user-facing explanatory text */
  readonly body: string;

  /** Mandatory disclaimer to prevent legal/diagnostic liability */
  readonly verificationDisclaimer?: string;

  /** Optional links to official bulletins or methodology */
  readonly sourceLinks?: readonly SourceLink[];

  /** Internal developer notes for future eligibility logic implementation */
  readonly notes: string;
}

const MANDATORY_DISCLAIMER =
  "SerialAge cannot confirm warranty eligibility or diagnose your equipment. Verify the exact coverage with Payne/Carrier or an authorized HVAC professional.";

export const enhancedWarrantyWarnings: Record<EnhancedWarrantyStateId, EnhancedWarrantyWarning> = {
  NO_MATCH: {
    id: 'NO_MATCH',
    severity: 'none',
    title: 'No Enhanced Warranty Match',
    body: 'No known enhanced warranty match was found for this model and serial combination.',
    notes: 'Used when the serial or model explicitly falls outside published boundaries.'
  },
  INSUFFICIENT_INFORMATION: {
    id: 'INSUFFICIENT_INFORMATION',
    severity: 'info',
    title: 'Model Number Required',
    body: 'Your serial number falls within a relevant production range, but the exact model number is needed to determine whether the published program applies.',
    notes: 'Used when the user only provided a serial number that falls within the 1993-2011 boundary, but we need the model to confirm eligibility.'
  },
  MATCHED_PROGRAM_RANGE: {
    id: 'MATCHED_PROGRAM_RANGE',
    severity: 'warning',
    title: 'Enhanced Warranty Program Match',
    body: 'Your model and serial number match a published range associated with Payne/Carrier\'s enhanced secondary heat-exchanger warranty program.',
    verificationDisclaimer: MANDATORY_DISCLAIMER,
    sourceLinks: [
      {
        label: 'Methodology & Sources',
        url: '/methodology'
      }
    ],
    notes: 'Used when BOTH the model family and serial boundaries perfectly match a verified record in the database.'
  }
};
