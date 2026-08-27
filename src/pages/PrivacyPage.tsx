import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAllBrandPages } from '../data/brandPages';

export function PrivacyPage() {
  const brandPages = getAllBrandPages();
  
  return (
    <>
      <Helmet>
        <title>Privacy Policy | SerialAge</title>
        <meta name="description" content="Privacy Policy for SerialAge. We do not store, track, or transmit your serial numbers." />
        <link rel="canonical" href="https://serialage.com/privacy" />
      </Helmet>
      <header className="site-header" role="banner">
        <div className="site-header__inner">
          <svg
            className="site-header__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          <Link to="/" className="site-header__wordmark" aria-label="SerialAge — Home">
            Serial<span className="site-header__wordmark-accent">Sense</span>
          </Link>
        </div>
      </header>

      <main className="site-main not-found-main" id="main-content">
        <div className="not-found-content">
          <h1 className="not-found-heading" style={{ fontSize: '2rem' }}>Privacy Policy</h1>
          <p className="not-found-body">
            All decoding happens on your device. We do not store, track, or transmit your serial numbers.
          </p>
          <Link to="/" className="btn-decode not-found-cta">
            Go to the decoder
          </Link>
        </div>
      </main>

      <footer className="site-footer" role="contentinfo">
        <nav className="footer-brand-nav" aria-label="Brand decoders">
          {brandPages.map((b) => (
            <Link key={b.slug} to={`/${b.slug}`}>
              {b.displayName} Serial Decoder
            </Link>
          ))}
        </nav>
        <p>
          Results are derived from public manufacturer documentation.
          Always verify against the physical rating plate before replacing equipment.
        </p>
        <p>
          <Link to="/privacy" className="footer-privacy-link">Privacy Policy</Link>
        </p>
      </footer>
    </>
  );
}
