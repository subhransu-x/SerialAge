import { useState } from 'react';
import type { DecodeResult, DecodeSegment } from '../decoder';
import { trackEvent } from '../utils/analytics';

// ---------------------------------------------------------------------------
// Segment color palette — cycles for up to N segments
// ---------------------------------------------------------------------------

const SEGMENT_COLORS: readonly { bg: string; text: string; border: string }[] = [
  { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }, // blue
  { bg: '#dcfce7', text: '#166534', border: '#22c55e' }, // green
  { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }, // amber
  { bg: '#fce7f3', text: '#9d174d', border: '#ec4899' }, // pink
  { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' }, // purple
];

// ---------------------------------------------------------------------------
// SerialBreakdown — visualizes character segments in the normalized serial
// ---------------------------------------------------------------------------

interface BreakdownProps {
  normalized: string;
  segments: readonly DecodeSegment[];
}

function SerialBreakdown({ normalized, segments }: BreakdownProps) {
  // Build a map from character index → segment index (or -1 if unassigned)
  const indexMap = new Array<number>(normalized.length).fill(-1);
  segments.forEach((seg, si) => {
    for (let i = seg.startIndex; i < seg.endIndex && i < normalized.length; i++) {
      indexMap[i] = si;
    }
  });

  // Group consecutive characters that share the same segment index into spans
  interface Span { segIndex: number; chars: string }
  const spans: Span[] = [];
  let current: Span | null = null;
  for (let i = 0; i < normalized.length; i++) {
    const si = indexMap[i];
    if (!current || current.segIndex !== si) {
      if (current) spans.push(current);
      current = { segIndex: si, chars: normalized[i] };
    } else {
      current.chars += normalized[i];
    }
  }
  if (current) spans.push(current);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px',
        marginTop: '10px',
        fontFamily: 'monospace',
        fontSize: '20px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        lineHeight: '1',
      }}
      aria-label={`Serial number breakdown: ${normalized}`}
    >
      {spans.map((span, idx) => {
        const color = span.segIndex >= 0 ? SEGMENT_COLORS[span.segIndex % SEGMENT_COLORS.length] : null;
        const segment = span.segIndex >= 0 ? segments[span.segIndex] : null;
        
        const ariaLabel = segment 
          ? `Characters ${segment.startIndex + 1} to ${segment.endIndex}, ${segment.field} ${segment.value}: ${segment.description}` 
          : `Characters ${span.chars} unassigned`;

        return (
          <span
            key={idx}
            title={segment ? segment.description : undefined}
            role="text"
            aria-label={ariaLabel}
            style={{
              display: 'inline-block',
              padding: '4px 6px',
              borderRadius: '5px',
              background: color ? color.bg : 'transparent',
              color: color ? color.text : 'var(--slate)',
              borderBottom: color ? `3px solid ${color.border}` : '3px solid transparent',
              transition: 'opacity 0.15s',
            }}
          >
            <span aria-hidden="true">{span.chars}</span>
          </span>
        );
      })}
    </div>
  );
}


import type { EnhancedWarrantyWarning } from '../data/enhancedWarrantyWarnings';

interface Props {
  result: DecodeResult & { status: 'success' };
  warrantyResult?: EnhancedWarrantyWarning | null;
  onDecodeAnother: () => void;
}

function calcAge(year: number | null) {
  if (year === null) return 'unknown age';
  const diff = new Date().getFullYear() - year;
  if (diff <= 0) return 'manufactured this year';
  return diff === 1 ? '1 year old' : `${diff} years old`;
}

function getAgeCategoryText(years: number) {
  if (years < 5) return "0-5 years – Excellent condition.";
  if (years < 12) return "5-12 years – Mid-life. Ensure annual maintenance.";
  if (years < 15) return "12-15 years – Aging. Budget for replacement.";
  return "15+ years – Consider replacement.";
}

function buildCopyText(result: Props['result']): string {
  const confidenceLabel =
    result.confidence === 'high'
      ? 'Verified Format'
      : result.confidence === 'medium'
        ? 'Estimated Format'
        : 'Uncertain';

  const lines: string[] = [
    `${result.manufacturer.name} Equipment`,
    `Manufactured: ${result.manufactureDate!.display}`,
  ];

  if (result.approximateAge) {
    lines.push(`Approximate age: ${result.approximateAge.display}`);
  }

  lines.push(`Confidence: ${confidenceLabel}`);

  if (result.formatUsed) {
    lines.push(`Matched format: ${result.formatUsed.name}`);
  }

  if (result.warnings.length > 0) {
    lines.push(`Note: ${result.warnings[0]}`);
  }

  lines.push('');
  lines.push('Important: Manufacture date is not the installation date.');
  lines.push('Verified via SerialAge');

  return lines.join('\n');
}

function getManufacturerLinks(brandId: string) {
  switch (brandId) {
    case 'carrier':
      return [
        { label: 'Check Carrier Warranty Status', url: 'https://www.carrier.com/residential/en/us/homeowner-resources/warranty/' },
      ];
    case 'lennox':
      return [
        { label: 'Check Lennox Warranty Status', url: 'https://www.lennox.com/support/warranty' },
      ];
    case 'goodman':
      return [
        { label: 'Check Goodman Warranty Status', url: 'https://www.goodmanmfg.com/warranty-lookup' },
      ];
    default:
      return [];
  }
}

export function ResultView({ result, warrantyResult, onDecodeAnother }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText(result));
      setCopied(true);
      trackEvent('copy_result');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — fail silently
    }
  }


  return (
    <div className="result-card" role="region" aria-label="Decode result">
      <div className="rh">
        <div className="rh-left">
          <div className="rh-eyebrow">Manufacture Date</div>
          <div className="rh-date">{result.manufactureDate!.display}</div>
          {result.manufactureDate!.year !== null && (
            <div className="rh-age">Approximately {calcAge(result.manufactureDate!.year)}</div>
          )}
          {result.approximateAge && (
            <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 500, color: 'var(--slate)' }}>
              {getAgeCategoryText(result.approximateAge.years)}
            </div>
          )}
        </div>
      </div>

      {result.warnings && result.warnings.length > 0 && (
        <div className="re" style={{ borderTop: 'none', background: 'var(--brand-orange-light)', padding: '16px', borderLeft: '4px solid var(--brand-orange)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--brand-orange)', marginTop: '2px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>
                Important Warning
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7c2d12', lineHeight: '1.5' }}>
                {result.warnings.map((warning, i) => (
                  <li key={i} style={{ marginBottom: i < result.warnings.length - 1 ? '6px' : '0' }}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warrantyResult && warrantyResult.id === 'INSUFFICIENT_INFORMATION' && (
        <div className="re" style={{ borderTop: 'none', background: 'var(--surface)', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--brand-blue)', marginTop: '2px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {warrantyResult.title}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: '1.4' }}>
                {warrantyResult.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {warrantyResult && warrantyResult.id === 'MATCHED_PROGRAM_RANGE' && (
        <div className="re" style={{ borderTop: 'none', background: 'var(--brand-orange-light)', padding: '16px', borderLeft: '4px solid var(--brand-orange)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--brand-orange)', marginTop: '2px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>
                {warrantyResult.title}
              </div>
              <div style={{ fontSize: '14px', color: '#7c2d12', lineHeight: '1.5', marginBottom: '12px' }}>
                {warrantyResult.body}
              </div>
              
              {warrantyResult.verificationDisclaimer && (
                <div style={{ fontSize: '13px', color: '#7c2d12', lineHeight: '1.4', fontStyle: 'italic', marginBottom: '12px', opacity: 0.9 }}>
                  {warrantyResult.verificationDisclaimer}
                </div>
              )}
              
              <div>
                <a 
                  href="/payne-secondary-heat-exchanger-warranty" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#9a3412', 
                    textDecoration: 'underline' 
                  }}
                >
                  Read the Payne warranty guide
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {(result.segments.length > 0 || result.explanation) && (
        <div className="re" style={{ borderTop: 'none', background: 'var(--surface)' }}>
          <div className="re-title">How We Decoded This</div>

          {result.segments.length > 0 ? (
            <>
              {/* Character-level serial visualization */}
              <SerialBreakdown
                normalized={result.input.normalized}
                segments={result.segments}
              />
              {/* Field-by-field legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                {result.segments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: SEGMENT_COLORS[i % SEGMENT_COLORS.length].bg,
                        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length].text,
                        borderRadius: '4px',
                        padding: '1px 6px',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        fontFamily: 'monospace',
                        flexShrink: 0,
                        minWidth: '28px',
                        textAlign: 'center',
                      }}
                    >
                      {seg.value}
                    </span>
                    <span style={{ color: 'var(--slate)', lineHeight: '1.4' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{seg.field}:</strong>{' '}
                      {seg.description}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="re-text" style={{ fontSize: '14px', marginTop: '4px', lineHeight: '1.4' }}>
              {result.explanation}
            </p>
          )}
        </div>
      )}


      {/* LIMITATIONS block incorporated into the re-body style for now */}
      <div className="re" style={{ borderTop: 'none', background: 'var(--surface)' }}>
        <div className="re-title">Keep in mind</div>
        <ul className="re-body-list" style={{ marginTop: '4px' }}>
          <li>The manufacture date is when the unit left the factory — not when it was installed.</li>
          <li>Warranty coverage may depend on installation date, registration, owner status, and manufacturer terms.</li>
          {result.manufacturer.name && (
            <li>Always verify against the physical data plate on the {result.manufacturer.name} unit.</li>
          )}
        </ul>
      </div>

      {getManufacturerLinks(result.manufacturer.id).length > 0 && (
        <div className="re" style={{ borderTop: 'none', background: 'var(--surface)' }}>
          <div className="re-title">Official Resources</div>
          <ul className="re-body-list" style={{ marginTop: '4px' }}>
            {getManufacturerLinks(result.manufacturer.id).map((link, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-green-dark)', textDecoration: 'underline' }}>
                  {link.label}
                </a>
              </li>
            ))}
            <li key="repair-replace">
              <a href="https://www.energystar.gov/campaign/heating_cooling/replace" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-green-dark)', textDecoration: 'underline' }}>
                Repair vs. Replace Guide (Energy Star)
              </a>
            </li>
          </ul>
        </div>
      )}


      <div className="result-actions">
        <button
          type="button"
          className={`btn-secondary ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-live="polite"
        >
          {copied ? '✓ Copied' : 'Copy Details'}
        </button>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={onDecodeAnother}
        >
          Decode Another
        </button>
      </div>
    </div>
  );
}
