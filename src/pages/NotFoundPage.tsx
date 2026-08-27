/**
 * NotFoundPage — 404 catch-all.
 *
 * Rendered when no route matches. Does NOT redirect to homepage.
 * Provides a clear message and a link back to the decoder.
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | SerialAge</title>
        <meta name="robots" content="noindex" />
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
          <p className="not-found-code" aria-hidden="true">404</p>
          <h1 className="not-found-heading">Page not found</h1>
          <p className="not-found-body">
            We couldn&rsquo;t find the page you were looking for. It may have moved or the
            URL may be incorrect.
          </p>
          <Link to="/" className="btn-decode not-found-cta">
            Go to the decoder
          </Link>
        </div>
      </main>

      <footer className="site-footer" role="contentinfo">
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
