import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { ResultView } from '../ResultView';
import { enhancedWarrantyWarnings } from '../../data/enhancedWarrantyWarnings';

describe('ResultView - Enhanced Warranty UI', () => {
  const dummyResult: any = {
    status: 'success',
    input: { normalized: '2993A00001', raw: '2993A00001' },
    manufacturer: { id: 'payne', name: 'Payne' },
    manufactureDate: { year: 1993, month: 7, week: 29, display: 'July 1993' },
    approximateAge: { years: 30, display: '30 years' },
    segments: [],
    warnings: [],
    confidence: 'high'
  };

  const dummyFn = () => {};

  it('renders MATCHED_PROGRAM_RANGE warning correctly', () => {
    const html = renderToString(
      <ResultView 
        result={dummyResult} 
        warrantyResult={enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE']} 
        onDecodeAnother={dummyFn} 
      />
    );
    
    expect(html).toContain('Enhanced Warranty Program Match');
    expect(html).toContain('Payne/Carrier&#x27;s enhanced secondary heat-exchanger warranty program');
    expect(html).toContain('SerialAge cannot confirm warranty eligibility');
    expect(html).toContain('/payne-secondary-heat-exchanger-warranty');
    expect(html).toContain('Read the Payne warranty guide');
    
    // Ensure no false claims are present in the output
    expect(html).not.toContain('defective');
    expect(html).not.toContain('carbon monoxide');
    expect(html).not.toContain('guaranteed');
  });

  it('renders INSUFFICIENT_INFORMATION warning correctly', () => {
    const html = renderToString(
      <ResultView 
        result={dummyResult} 
        warrantyResult={enhancedWarrantyWarnings['INSUFFICIENT_INFORMATION']} 
        onDecodeAnother={dummyFn} 
      />
    );
    
    expect(html).toContain('Model Number Required');
    expect(html).toContain('exact model number is needed');
    
    // Should NOT contain the heavy warning elements
    expect(html).not.toContain('Enhanced Warranty Program Match');
    expect(html).not.toContain('/payne-secondary-heat-exchanger-warranty');
  });

  it('renders nothing extra for NO_MATCH', () => {
    const html = renderToString(
      <ResultView 
        result={dummyResult} 
        warrantyResult={enhancedWarrantyWarnings['NO_MATCH']} 
        onDecodeAnother={dummyFn} 
      />
    );
    
    expect(html).not.toContain('Enhanced Warranty Program Match');
    expect(html).not.toContain('Model Number Required');
    expect(html).not.toContain('exact model number is needed');
  });

  it('does not crash if warrantyResult is completely undefined', () => {
    const html = renderToString(
      <ResultView 
        result={dummyResult} 
        onDecodeAnother={dummyFn} 
      />
    );
    expect(html).toContain('July 1993');
  });
});

describe('ResultView - Partial Decode (e.g. Amana)', () => {
  const partialResult: any = {
    status: 'success',
    input: { normalized: '2104123456', raw: '2104123456' },
    manufacturer: { id: 'amana', name: 'Amana' },
    manufactureDate: { year: null, month: 4, week: null, day: null, display: 'April — Year cannot be determined' },
    approximateAge: null,
    segments: [],
    warnings: ['The serial number alone does not establish the century.', 'Warning: Collision possible.'],
    confidence: 'high'
  };

  const dummyFn = () => {};

  it('renders warnings correctly and omits age when year is null', () => {
    const html = renderToString(
      <ResultView result={partialResult} onDecodeAnother={dummyFn} />
    );

    // Check for warnings rendering
    expect(html).toContain('Important Warning');
    expect(html).toContain('The serial number alone does not establish the century.');
    expect(html).toContain('Warning: Collision possible.');

    // Check that age display is omitted entirely
    expect(html).not.toContain('rh-age');
    expect(html).not.toContain('unknown age');
    expect(html).not.toContain('Approximately');
  });
});
