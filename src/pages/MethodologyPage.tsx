import { Helmet } from 'react-helmet-async';
import { OG_SITE_NAME, canonicalUrl } from '../seo/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';

export function MethodologyPage() {
  return (
    <>
      <Helmet>
        <title>{`Methodology — How We Decode HVAC Serial Numbers | ${OG_SITE_NAME}`}</title>
        <meta name="description" content={`Learn how ${OG_SITE_NAME} researches, verifies, and tests HVAC serial number decoding rules. We explain our confidence system, why we reject unsupported formats, and our strict 'no guessing' philosophy.`} />
        <link rel="canonical" href={canonicalUrl('/methodology')} />
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
            <h1 className="hero-h1" style={{ fontSize: '48px', marginBottom: '24px' }}>Methodology</h1>
            <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 64px 0', maxWidth: '100%' }}>
              Transparency is the foundation of {OG_SITE_NAME}. This page details exactly how we research, build, and verify our decoding logic. Our core philosophy is simple: <strong>We do not guess.</strong>
            </p>

            <div className="article-content">
              
              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>1. What {OG_SITE_NAME} Does</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                {OG_SITE_NAME} decodes HVAC serial numbers to extract the factory manufacture date. It applies manufacturer-specific algorithms to user input and visually breaks down exactly which characters represent the year, month, week, and plant code.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>2. Where Our Decoding Rules Come From</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Our decoding logic is not based on AI hallucinations or crowd-sourced guesses. Published manufacturer documentation and reputable technical references are used where available. We map out the exact mathematical patterns established by the manufacturers over the decades.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>3. The Research Process</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '16px' }}>
                Every supported format goes through a strict multi-stage engineering pipeline:
              </p>
              
              <div className="pipeline">
                <div className="pipeline-step"><div className="pipeline-step-num">1</div> Research</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">2</div> Source Audit</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">3</div> Format Verification</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">4</div> Golden Dataset</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">5</div> Implementation</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">6</div> Automated Tests</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">7</div> Adversarial Review</div>
                <div className="pipeline-arrow">→</div>
                <div className="pipeline-step"><div className="pipeline-step-num">8</div> QA</div>
              </div>

              <ul style={{ marginBottom: '40px', color: 'var(--body-color)', lineHeight: '1.6', fontSize: '15px' }}>
                <li><strong>Research:</strong> Locating documentation and historical data.</li>
                <li><strong>Source Audit:</strong> Verifying the authenticity and accuracy of the source.</li>
                <li><strong>Format Verification:</strong> Cross-referencing formats against known real-world examples.</li>
                <li><strong>Golden Dataset:</strong> Building a strict dataset of known good and bad inputs.</li>
                <li><strong>Implementation:</strong> Writing mathematical parsing logic that strictly adheres to the format.</li>
                <li><strong>Automated Tests:</strong> Running the logic against the golden dataset to prevent regressions.</li>
                <li><strong>Adversarial Review:</strong> Testing the logic with malformed, misleading, or edge-case inputs.</li>
                <li><strong>QA:</strong> Final manual quality assurance before deployment.</li>
              </ul>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>4. Source Verification</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                A source can support a format without providing a real-world serial example. We use primary manufacturer documentation where available, supplemented by verified secondary technical resources. We prioritize manufacturer documentation and reputable technical references, and we do not treat unverified claims as sufficient evidence for a decoding rule.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>5. Format Testing</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Our testing architecture ensures that every format rule is individually isolated and proven against a suite of synthetic and real-world inputs. If an input belongs to an unsupported format or era, the tests enforce that the decoder safely rejects it rather than generating a false positive.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>6. Confidence and Uncertainty</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '16px' }}>
                Not all serial numbers are created equal. We grade our results using a clear confidence system:
              </p>
              <ul style={{ marginBottom: '40px', color: 'var(--body-color)', lineHeight: '1.6', fontSize: '15px' }}>
                <li><strong>Verified Format:</strong> The serial number perfectly matches a thoroughly documented and tested manufacturer format. The date is mathematically certain based on that specification.</li>
                <li><strong>Estimated Format:</strong> The serial number matches a known legacy format, but the era may have poor documentation or overlapping historical cycles.</li>
                <li><strong>Uncertain:</strong> The input has severe anomalies or matches multiple conflicting formats, making a definitive date impossible without visual inspection of the equipment.</li>
              </ul>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>7. Ambiguous Serial Numbers</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Some historical serial formats (like pre-2004 York formats) reuse the exact same letter codes every 20-30 years. When this happens, a single serial number could correctly represent two entirely different years. {OG_SITE_NAME} does not silently choose one; it shows you all mathematically valid alternatives and instructs you to verify against the physical equipment label.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>8. Unsupported Formats</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                If you receive an "Unsupported" result, this is an intentional safety feature. Before 1985, many manufacturers used highly inconsistent or undocumented formats. If we cannot establish a reliable, documented interpretation of a format, we refuse to guess. We would rather provide no date than a false date.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>9. Manufacture Date vs Installation Date</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                {OG_SITE_NAME} extracts the <strong>manufacture date</strong>—the exact day, week, or month the unit left the factory line. This is NOT the installation date. Equipment often sits in distributor warehouses for months before being installed in a home. Warranty coverage usually depends on the installation date.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>10. Why Model Numbers are Different</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Model numbers describe what the equipment is (tonnage, efficiency, product family). Serial numbers describe <em>when</em> and <em>where</em> it was made. You cannot extract the manufacture date from an HVAC model number.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>11. What Users Should Verify</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Our tool is an informational starting point. Always verify our results against the physical data plate (rating plate) attached to the unit. If the data plate contains a printed "MFR DATE", that printed date supersedes any decoded result.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>12. Current Coverage</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '16px' }}>
                {OG_SITE_NAME} currently supports standard residential HVAC formats for the following manufacturers:
              </p>
              <ul style={{ marginBottom: '40px', color: 'var(--body-color)', lineHeight: '1.6', fontSize: '15px' }}>
                <li>Carrier</li>
                <li>Goodman</li>
                <li>Lennox</li>
                <li>Trane</li>
                <li>Rheem</li>
                <li>Ruud</li>
                <li>York</li>
                <li>Bryant</li>
                <li>Payne</li>
                <li>Amana</li>
              </ul>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                We do not support every manufacturer, and we do not support water heaters or commercial appliances. Unsupported brands or formats will only be added after strict source verification.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>13. Corrections and Feedback</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                We are constantly auditing our formats. At this time, we do not have an automated public reporting mechanism or contact form. If a result seems mathematically impossible, we recommend consulting a licensed HVAC professional or the manufacturer directly.
              </p>

              <h2 className="s-head" style={{ textAlign: 'left', marginBottom: '16px' }}>14. Disclaimer</h2>
              <p className="s-sub" style={{ textAlign: 'left', marginBottom: '40px' }}>
                Results are based on documented manufacturer formats. We make no universal claims regarding warranty eligibility, safety, or equipment condition. Equipment age does not determine equipment condition, and serial decoding cannot replace a professional diagnosis. Always confirm with a licensed HVAC technician for warranty, insurance, or legal decisions.
              </p>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
