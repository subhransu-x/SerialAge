import { useState } from 'react';
import { DecoderWidget } from './components/DecoderWidget';
import { ThemeToggle } from './components/ThemeToggle';
import { Footer } from './components/Footer';
import { BrandIcon } from './components/BrandIcon';
import { SEO } from './seo/SEO';
import { OG_SITE_NAME, canonicalUrl } from './seo/config';
import { buildWebSiteSchema, buildWebApplicationSchema, buildFaqPageSchema } from './seo/schemas';
import './index.css';

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is an HVAC serial number?",
      a: "A serial number is a unique string of letters and numbers assigned by the manufacturer at the factory. Unlike a model number, which describes what the unit is, a serial number encodes when and where it was built — making it the key to finding the manufacture date."
    },
    {
      q: "Where can I find the serial number on my equipment?",
      a: "It is printed on the data plate (a metal or foil sticker). On outdoor air conditioners and heat pumps, look on the side or back of the unit near the refrigerant pipes. On indoor furnaces and air handlers, check inside the front panel door. The data plate also shows the model number — make sure you enter the serial number, not the model number."
    },
    {
      q: "Can I use my model number to find the age?",
      a: "No. Model numbers identify the product family, size, and efficiency rating of the unit, but they do not encode a manufacture date. You must use the serial number."
    },
    {
      q: "Is the manufacture date the same as the installation date?",
      a: "No. The manufacture date is when the unit was built at the factory. Equipment may sit in a warehouse or distributor inventory for weeks or months before being installed. Warranty coverage may depend on the installation date, registration, and manufacturer terms — check the manufacturer's documentation for details."
    },
    {
      q: "Does the serial number contain my personal information?",
      a: "No. Serial numbers only contain factory data: manufacture date, plant code, and a production sequence number. They do not contain homeowner names, addresses, or any personal registration data."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <SEO 
        title={`HVAC Serial Number Decoder — Find Equipment Age | ${OG_SITE_NAME}`}
        description="Free, instant HVAC serial number decoder. Find out exactly when your air conditioner or furnace was manufactured. We decode Carrier, Trane, Lennox, Goodman, and more."
        path="/"
        structuredData={[
          buildWebSiteSchema(),
          buildWebApplicationSchema(canonicalUrl('/'), `HVAC Serial Number Decoder | ${OG_SITE_NAME}`, "Free, instant HVAC serial number decoder. Find out exactly when your air conditioner or furnace was manufactured."),
          buildFaqPageSchema(faqs.map(f => ({ question: f.q, answer: f.a })))
        ]}
      />

      {/* NAV */}
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a className="nav-logo" href="#" aria-label="SerialAge home">
            <div className="nav-logo-mark" aria-hidden="true">
              <BrandIcon color="#ffffff" />
            </div>
            <span className="nav-logo-text">Serial<span>Age</span></span>
          </a>
          <div className="nav-right">
            <a className="nav-link" href="#how-it-works">How It Works</a>
            <a className="nav-link" href="#faq">FAQ</a>
            <a className="nav-cta" href="#decoder-section">Decode Now</a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HERO + DECODER */}
      <main id="main-content">
        <section className="hero" id="decoder-section">
          <div className="hero-content">

          <h1 className="hero-h1">
            Decode your<br/><em>HVAC serial number</em><br/>in seconds
          </h1>
          <p className="hero-sub">
            Find out when your unit was manufactured, how old it is, and exactly how we decoded it — every time.
          </p>

          <DecoderWidget />
        </div>
      </section>



      {/* HOW IT WORKS */}
      <section className="section section-alt section-border-top" id="how-it-works">
        <div className="section-inner" style={{ maxWidth: '1024px' }}>
          <div className="s-eye">How It Works</div>
          <h2 className="s-head">No black boxes, ever.</h2>
          <p className="s-sub">We show every step of the decoding so you can verify the result — not just trust it.</p>
          <div className="how-grid">
            <div>
              <div className="how-step-num">1</div>
              <div className="how-title">Select your manufacturer</div>
              <p className="how-desc">Each brand structures its serial numbers differently. Choosing the right manufacturer ensures the correct decoding logic is applied.</p>
            </div>
            <div>
              <div className="how-step-num">2</div>
              <div className="how-title">Enter the serial number</div>
              <p className="how-desc">Find the serial number on your unit's nameplate — typically on the exterior cabinet or inside the service panel door. Type it exactly as printed.</p>
            </div>
            <div>
              <div className="how-step-num">3</div>
              <div className="how-title">Read the full breakdown</div>
              <p className="how-desc">You'll see the manufacture date, unit age, a character-by-character decode, confidence level, and the source documentation behind our logic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-border-top" id="faq">
        <div className="section-inner" style={{ maxWidth: '840px' }}>
          <div className="s-eye">FAQ</div>
          <h2 className="s-head">Common questions</h2>
          <p className="s-sub">Straightforward answers about how the decoder works and what the results mean.</p>
          <div className="faq-list" role="list">
            {[
              {
                q: "What is an HVAC serial number?",
                a: "A serial number is a unique string of letters and numbers assigned by the manufacturer at the factory. Unlike a model number, which describes what the unit is, a serial number encodes when and where it was built — making it the key to finding the manufacture date."
              },
              {
                q: "Where can I find the serial number on my equipment?",
                a: "It is printed on the data plate (a metal or foil sticker). On outdoor air conditioners and heat pumps, look on the side or back of the unit near the refrigerant pipes. On indoor furnaces and air handlers, check inside the front panel door. The data plate also shows the model number — make sure you enter the serial number, not the model number."
              },
              {
                q: "Can I use my model number to find the age?",
                a: "No. Model numbers identify the product family, size, and efficiency rating of the unit, but they do not encode a manufacture date. You must use the serial number."
              },
              {
                q: "Is the manufacture date the same as the installation date?",
                a: "No. The manufacture date is when the unit was built at the factory. Equipment may sit in a warehouse or distributor inventory for weeks or months before being installed. Warranty coverage may depend on the installation date, registration, and manufacturer terms — check the manufacturer's documentation for details."
              },
              {
                q: "Does the serial number contain my personal information?",
                a: "No. Serial numbers only contain factory data: manufacture date, plant code, and a production sequence number. They do not contain homeowner names, addresses, or any personal registration data."
              }
            ].map((faq, idx) => (
              <div className="faq-item" role="listitem" key={idx}>
                <button 
                  className={`faq-q ${openFaq === idx ? 'open' : ''}`} 
                  onClick={() => toggleFaq(idx)} 
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-ans-${idx}`}
                >
                  {faq.q}
                  <svg className="faq-chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div id={`faq-ans-${idx}`} className={`faq-a ${openFaq === idx ? 'open' : ''}`} role="region">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="cta-inner">
          <h2 className="cta-h2">Ready to decode?</h2>
          <p className="cta-sub">Free, instant, and fully transparent. No account, no signup — just your serial number.</p>
          <a className="btn-primary" href="#decoder-section">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5.5 8h5M8 5.5L10.5 8 8 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Decode a Serial Number
          </a>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
