import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function PayneWarrantyGuidePage() {
  return (
    <>
      <Helmet>
        <title>Payne Secondary Heat Exchanger Warranty Guide (1993–2011) | SerialAge</title>
        <meta
          name="description"
          content="Information on the Payne and Carrier secondary heat exchanger enhanced warranty program, including verified model families and serial number boundaries."
        />
        <link rel="canonical" href="https://serialage.com/payne-secondary-heat-exchanger-warranty" />
      </Helmet>

      <main className="content-page">
        <div className="container">
          <header className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="page-title">Payne Secondary Heat Exchanger Warranty Guide (1993–2011)</h1>
            <p className="page-subtitle" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--slate)' }}>
              A factual guide to the documented enhanced warranty program for specific high-efficiency condensing gas furnaces.
            </p>
          </header>

          <div className="prose">
            <section className="guide-section">
              <h2>What is the Enhanced Warranty Program?</h2>
              <p>
                In 2009 (and later updated), Carrier Corporation issued service bulletins (including DSB 09-0022 and SMB 19-0022) offering enhanced warranty coverage for specific high-efficiency (90%+) condensing gas furnaces due to potential secondary heat exchanger failures. Because Payne is a Carrier brand using identical internal components and serial number logic, certain Payne models were explicitly included in this program.
              </p>
              <p>
                This program <strong>does not</strong> imply that every Payne furnace manufactured between 1993 and 2011 is affected or covered. The published program applies only to <strong>specific Payne furnace models</strong> and a <strong>specific serial-number range</strong>.
              </p>
            </section>

            <section className="guide-section">
              <h2>Verified Eligible Payne Models</h2>
              <p>
                Based on published documentation, only the following specific Payne model families are included in the enhanced warranty program. To qualify, your exact model number must start with one of these prefixes:
              </p>
              <ul style={{ background: 'var(--surface-sunken)', padding: '24px 48px', borderRadius: 'var(--r-lg)', listStyleType: 'disc', margin: '24px 0' }}>
                <li><strong>490A</strong></li>
                <li><strong>PG9M</strong></li>
                <li><strong>PG9U</strong></li>
              </ul>
              <p style={{ fontStyle: 'italic', color: 'var(--slate)' }}>
                Note: Models such as the PG8M (80% efficiency) are not part of this specific secondary heat-exchanger bulletin. 
              </p>
            </section>

            <section className="guide-section">
              <h2>Verified Serial Number Boundaries</h2>
              <p>
                In addition to matching a verified model family, your furnace's serial number must fall strictly within the published production boundary:
              </p>
              <div style={{ background: 'var(--surface-sunken)', padding: '24px', borderRadius: 'var(--r-lg)', margin: '24px 0', textAlign: 'center' }}>
                <strong style={{ fontSize: '18px', color: 'var(--text)' }}>
                  2993A00001 &nbsp; to &nbsp; 5211A99999
                </strong>
              </div>
              <p>
                This serial number range corresponds to units manufactured between Week 29 of 1993 and Week 52 of 2011. Both the model number and the serial number <strong>must</strong> be checked to determine if a specific unit falls under the published program guidelines.
              </p>
            </section>

            <section className="guide-section">
              <h2>Manufacture Date vs. Installation Date</h2>
              <p>
                The serial number on your Payne furnace strictly encodes the <strong>manufacture date</strong> (when the unit left the factory). However, warranty program coverage limits (e.g., 20 years from installation) frequently depend on the original <strong>installation date</strong>. 
              </p>
              <p>
                If a unit was installed months after it was manufactured, the installation date documented on original paperwork or warranty registration is the legal baseline for coverage.
              </p>
            </section>

            <section className="guide-section" style={{ borderLeft: '4px solid var(--accent-orange)', paddingLeft: '24px', marginTop: '40px', background: 'var(--surface-sunken)', padding: '24px' }}>
              <h2>Professional Verification Required</h2>
              <p>
                <strong>SerialAge cannot confirm legal warranty eligibility and does not diagnose equipment.</strong> 
              </p>
              <p>
                A matching model and serial number do not guarantee warranty coverage, nor do they confirm that your specific equipment has failed. All warranty claims and equipment diagnostics must be verified by Payne, Carrier, or an authorized HVAC professional physically inspecting the unit.
              </p>
            </section>

            <section className="guide-section" style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
              <h2>Next Steps & Official Sources</h2>
              <p>
                If you believe your furnace falls within these parameters, contact an authorized Payne or Carrier dealer to schedule an inspection and verify your coverage options.
              </p>
              <ul style={{ marginBottom: '40px' }}>
                <li>Read more about our research processes on our <Link to="/methodology">Methodology Page</Link>.</li>
              </ul>
              
              <div style={{ textAlign: 'center' }}>
                <Link to="/payne-serial-number-decoder" className="btn-primary" style={{ display: 'inline-block', padding: '16px 32px', background: 'var(--brand)', color: 'white', textDecoration: 'none', borderRadius: 'var(--r-md)', fontWeight: 600 }}>
                  Return to the Payne Serial Number Decoder
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
