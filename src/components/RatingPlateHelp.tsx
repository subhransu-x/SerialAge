import { useEffect } from 'react';

interface RatingPlateHelpProps {
  manufacturerId?: string;
  open: boolean;
  onClose: () => void;
}

export function RatingPlateHelp({ manufacturerId, open, onClose }: RatingPlateHelpProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // Default/Generic guidance
  let outdoorLocation = 'Side or back of the cabinet, near the refrigerant line connections.';
  let indoorLocation = 'Inside the front access panel door, often on the upper portion of the cabinet.';
  let packagedLocation = 'Usually on the exterior panel near the compressor compartment or electrical connections.';

  // Manufacturer-specific overrides
  if (manufacturerId) {
    const id = manufacturerId.toLowerCase();
    if (['carrier', 'bryant', 'payne', 'york'].includes(id)) {
      outdoorLocation = 'Side or back of the cabinet above the refrigerant valves.';
      indoorLocation = 'Inside the front access panel.';
    } else if (['goodman', 'amana', 'daikin'].includes(id)) {
      outdoorLocation = 'Side of the unit near where the refrigerant lines connect.';
      indoorLocation = 'Inside wall of the blower compartment or front access panel.';
    } else if (id === 'lennox') {
      outdoorLocation = 'Right side of the unit near the refrigerant line connections.';
      indoorLocation = 'Interior cabinet wall, accessible by removing the top front panel.';
    } else if (['trane', 'american standard'].includes(id)) {
      outdoorLocation = 'Side of the cabinet near the refrigerant connections.';
      indoorLocation = 'Inside the front access panel.';
    } else if (['rheem', 'ruud'].includes(id)) {
      outdoorLocation = 'Side of the outdoor cabinet.';
      indoorLocation = 'Inside the front access panel.';
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button 
          className="modal-close" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ✕
        </button>
        
        <h3 id="help-modal-title" style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
          How to find your serial number
        </h3>
        
        <img 
          src="/data-plate-helper.jpg" 
          alt="HVAC Data Plate showing Serial Number" 
          style={{ width: '100%', borderRadius: 'var(--r-md)', border: '1px solid var(--hairline-strong)', marginBottom: '16px' }} 
        />
        
        <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--charcoal)' }}>
          <p style={{ margin: '0 0 12px 0' }}>
            The serial number is printed on the <strong>data plate</strong> (also called
            the rating plate) — usually a metal or foil sticker.
          </p>
          <p style={{ margin: '0 0 16px 0', fontWeight: 600, color: 'var(--accent-orange)' }}>
            Use the SERIAL NUMBER, not the MODEL NUMBER.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--ink)' }}>Outdoor AC &amp; Heat Pump</strong>
              <span>{outdoorLocation}</span>
            </div>

            <div>
              <strong style={{ display: 'block', color: 'var(--ink)' }}>Indoor Furnace &amp; Air Handler</strong>
              <span>{indoorLocation}</span>
            </div>

            <div>
              <strong style={{ display: 'block', color: 'var(--ink)' }}>Packaged Unit</strong>
              <span>{packagedLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
