/**
 * Footer component — SerialAge
 */

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

import { OG_SITE_NAME } from '../seo/config';
import { BrandIcon } from './BrandIcon';

export function Footer() {

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer-inner">


        {/* ── Brand identity ── */}
        <div className="footer-brand-row">
          <div className="footer-logo">
            <div className="footer-logo-mark" aria-hidden="true">
              <BrandIcon />
            </div>
            <span className="footer-logo-text">{OG_SITE_NAME}</span>
          </div>
          <p className="footer-tagline">
            Free HVAC serial number lookup for homeowners, technicians, and inspectors.
          </p>
        </div>

        {/* ── Lower nav columns ── */}
        <div className="footer-cols">
          <nav aria-label="Resources navigation">
            <div className="footer-col-head">Resources</div>
            <ul className="footer-links">
              <li><a href="/methodology">Methodology</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal navigation">
            <div className="footer-col-head">Legal</div>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </nav>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <div className="footer-copy">© {new Date().getFullYear()} {OG_SITE_NAME}. All rights reserved.</div>
          <div className="footer-disclaimer">
            Results are based on documented manufacturer formats. Always verify against the equipment rating plate when precision matters.
          </div>
        </div>

      </div>
    </footer>
  );
}
