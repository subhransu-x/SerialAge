import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DecoderWidget } from '../components/DecoderWidget';
import { ThemeToggle } from '../components/ThemeToggle';
import { getAllBrandPages } from '../data/brandPages';
import type { BrandPageConfig } from '../data/brandPages';
import { SEO } from '../seo/SEO';
import { canonicalUrl } from '../seo/config';
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
} from '../seo/schemas';

// ---------------------------------------------------------------------------
// Site header (Phase 7 Design)
// ---------------------------------------------------------------------------
function BrandPageHeader() {
  return (
    <>
      <div className="promo-banner" role="status">
        Free forever — no account, no data stored. <strong>Carrier, Goodman, Lennox &amp; Trane</strong> supported now.
      </div>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <Link className="nav-logo" to="/" aria-label="SerialAge home">
            <div className="nav-logo-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="nav-logo-text">Serial<span>Age</span></span>
          </Link>
          <div className="nav-right">
            <Link className="nav-link" to="/#manufacturers">Manufacturers</Link>
            <Link className="nav-link" to="/#how-it-works">How It Works</Link>
            <Link className="nav-link" to="/#faq">FAQ</Link>
            <a className="nav-cta" href="#decoder-section">Decode Now</a>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}

// ---------------------------------------------------------------------------
// Site Footer (Phase 7 Design)
// ---------------------------------------------------------------------------
function BrandPageFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-mark">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v12M1 7h12M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="footer-logo-text">SerialAge</span>
            </div>
            <p className="footer-tagline">Free serial number lookup for homeowners, technicians, and inspectors.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <div>
              <div className="footer-col-head">Manufacturers</div>
              <ul className="footer-links">
                <li><Link to="/carrier-serial-number-decoder">Carrier</Link></li>
                <li><Link to="/goodman-serial-number-decoder">Goodman</Link></li>
                <li><Link to="/lennox-serial-number-decoder">Lennox</Link></li>
                <li><Link to="/trane-serial-number-decoder">Trane</Link></li>
                <li><a href="#">More coming soon</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-head">Resources</div>
              <ul className="footer-links">
                <li><Link to="/#how-it-works">How It Works</Link></li>
                <li><Link to="/#faq">FAQ</Link></li>
                <li><a href="#">HVAC Age Guide</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 SerialAge. All rights reserved.</div>
          <div className="footer-disclaimer">Results are based on documented manufacturer formats. Always confirm with a licensed HVAC technician for warranty, insurance, or legal decisions.</div>
        </div>
      </div>
    </footer>
  );
}


// ---------------------------------------------------------------------------
// BrandPage component
// ---------------------------------------------------------------------------

interface BrandPageProps {
  config: BrandPageConfig;
}

export function BrandPage({ config }: BrandPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pageUrl = canonicalUrl(`/${config.slug}`);

  const structuredData = [
    buildWebApplicationSchema(pageUrl, config.headline, config.shortDescription),
    buildBreadcrumbSchema(config.displayName, config.slug),
    ...(config.faqs.length > 0 ? [buildFaqPageSchema(config.faqs)] : []),
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <SEO
        title={config.pageTitle}
        description={config.metaDescription}
        path={`/${config.slug}`}
        structuredData={structuredData}
      />
      <BrandPageHeader />

      <main id="main-content">
        
        {/* HERO + DECODER */}
        <section className="hero" id="decoder-section">
          <div className="hero-content">
            {/* Breadcrumb styled organically into hero */}
            <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--mute)' }}>
              <Link to="/" style={{ color: 'var(--mute)', textDecoration: 'none' }}>SerialAge</Link> 
              <span style={{ margin: '0 8px' }}>›</span> 
              <span style={{ color: 'var(--primary)' }} aria-current="page">{config.displayName}</span>
            </nav>

            <h1 className="hero-h1">{config.headline}</h1>
            <p className="hero-sub">{config.shortDescription}</p>
            {config.relatedBrands && config.relatedBrands.length > 0 && (
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--mute)' }}>
                Also covers:{' '}
                {config.relatedBrands.map((b, i) => (
                  <span key={b.slug}>
                    {i > 0 && ', '}
                    <Link to={`/${b.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      <strong>{b.name}</strong>
                    </Link>
                  </span>
                ))}
              </p>
            )}

            {/* DECODER WIDGET */}
            <DecoderWidget key={config.manufacturerId} defaultManufacturerId={config.manufacturerId} />
          </div>
        </section>

        {/* WHERE TO FIND */}
        <section className="section section-alt" aria-labelledby="where-to-find">
          <div className="section-inner">
            <div className="s-eye">Data Plate</div>
            <h2 className="s-head" id="where-to-find">Where to find the serial number</h2>
            <p className="s-sub">{config.ratingPlateLocation}</p>
          </div>
        </section>

        {/* AMBIGUITY WARNING */}
        {config.ambiguity && (
          <section className="section section-alt" aria-labelledby="ambiguity" style={{ paddingTop: 0 }}>
            <div className="section-inner">
              <div className="s-eye" style={{ color: '#7a5c00' }}>Known Ambiguity</div>
              <h2 className="s-head" id="ambiguity">Important Note</h2>
              <div className="alert-warning" style={{ maxWidth: '760px', margin: '24px auto 0', padding: '16px 24px', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                {config.ambiguity}
              </div>
            </div>
          </section>
        )}

        {/* FORMAT GUIDE */}
        {config.supportedFormats && config.supportedFormats.length > 0 && (
          <section className="section" aria-labelledby="format-guide">
            <div className="section-inner">
              <div className="s-eye">Format Guide</div>
              <h2 className="s-head" id="format-guide">Supported Formats</h2>
              
              <div style={{ display: 'grid', gap: '24px', maxWidth: '840px', margin: '32px auto 0', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {config.supportedFormats.map((fmt, i) => (
                  <div className="mfr-card" key={i} style={{ textAlign: 'left', padding: '24px', background: 'var(--surface-card)', borderRadius: 'var(--r-md)' }}>
                    <div className="mfr-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: 'var(--ink)' }}>
                      {fmt.label}
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '3px 8px', 
                        borderRadius: 'var(--r-full)', 
                        background: (fmt.exampleType === 'Verified' || fmt.exampleType === 'Documented') ? 'var(--success-pale)' : 'var(--hairline-soft)',
                        color: (fmt.exampleType === 'Verified' || fmt.exampleType === 'Documented') ? 'var(--success-deep)' : 'var(--mute)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {fmt.exampleType}
                      </span>
                    </div>
                    <div className="mfr-fmt-code" style={{ marginTop: '16px', fontSize: '24px', fontFamily: 'var(--font)', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--ink)' }}>{fmt.example}</div>
                    <p className="mfr-desc" style={{ marginTop: '12px', fontSize: '14px', color: 'var(--mute)', lineHeight: '1.6' }}>{fmt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LIMITATIONS */}
        {config.limitations.length > 0 && (
          <section className="section section-alt" aria-labelledby="limitations">
            <div className="section-inner">
              <div className="s-eye">Keep in mind</div>
              <h2 className="s-head" id="limitations">Limitations</h2>
              <ul className="re-body-list" style={{ maxWidth: '600px', margin: '24px auto 0', textAlign: 'left' }}>
                {config.limitations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* BRAND FAQ */}
        {config.faqs && config.faqs.length > 0 && (
          <section className="section" id="faq">
            <div className="section-inner" style={{ maxWidth: '840px' }}>
              <div className="s-eye">FAQ</div>
              <h2 className="s-head">Frequently Asked Questions</h2>
              <div className="faq-list" role="list">
                {config.faqs.map((faq, idx) => (
                  <div className="faq-item" role="listitem" key={idx}>
                    <button 
                      className={`faq-q ${openFaq === idx ? 'open' : ''}`} 
                      onClick={() => toggleFaq(idx)} 
                      aria-expanded={openFaq === idx}
                    >
                      {faq.question}
                      <svg className="faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className={`faq-a ${openFaq === idx ? 'open' : ''}`} role="region">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PROVENANCE (SOURCES & METHODOLOGY) */}
        {config.sources && config.sources.length > 0 && (
          <section className="section section-alt" aria-labelledby="provenance" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
            <div className="section-inner" style={{ maxWidth: '840px', textAlign: 'left' }}>
              
              {config.sources.some(s => s.type === 'external') && (
                <div style={{ marginBottom: config.sources.some(s => s.type === 'internal') ? '32px' : '0' }}>
                  <div className="s-eye">References</div>
                  <h2 className="s-head" id="external-sources" style={{ fontSize: '20px' }}>External Sources</h2>
                  <ul className="re-body-list" style={{ margin: '16px 0 0 20px', color: 'var(--mute)' }}>
                    {config.sources.filter(s => s.type === 'external').map((src, i) => (
                      <li key={`ext-${i}`} style={{ marginBottom: '12px' }}>
                        <div style={{ color: 'var(--ink)', fontWeight: 500 }}>
                          {src.url ? <a href={src.url} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{src.title}</a> : src.title}
                          {src.publisher && <span style={{ color: 'var(--mute)', fontWeight: 400 }}> &mdash; {src.publisher}</span>}
                        </div>
                        {src.description && <div style={{ fontSize: '14px', marginTop: '4px' }}>{src.description}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {config.sources.some(s => s.type === 'internal') && (
                <div>
                  <div className="s-eye">Provenance</div>
                  <h2 className="s-head" id="methodology" style={{ fontSize: '20px' }}>Our Methodology</h2>
                  <ul className="re-body-list" style={{ margin: '16px 0 0 20px', color: 'var(--mute)' }}>
                    {config.sources.filter(s => s.type === 'internal').map((src, i) => (
                      <li key={`int-${i}`} style={{ marginBottom: '12px' }}>
                        <div style={{ color: 'var(--ink)', fontWeight: 500 }}>{src.title}</div>
                        {src.description && <div style={{ fontSize: '14px', marginTop: '4px' }}>{src.description}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </section>
        )}

        {/* OTHER DECODERS */}
        <section className="section section-alt" aria-labelledby="other-decoders">
          <div className="section-inner">
            <div className="s-eye">Explore</div>
            <h2 className="s-head" id="other-decoders">Other Decoders</h2>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
              {getAllBrandPages()
                .filter((b) => b.slug !== config.slug)
                .map((b) => (
                  <Link 
                    key={b.slug} 
                    to={`/${b.slug}`}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--surface-card)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontFamily: 'var(--font)'
                    }}
                  >
                    {b.displayName} Decoder
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <BrandPageFooter />
    </>
  );
}
