import type { DecodeResult } from '../decoder';

interface Props {
  result: DecodeResult & { status: Exclude<DecodeResult['status'], 'success'> };
  rawInput: string;
  onDecodeAnother: () => void;
}

interface StateConfig {
  title: string;
  body: (result: DecodeResult, rawInput: string) => string;
  tip: string | null;
}

const STATE_CONFIG: Record<Exclude<DecodeResult['status'], 'success'>, StateConfig> = {
  'invalid-input': {
    title: 'Serial number not recognised',
    body: (_r, _i) => 'This serial number is too short or contains invalid characters.',
    tip: 'Check that the serial number is copied exactly from the data plate. Serial numbers are usually 8–13 characters long.',
  },
  'unsupported': {
    title: 'Could not decode this serial number',
    body: (r, _i) => r.explanation,
    tip: 'Check that the serial number is copied exactly from the equipment label. You can also look for a printed manufacture date directly on the rating plate.',
  },
  'ambiguous': {
    title: 'Multiple possible results',
    body: (_r, _i) => 'This serial number matches more than one historical format. We cannot determine a single accurate date.',
    tip: 'Use the manufacturer/model information, printed manufacture date, rating-plate context, or other documented clues relevant to that format to help narrow down the correct decade.',
  },
  'insufficient-info': {
    title: 'More information needed',
    body: (r, _i) => r.explanation || 'More information is needed to decode this serial number.',
    tip: 'Check the model number or equipment type on the data plate, which may help identify the correct format.',
  },
};

export function ErrorView({ result, rawInput, onDecodeAnother }: Props) {
  const config = STATE_CONFIG[result.status];
  const bodyText = config.body(result, rawInput);
  const matchedMfr = result.manufacturer.name;

  return (
    <div className="result-card result-error">
      <div className="rh rh-error">
        <div className="rh-left">
          <div className="rh-eyebrow rh-eyebrow-err">Cannot Decode</div>
          <div className="rh-date" style={{fontSize: '22px'}}>Unknown manufacture date</div>
        </div>
      </div>
      <div className="re-body">
        <div className="re-body-title">{config.title}</div>
        <p className="re-body-text" style={{ marginBottom: '8px' }}>
          The serial number <code style={{fontFamily: 'var(--font-mono)', background: 'var(--surface-soft)', padding: '2px 6px', borderRadius: '4px'}}>{rawInput}</code> {result.status === 'invalid-input' ? 'is invalid.' : `doesn't match the documented format we support for ${matchedMfr}.`}
        </p>
        <p className="re-body-text">{bodyText}</p>
        
        {config.tip && (
          <ul className="re-body-list">
            <li>{config.tip}</li>
            <li>The unit might have been manufactured before the era this format covers.</li>
            <li>Your unit uses an alternate era format not yet included.</li>
          </ul>
        )}

        {/* Ambiguous candidates — show what we found */}
        {result.status === 'ambiguous' && result.candidates.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p className="re-title" style={{ marginBottom: '8px' }}>Possible dates</p>
            <ul className="re-body-list" style={{ marginTop: 0 }}>
              {result.candidates.map((c, i) => (
                <li key={i}>
                  <strong>{c.manufactureDate.display}</strong>{c.approximateAge ? ` (${c.approximateAge.display} old)` : ''} via {c.formatUsed.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources — only show when present (e.g. explicit unsupported) */}
        {result.sources.length > 0 && result.status === 'unsupported' && (
          <div style={{ marginTop: '16px' }}>
            <p className="re-title" style={{ marginBottom: '8px' }}>References</p>
            <ul className="re-body-list" style={{ marginTop: 0 }}>
              {result.sources.map((src, i) => (
                <li key={i}>
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-green-dark)' }}>
                      {src.name}
                    </a>
                  ) : (
                    src.name
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="re-note" style={{ marginTop: '24px', marginBottom: '16px' }}>We'd rather tell you we don't know than give you an incorrect date. (Status: {result.status})</p>
        
        <button
          type="button"
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--r-md)', border: 'none',
            background: 'var(--brand-green)', color: 'var(--on-primary)',
            fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer', fontSize: '14px'
          }}
          onClick={onDecodeAnother}
        >
          Try a Different Serial
        </button>
      </div>
    </div>
  );
}
