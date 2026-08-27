# PHASE 6 — SERIALSENSE PRODUCTION + SEO FOUNDATION SPECIFICATION

This document outlines the rigorous implementation specification for preparing SerialSense for public deployment and scalable SEO, without writing application code or modifying the current working logic.

---

## PART 1 — CURRENT PROJECT AUDIT

### ALREADY IMPLEMENTED
- **React/Vite Setup**: Fast, modern SPA using Vite.
- **Current App Structure**: A single `<App>` component rendering the header, hero, `<DecoderWidget>`, and footer.
- **Decoder Public API**: Clean separation; UI interacts only with `decode(manufacturerId, serial)` and `getAllManufacturers()`.
- **Manufacturer Registry**: Dynamic registry pattern (`src/decoder/manufacturers/index.ts`). Currently supports Carrier, Goodman, Lennox.
- **CSS/Design System**: "Precision Utility" visual system in `index.css` and `App.css`. Responsive and dark-mode ready.
- **Build Configuration**: Standard `tsc -b && vite build`. Outputs static assets to `dist/`.

### NEEDS IMPLEMENTATION
- **Routing**: Currently missing. It is a strict Single Page Application (SPA) with no URL routing logic (e.g., no `react-router-dom`).
- **Title/Meta Setup**: Currently static in `index.html`. Needs dynamic updating based on the route for SEO.
- **Static/Public Files**: Missing production `robots.txt`, `sitemap.xml`, proper favicons, and Open Graph images.
- **404 Handling**: Missing.

---

## PART 2 — WEBSITE INFORMATION ARCHITECTURE

The recommended URL hierarchy avoids deeply nested folders to keep URLs short and authoritative.

1. `/` (Homepage)
2. `/carrier-serial-number-decoder`
3. `/goodman-serial-number-decoder`
4. `/lennox-serial-number-decoder`

### URL Definitions

**1. `/` (Homepage)**
- **Purpose**: Brand home and general HVAC tool.
- **Search Intent**: General discovery ("HVAC serial number lookup", "how old is my AC").
- **Primary Tool**: The decoder widget with the manufacturer dropdown.
- **Unique Content**: High-level value proposition, list of supported brands, trust signals (No guessing, verified rules).
- **Indexable**: Yes.

**2. `/[brand]-serial-number-decoder` (e.g., Carrier, Goodman, Lennox)**
- **Purpose**: Capture brand-specific search traffic.
- **Search Intent**: Highly specific ("Carrier serial number age", "Goodman AC age lookup").
- **Primary Tool**: The decoder widget, pre-selected to the specific brand (dropdown hidden or locked).
- **Unique Content**: Brand-specific headline, history of their serial formats, locations of rating plates for that brand, known limitations.
- **Indexable**: Yes.

> **REASONABLE INFERENCE**: Users searching for "Carrier serial decoder" want to bypass the dropdown and see Carrier-specific trust signals immediately.

---

## PART 3 — HOMEPAGE ROLE

**Recommendation**: The homepage should target **"HVAC serial number decoder"** and **"HVAC equipment age"**.

**Explanation**: 
The current product scope is specifically HVAC (Carrier, Goodman, Lennox). Targeting "equipment" is too broad (could imply heavy machinery, medical equipment, or IT assets). Targeting "HVAC" accurately sets user expectations, aligns with the implemented manufacturers, and captures a well-defined homeowner and technician intent. As the tool scales to water heaters (e.g., A.O. Smith, Bradford White), the homepage target can slightly broaden to "HVAC & Water Heater serial number decoder."

---

## PART 4 — BRAND PAGE TEMPLATE

To prevent duplicate content penalties and ensure scalable creation, every brand page must follow this reusable template:

1. **Brand-Specific Headline**: e.g., *Carrier Serial Number Decoder*
2. **Concise Explanation**: 1-2 sentences on what the tool does (e.g., "Enter your Carrier, Bryant, or Payne serial number to instantly find the manufacture date.")
3. **Working Decoder**: The core React widget, pre-configured for the brand.
4. **Supported Serial Formats**: A clean UI table generated *dynamically* from the decoder's metadata (`formatUsed.name`, `yearRange`).
5. **How it Works / Where to Look**: 1-2 sentences + SVG diagram or text on where this specific brand usually puts their data plate.
6. **Limitations**: Generated from the decoder's explicit unsupported rules (e.g., "Pre-1985 Carrier serials are not reliably decodable").
7. **Source/Reference Section**: A transparent list of the citations powering the logic (e.g., "Building Intelligence Center").

**What must be unique**: The specific format tables, the limitations, and the citations must be strictly pulled from the manufacturer's decoder definition. No fluff text.

---

## PART 5 — PROGRAMMATIC SEO SAFETY

**Strict Rules for Page Creation:**
A `/brand-serial-number-decoder` page is ONLY allowed to exist and be indexed when:
- The brand is registered in the decoder engine.
- Verified format rules exist and pass the QA test suite.
- The page provides the actual working decoder (not just an article).
- Source metadata is exposed on the page.

**When a page should NOT be indexed (Noindex):**
- "Coming Soon" brands (e.g., Trane, Rheem). They should remain unlinked text in the UI dropdown, not stub pages. Stub pages with "Coming soon" are treated as thin/doorway pages by Google.
- Search result URLs if query parameters are used (e.g., `/?serial=12345` must have a canonical pointing to `/`).

---

## PART 6 — ROUTING ARCHITECTURE

**Recommendation**: **Vite + `react-router-dom` + Static Site Generation (SSG)** (via a tool like `vite-plugin-ssg`).

**Evaluation**:
- **Pure SPA**: Near-zero cost, but relies on Googlebot executing JavaScript to see brand-specific meta tags. Risky for new sites trying to build SEO authority.
- **Next.js / Remix**: Over-engineered for a simple client-side utility. Introduces server hosting costs.
- **Vite SSG**: **Best fit.** It takes the React Router paths (`/`, `/carrier-serial-number-decoder`, etc.) and pre-renders them into static HTML files during `npm run build`. 
  - Compatible with React/Vite.
  - Hosts on any static CDN (Cloudflare Pages, GitHub Pages, Netlify) for free.
  - Perfect SEO (bots see fully formed HTML).
  - Interactivity hydrates immediately.

---

## PART 7 — CANONICALS

**Strategy**: Strict, singular canonicalization.

- **Trailing slash**: NO trailing slash (e.g., `/carrier-serial-number-decoder`).
- **WWW**: Non-www (e.g., `https://serialsense.com`).
- **Protocol**: HTTPS only (HTTP 301 redirects to HTTPS).
- **Casing**: Lowercase only.
- **Query parameters**: Strip all query parameters from the canonical tag. `https://serialsense.com/carrier-serial-number-decoder?serial=123` must have `<link rel="canonical" href="https://serialsense.com/carrier-serial-number-decoder" />`.

---

## PART 8 — TITLE + META STRATEGY

### Homepage
- **Title**: `HVAC Serial Number Decoder — Find Equipment Age | SerialSense` (58 chars)
- **Meta Description**: `Free, instant HVAC serial number decoder. Verify the exact manufacture date and age of Carrier, Goodman, Lennox, and other HVAC equipment. We don't guess.` (154 chars)

### Brand Pages
- **Title Pattern**: `[Brand] Serial Number Decoder — Find Equipment Age | SerialSense`
  - *Example*: `Carrier Serial Number Decoder — Find Equipment Age | SerialSense` (64 chars)
- **Meta Description Pattern**: `Decode your [Brand] serial number instantly. Find the exact manufacture date, equipment age, and supported formats. Based on verified [Brand] documentation.`
  - *Example*: `Decode your Carrier serial number instantly. Find the exact manufacture date, equipment age, and supported formats. Based on verified Carrier documentation.` (158 chars)

---

## PART 9 — STRUCTURED DATA

**Recommendation**: JSON-LD injected in the `<head>`.

1. **`WebApplication` / `SoftwareApplication`**
   - **Why**: SerialSense is a web-based utility tool.
   - **Where**: Homepage and Brand pages.
   - **Use now**: Yes. Defines `applicationCategory` as "UtilityApplication" and provides the tool's name and description.
2. **`WebSite`**
   - **Why**: Establishes the brand identity and canonical domain.
   - **Where**: Homepage only.
3. **`BreadcrumbList`**
   - **Why**: Helps Google understand the flat hierarchy (`Home > Carrier Decoder`).
   - **Where**: Brand pages.
4. **`FAQPage`**
   - **Why**: Good for capturing "How old is my Carrier AC?" rich snippets.
   - **Where**: Brand pages (dynamically populated with 1-2 standard questions: "How do I decode a [Brand] serial number?").

*Do NOT use*: Review/AggregateRating schema (fabricating ratings is a manual penalty risk).

---

## PART 10 — SITEMAP

**Strategy**: A static `sitemap.xml` generated at build time.

- **Include**: `/`, `/carrier-serial-number-decoder`, `/goodman-serial-number-decoder`, `/lennox-serial-number-decoder`.
- **Exclude**: Any paths with query parameters, 404 pages, or unreleased manufacturers.
- **Update Strategy**: Automatically generated during the `npm run build` SSG step based on the `getAllManufacturers()` array.

---

## PART 11 — ROBOTS.TXT

**Strategy**: Simple and permissive.

```text
User-agent: *
Allow: /

Sitemap: https://serialsense.com/sitemap.xml
```

Do not block `/assets/` or `/src/`. Googlebot needs access to CSS and JS to assess mobile-friendliness and Core Web Vitals.

---

## PART 12 — 404 / ERROR PAGES

**Strategy**: A dedicated `404.html` (or React `*` catch-all route).

- **Behavior**: Return a soft 404 (or hard 404 via static hosting config) that renders a helpful React view.
- **Content**: "We couldn't find that page." + a prominent button linking back to the Homepage decoder.
- **Redirects**: Do NOT blindly 301 redirect typos to the homepage (Google treats this as a soft 404 anyway). Only use 301 redirects if a brand page URL permanently changes.

---

## PART 13 — INTERNAL LINKING

**Strategy**: Natural, contextual navigation.

- **Header**: Logo links to `/`.
- **Footer**: Text links to all active `/brand-serial-number-decoder` pages.
- **In-Tool**: If a user is on the Carrier page but selects "Goodman" from the dropdown, the app should instantly React-Router `navigate('/goodman-serial-number-decoder')` rather than just changing component state. This organically cross-links brands.

---

## PART 14 — SEARCH INTENT MAPPING

- **"HVAC serial number lookup", "how old is my AC"** → Homepage (`/`)
- **"Carrier serial number decoder", "Bryant serial lookup"** → Carrier Page (`/carrier-serial-number-decoder`)
- **"Goodman serial number lookup"** → Goodman Page (`/goodman-serial-number-decoder`)
- **"Lennox serial decoder"** → Lennox Page (`/lennox-serial-number-decoder`)

---

## PART 15 — SEARCH CONSOLE STRATEGY

**Monitor**:
1. **Query / Page Mismatches**: Are users landing on the Carrier page when searching for Lennox? (Indicates bad internal linking or meta descriptions).
2. **High Impressions / Low CTR**: Signals our Title/Meta Description needs rewriting to stand out against competitors.
3. **Unexpected Queries**: e.g., "Trane serial number decoder". If we see high impressions here, Trane becomes the immediate next priority for Phase 7 implementation.

---

## PART 16 — ANALYTICS

**Recommendation**: **Plausible Analytics** or **Fathom Analytics** (or self-hosted Umami).
- **Why**: Privacy-first, lightweight (< 1KB), no cookie banners required, doesn't sell data.
- **Metrics to track**: Pageviews, "Decode Clicked" (Custom Event).
- **NEVER COLLECT**: The actual serial numbers entered by users. This is a severe privacy liability and unnecessary for product analytics. Track the *manufacturer selected* and the *result status* (`success`, `unsupported`, `invalid`), but drop the raw input.

---

## PART 17 — PRIVACY

- **Serial Numbers**: MUST remain entirely client-side. The decoder runs 100% in the browser.
- **Network Requests**: The app should make zero outbound API calls with user input.
- **Cookies**: None required.
- **Google Fonts**: Currently loaded via Google CDNs. For strict privacy (e.g., GDPR compliance without consent banners), download `Inter` and `Roboto Mono` and self-host them in the `/public` folder.

---

## PART 18 — PERFORMANCE / CORE WEB VITALS

**Current Bundle Audit**:
- ~215 kB JS / ~12.6 kB CSS.
- **Acceptable?**: Yes. 215 kB uncompressed JS is incredibly fast.
- **Optimizations before launch**:
  1. Self-host fonts (eliminates DNS lookup and TLS negotiation to `fonts.googleapis.com`).
  2. Ensure the Vite SSG prerenders the HTML so the First Contentful Paint (FCP) is immediate, before React even downloads.

---

## PART 19 — DOMAIN / BRAND

**Brand**: SerialSense
- Check `.com` availability.
- Check USPTO TESS database for trademark conflicts on "SerialSense" in the software/HVAC categories.
- Ensure no major competitors use a highly confusing name (e.g., "Serial Sensors").
- **Order**: 1. Check Trademark. 2. Buy Domain. 3. Setup Cloudflare.

---

## PART 20 — PRODUCTION DEPLOYMENT

**Recommendation**: **Cloudflare Pages**.
- **Why**: 
  - Native integration with Vite/React.
  - Near-zero monthly cost (generous free tier).
  - Global edge CDN for instant load times.
  - Automatic GitHub CI/CD integration.
  - Free automated SSL/HTTPS.
- **Alternatives Rejected**: AWS S3/CloudFront (too much devops overhead), Vercel (excellent, but Cloudflare edge caching is slightly better for pure static/SSG).

---

## PART 21 — ENVIRONMENT / CONFIG

Keep it simple.
- `.env.production`
  - `VITE_SITE_URL=https://serialsense.com` (Used for generating canonicals and sitemap).
  - `VITE_ANALYTICS_ID=xxx` (If using Plausible/Fathom).

---

## PART 22 — FAVICON / SOCIAL SHARING

**Required Assets** (Place in `/public`):
1. `favicon.ico` (32x32 fallback)
2. `favicon.svg` (Scalable vector, currently using the scan icon)
3. `apple-touch-icon.png` (180x180, for iOS bookmarks)
4. `og-image.jpg` (1200x630, brand graphic with "SerialSense - Decode Equipment Instantly" text for Twitter/iMessage sharing).
5. `manifest.json` (Minimal PWA setup for theme colors).

---

## PART 23 — SECURITY

- **XSS**: React automatically escapes rendering. Ensure the decoder engine's `result.explanation` and `result.warnings` do not use `dangerouslySetInnerHTML`.
- **Clipboard**: `navigator.clipboard.writeText` is safe, requires user interaction (the Copy button).
- **Hosting Headers**: Set in Cloudflare Pages `_headers` file:
  ```text
  /*
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
  ```

---

## PART 24 — LAUNCH CHECKLIST

**REQUIRED BEFORE PUBLIC LAUNCH**
- [ ] SSG Routing implemented (Vite SSG + React Router).
- [ ] Domain purchased & Cloudflare DNS configured.
- [ ] HTTPS forced.
- [ ] Dynamic `<title>` and `<meta name="description">` per route.
- [ ] Canonical tags injected per route.
- [ ] Self-hosted fonts (remove Google Fonts external call).
- [ ] Cloudflare `_headers` security rules.
- [ ] `og-image.jpg` and `apple-touch-icon.png` added.

**RECOMMENDED**
- [ ] JSON-LD Structured Data.
- [ ] XML Sitemap generation.
- [ ] Privacy-focused analytics tracking (Plausible).
- [ ] Google Search Console verified via DNS txt record.

**CAN WAIT**
- [ ] PWA manifest/offline service workers.
- [ ] Advanced internal cross-linking widgets.

---

## PART 25 — PHASE 6 IMPLEMENTATION PLAN

**6A. Information Architecture & Routing**
- *Objective*: Implement React Router and Vite SSG.
- *Files*: `package.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`.
- *Criteria*: Navigating to `/carrier-serial-number-decoder` loads the tool with Carrier pre-selected.
- *What NOT to change*: Do not touch the decoder engine or styling.

**6B. Technical SEO**
- *Objective*: Dynamic Meta, Canonicals, and Structured Data.
- *Files*: `index.html` (becomes a template), new `src/components/SEO.tsx` (using react-helmet-async).
- *Criteria*: View Source shows accurate `<title>`, canonicals, and JSON-LD for each route.
- *What NOT to change*: Do not block pages in robots.txt yet.

**6C. Search/Brand Pages**
- *Objective*: Create the reusable `BrandPage` template component.
- *Files*: `src/pages/Home.tsx`, `src/pages/BrandPage.tsx`.
- *Criteria*: Brand pages dynamically render format tables and limitations from the decoder registry API.
- *What NOT to change*: Do not hardcode HTML tables.

**6D. Production Deployment**
- *Objective*: Cloudflare Pages setup.
- *Files*: `/public/_headers`, `/public/_redirects`.
- *Criteria*: CI/CD pushes main branch to live custom domain with HTTPS.
- *What NOT to change*: Do not add AWS/Azure infrastructure files.

**6E. Search Console/Measurement**
- *Objective*: Analytics and tracking.
- *Files*: `index.html` (head).
- *Criteria*: Plausible script deployed. No serial numbers logged.

---

## PART 26 — FUTURE SCALING

As the registry grows from 3 to 30+ brands, the architecture remains stable because:
1. **No duplicated components**: One `BrandPage.tsx` takes `manufacturerId` as a prop via the URL route.
2. **Registry as Source of Truth**: The page loops through `getManufacturer(id).formats` to generate the HTML tables. We never hardcode "Carrier WWYY format..." into the React code.
3. **SSG Generation**: The Vite SSG config can simply map over `getAllManufacturers()` to dynamically pre-render all 30 HTML files at build time.

---

## PART 27 — FINAL RECOMMENDATIONS

### RECOMMENDED SITE STRUCTURE
- `/`
- `/carrier-serial-number-decoder`
- `/goodman-serial-number-decoder`
- `/lennox-serial-number-decoder`

### RECOMMENDED SEO FOUNDATION
React Router + Vite SSG for 100% pre-rendered HTML, single canonical URLs, and dynamic React Helmet meta tags.

### RECOMMENDED DEPLOYMENT
Cloudflare Pages

### RECOMMENDED ANALYTICS
Plausible Analytics

### REQUIRED BEFORE LAUNCH
- SSG routing
- Domain purchase
- Dynamic titles/meta
- Self-hosted fonts

### SAFE TO DEFER
- Structured Data (JSON-LD)
- PWA manifests
- Advanced cross-linking widgets

### BIGGEST SEO RISK
Relying entirely on Client-Side Rendering (CSR). **Vite SSG is strictly required** so search engines see fully formed HTML on first pass.

### BIGGEST TECHNICAL RISK
Adding state management complexities. The router should drive state.

### BIGGEST PRODUCT RISK
Logging raw serial numbers.

### FINAL PHASE 6 READINESS
READY FOR IMPLEMENTATION
