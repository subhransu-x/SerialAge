import { payneEnhancedWarrantyRecords } from '../../data/enhancedWarranty';
import { 
  enhancedWarrantyWarnings, 
  type EnhancedWarrantyWarning 
} from '../../data/enhancedWarrantyWarnings';
import { normalizeInput } from './normalize';

/**
 * Evaluates whether a given brand, serial, and optional model number 
 * match any verified enhanced warranty programs.
 * 
 * This logic operates independently from the main date decoding pipeline.
 */
export function evaluateEnhancedWarranty(
  brand: string,
  serial: string,
  modelNumber?: string
): EnhancedWarrantyWarning {
  // 1. Fetch relevant records (currently only Payne is supported)
  // If we don't have records for this brand, it automatically evaluates to NO_MATCH.
  const relevantRecords = brand.toLowerCase() === 'payne' ? payneEnhancedWarrantyRecords : [];
  
  if (relevantRecords.length === 0) {
    return enhancedWarrantyWarnings['NO_MATCH'];
  }

  // 2. Normalize serial number
  const normalizedSerial = normalizeInput(serial).normalized;

  if (normalizedSerial.length === 0) {
    return enhancedWarrantyWarnings['NO_MATCH'];
  }

  // 3. Find any records where the serial falls strictly within the published range
  // The Payne boundary uses 10-character formats, so we ensure lexicographical 
  // comparison only evaluates correctly sized serials if boundaries dictate it.
  const rangeMatchedRecords = relevantRecords.filter(record => {
    // For 2993A00001 -> 5211A99999, we expect 10 chars. 
    // A lexicographical compare on varying lengths can be dangerous,
    // so we enforce length consistency if the record requires it.
    if (normalizedSerial.length !== record.serialStart.length) {
      return false;
    }
    return normalizedSerial >= record.serialStart && normalizedSerial <= record.serialEnd;
  });

  // If no records match the serial range, we definitively know there is no match.
  if (rangeMatchedRecords.length === 0) {
    return enhancedWarrantyWarnings['NO_MATCH'];
  }

  // 4. Serial matches the range! Do we have a model number?
  const normalizedModel = (modelNumber || '').trim().toUpperCase().replace(/[-\s]/g, '');
  if (!normalizedModel) {
    return enhancedWarrantyWarnings['INSUFFICIENT_INFORMATION'];
  }

  // 5. Evaluate strict model matching against the range-matched records.
  // We only match if the normalized model specifically starts with the `modelFamily` 
  // or one of the explicitly verified `modelPrefixes`.
  const isExactModelMatch = rangeMatchedRecords.some(record => {
    // Check primary family
    if (normalizedModel.startsWith(record.modelFamily.toUpperCase())) {
      return true;
    }
    
    // Check explicit sub-prefixes if any
    for (const prefix of record.modelPrefixes) {
      if (normalizedModel.startsWith(prefix.toUpperCase())) {
        return true;
      }
    }
    
    return false;
  });

  // 6. Return final state
  if (isExactModelMatch) {
    return enhancedWarrantyWarnings['MATCHED_PROGRAM_RANGE'];
  }

  return enhancedWarrantyWarnings['NO_MATCH'];
}
