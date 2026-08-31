import type { SourceReference, SourceConfidence } from '../decoder/types/source';

/**
 * Clean, isolated data structure for the enhanced warranty eligibility rules.
 * This is currently used strictly for Payne models and should not be displayed
 * directly to users or alter decoder logic.
 */
export interface EnhancedWarrantyModelRecord {
  /** The specific brand this record applies to */
  readonly brand: 'Payne';
  
  /** The primary model family name (e.g., 'PG9M') */
  readonly modelFamily: string;
  
  /** Documented sub-prefixes/variants if explicitly named */
  readonly modelPrefixes: readonly string[];
  
  /** The exact 10-character serial start boundary */
  readonly serialStart: string;
  
  /** The exact 10-character serial end boundary */
  readonly serialEnd: string;
  
  /** Documented production period independent of the serial string */
  readonly manufacturePeriod: {
    readonly start: string;
    readonly end: string;
  };
  
  /** References to service bulletins or documentation */
  readonly sources: readonly SourceReference[];
  
  /** Verification status of this specific record */
  readonly status: SourceConfidence;
  
  /** Additional caveats or exclusions for this record */
  readonly notes?: string;
}

const verifiedSources: readonly SourceReference[] = [
  {
    name: "DSB 09-0022 / SMB 19-0022",
    url: null,
    dateReviewed: "2026-08-31",
    notes: "Secondary heat exchanger enhanced warranty bulletin.",
    confidence: "verified"
  }
];

export const payneEnhancedWarrantyRecords: readonly EnhancedWarrantyModelRecord[] = [
  {
    brand: 'Payne',
    modelFamily: '490A',
    modelPrefixes: [],
    serialStart: '2993A00001',
    serialEnd: '5211A99999',
    manufacturePeriod: {
      start: '1993',
      end: '2011'
    },
    sources: verifiedSources,
    status: 'verified'
  },
  {
    brand: 'Payne',
    modelFamily: 'PG9M',
    modelPrefixes: [],
    serialStart: '2993A00001',
    serialEnd: '5211A99999',
    manufacturePeriod: {
      start: '1993',
      end: '2011'
    },
    sources: verifiedSources,
    status: 'verified'
  },
  {
    brand: 'Payne',
    modelFamily: 'PG9U',
    modelPrefixes: [],
    serialStart: '2993A00001',
    serialEnd: '5211A99999',
    manufacturePeriod: {
      start: '1993',
      end: '2011'
    },
    sources: verifiedSources,
    status: 'verified'
  }
];
