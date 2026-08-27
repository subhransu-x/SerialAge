/**
 * ConfidenceBadge
 *
 * Renders a precision-utility badge for High / Medium / Low decoder confidence.
 * Uses color + label (never color alone) to communicate trust level.
 *
 * Wording per ux_visual_design_specification.md:
 *   High   → "Verified Format"
 *   Medium → "Estimated Format"
 *   Low    → "Uncertain"
 */

import type { Confidence } from '../decoder';

interface Props {
  confidence: Confidence;
}

const LABELS: Record<Confidence, string> = {
  high:   'Verified Format',
  medium: 'Estimated Format',
  low:    'Uncertain',
};

const MODIFIER: Record<Confidence, string> = {
  high:   'badge--high',
  medium: 'badge--medium',
  low:    'badge--low',
};

export function ConfidenceBadge({ confidence }: Props) {
  return (
    <span className={`badge ${MODIFIER[confidence]}`} aria-label={`Confidence: ${LABELS[confidence]}`}>
      {confidence === 'high' && (
        <svg className="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {confidence === 'medium' && (
        <svg className="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )}
      {confidence === 'low' && (
        <svg className="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}
      {LABELS[confidence]}
    </span>
  );
}
