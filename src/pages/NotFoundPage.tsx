import { Helmet } from 'react-helmet-async';
import { OG_SITE_NAME } from '../seo/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>{`Page Not Found | ${OG_SITE_NAME}`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* NAV */}
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a className="nav-logo" href="/" aria-label={`${OG_SITE_NAME} home`}>
            <div className="nav-logo-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v14M2 9h14M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="nav-logo-text">{OG_SITE_NAME}</span>
          </a>
          <div className="nav-right">
            <a className="nav-link" href="/">Decoder</a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main id="main-content">
        <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="section-inner" style={{ maxWidth: '800px' }}>
            <p style={{ fontSize: '120px', fontWeight: 'bold', margin: '0 0 16px', color: 'var(--mute)', opacity: 0.2, lineHeight: 1 }}>404</p>
            <h1 className="hero-h1" style={{ fontSize: '48px', marginBottom: '24px' }}>Page not found</h1>
            <p className="hero-sub" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: '100%' }}>
              We couldn&rsquo;t find the page you were looking for. It may have moved or the URL may be incorrect.
            </p>
            <div className="article-content" style={{ display: 'flex', justifyContent: 'center' }}>
               <a className="btn-primary" href="/">Go to the decoder</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
