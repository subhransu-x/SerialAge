import React, { useState, useRef } from 'react';
import { decode, getAllManufacturers, isSuccessResult } from '../decoder';
import type { DecodeResult } from '../decoder';
import { ResultView } from './ResultView';
import { ErrorView } from './ErrorView';
import { RatingPlateHelp } from './RatingPlateHelp';
import { trackEvent } from '../utils/analytics';
import { evaluateEnhancedWarranty } from '../decoder/engine/warranty';

const REGISTERED_MANUFACTURERS = getAllManufacturers();

type ViewState =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'result'; result: DecodeResult; rawInput: string };

interface DecoderWidgetProps {
  defaultManufacturerId?: string;
}

export function DecoderWidget({ defaultManufacturerId }: DecoderWidgetProps = {}) {
  const [manufacturerId, setManufacturerId] = useState<string>(() => {
    if (defaultManufacturerId && REGISTERED_MANUFACTURERS.some((m) => m.id === defaultManufacturerId)) {
      return defaultManufacturerId;
    }
    return defaultManufacturerId ? (REGISTERED_MANUFACTURERS[0]?.id ?? '') : '';
  });

  const [serial, setSerial] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({ kind: 'idle' });
  const [warrantyResult, setWarrantyResult] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  function handleSerialChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSerial(e.target.value);
    if (validationMsg) setValidationMsg(null);
  }

  function handleSerialPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const cleaned = pasted.replace(/[\s\-_]/g, '');
    setSerial(cleaned);
    if (validationMsg) setValidationMsg(null);
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    setValidationMsg(null);

    if (!manufacturerId && !serial.trim()) {
      setValidationMsg('Please select a manufacturer and enter a serial number.');
      return;
    }
    if (!manufacturerId) {
      setValidationMsg('Please select a manufacturer first.');
      selectRef.current?.focus();
      return;
    }

    const trimmed = serial.trim();
    if (trimmed.length === 0) {
      setValidationMsg('Please enter a serial number.');
      inputRef.current?.focus();
      return;
    }

    trackEvent('decoder_started', { brand: manufacturerId });

    setView({ kind: 'scanning' });

    setTimeout(() => {
      const result = decode(manufacturerId, trimmed);

      if (result.status === 'success') {
        trackEvent('decode_success', { brand: manufacturerId });
      } else {
        trackEvent('decode_error', { brand: manufacturerId, error_type: result.status });
      }

      let warning = null;
      if (manufacturerId === 'payne') {
        const normalizedModel = modelNumber.trim().toUpperCase().replace(/[\s\-_]/g, '');
        warning = evaluateEnhancedWarranty(manufacturerId, trimmed, normalizedModel || undefined);
      }
      setWarrantyResult(warning);

      setView({ kind: 'result', result, rawInput: trimmed });

      setTimeout(() => {
        const panel = document.getElementById('result-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 40);
    }, 600);
  }

  function handleDecodeAnother() {
    setView({ kind: 'idle' });
    setSerial('');
    setModelNumber('');
    setWarrantyResult(null);
    setValidationMsg(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isResultView = view.kind === 'result';


  return (
    <div className="decoder-wrap" data-warranty={warrantyResult?.kind || 'none'}>
      <div className="decoder-card">
        <div className="dc-header">
          <span className="dc-label">Serial Number Decoder</span>
        </div>

        <form onSubmit={handleSubmit} className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sel-mfr">Manufacturer</label>
            <div className="select-wrap">
              <select
                ref={selectRef}
                className="form-select"
                id="sel-mfr"
                aria-label="Select manufacturer"
                value={manufacturerId}
                onChange={e => {
                  setManufacturerId(e.target.value);
                  if (validationMsg) setValidationMsg(null);
                }}
              >
                <option value="" disabled>Select brand…</option>
                {REGISTERED_MANUFACTURERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {manufacturerId === 'payne' && (
            <div className="form-group">
              <label className="form-label" htmlFor="inp-model">Model Number <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 'normal' }}>(Optional)</span></label>
              <input
                className="form-input"
                id="inp-model"
                type="text"
                placeholder="e.g. PG9MAA048080"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Enter model number"
                value={modelNumber}
                onChange={(e) => {
                  setModelNumber(e.target.value);
                  if (validationMsg) setValidationMsg(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={view.kind === 'scanning'}
              />
              <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--slate)' }}>
                Model number — usually shown on the same equipment data plate as the serial number.
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="inp-serial">Serial Number</label>
            <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <input
                ref={inputRef}
                className="form-input"
                id="inp-serial"
                type="text"
                placeholder="e.g. 2403T12345"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Enter serial number"
                value={serial}
                onChange={handleSerialChange}
                onPaste={handleSerialPaste}
                onKeyDown={handleKeyDown}
                disabled={view.kind === 'scanning'}
              />
              {view.kind === 'scanning' && <div className="laser-scanner"></div>}
            </div>
            <button 
              type="button" 
              className="btn-link" 
              onClick={() => setShowHelp(true)} 
              style={{ fontSize: '13px', marginTop: '8px', color: 'var(--slate)', textDecoration: 'underline' }}
            >
              Where is my serial number?
            </button>
          </div>
          {/* Hide button since form submission handles it, but keep it semantic */}
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
        </form>

        <button 
          className={`decode-btn ${view.kind === 'scanning' ? 'loading' : ''}`} 
          onClick={() => handleSubmit()} 
          aria-label="Decode serial number"
          disabled={view.kind === 'scanning'}
        >
          {view.kind === 'scanning' ? (
            <>
              <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"/>
              </svg>
              Decoding...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M6.5 9h5M9 6.5l2.5 2.5L9 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Decode Serial Number
            </>
          )}
        </button>
        {validationMsg && (
          <div style={{ marginTop: '16px', color: 'var(--accent-orange)', fontSize: '14px', textAlign: 'center', fontWeight: 500 }}>
            {validationMsg}
          </div>
        )}
      </div>

      <div 
        className={`result-panel ${isResultView ? 'visible' : ''}`} 
        id="result-panel" 
        role="region" 
        aria-live="polite" 
        aria-label="Decode result"
        key={isResultView ? `result-${(view as any).rawInput}` : 'static'}
      >
        {isResultView && (
          isSuccessResult(view.result) ? (
            <ResultView
              result={view.result}
              warrantyResult={warrantyResult}
              onDecodeAnother={handleDecodeAnother}
            />
          ) : (
            <ErrorView
              result={view.result as DecodeResult & { status: Exclude<DecodeResult['status'], 'success'> }}
              rawInput={view.rawInput}
              onDecodeAnother={handleDecodeAnother}
            />
          )
        )}
      </div>

      <RatingPlateHelp 
        manufacturerId={manufacturerId} 
        open={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </div>
  );
}
