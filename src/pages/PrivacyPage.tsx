import { Helmet } from 'react-helmet-async';
import { OG_SITE_NAME, canonicalUrl } from '../seo/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>{`Privacy Policy | ${OG_SITE_NAME}`}</title>
        <meta name="description" content={`Privacy Policy for ${OG_SITE_NAME}. We do not store, track, or transmit your serial numbers.`} />
        <link rel="canonical" href={canonicalUrl('/privacy')} />
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

      {/* MAIN CONTENT */}
      <main id="main-content">
        <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="section-inner" style={{ maxWidth: '800px' }}>
            <h1 className="hero-h1" style={{ fontSize: '48px', marginBottom: '24px' }}>Privacy Policy</h1>
            <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 40px 0', maxWidth: '100%' }}>
              All decoding happens on your device. We do not store, track, or transmit your serial numbers.
            </p>
            <div className="article-content" style={{ textAlign: 'left' }}>
               <a className="btn-primary" href="/">Go to the decoder</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
