# PHASE 6E-3 — SERIALSENSE SSG + CRAWLABILITY SPECIFICATION

This specification defines the implementation strategy to convert the SerialSense Single Page Application (SPA) into a statically prerendered site (SSG) optimized for SEO and Cloudflare Pages.

---

## PART 1 — CURRENT ARCHITECTURE AUDIT

**FACTS:**
*   **Vite Configuration**: Standard `vite` + `@vitejs/plugin-react` (Client-side only).
*   **React Router**: `BrowserRouter` is used. Routes are explicitly defined for `/`, `/carrier-serial-number-decoder`, `/goodman...`, and `/lennox...`.
*   **React Helmet**: `react-helmet-async` is installed and functioning for client-side metadata updates.
*   **Data Structure**: `src/data/brandPages.ts` acts as the single source of truth for all brand routes and their specific metadata/content.
*   **Build Process**: `tsc -b && vite build` outputs to `dist/`.
*   **Environment**: `.env.production` defines `VITE_SITE_URL`.
*   **SSR/SSG**: None currently configured. Initial HTML response contains only an empty `<div id="root"></div>` and static fallback metadata.

---

## PART 2 — PRERENDER STRATEGY

**RECOMMENDATION**: **Custom Vite SSR Build Script (Zero-Dependency)**

*Alternative considered: Puppeteer-based plugins (e.g., `prerender-spa-plugin`) or community SSG wrappers (e.g., `vite-react-ssg`).*

**Why**:
Community SSG plugins for React/Vite are often brittle, easily abandoned, or break with major React Router updates. Puppeteer-based prerendering is slow and requires downloading a headless browser during CI/CD. 
Vite has built-in support for SSR builds. Writing a lightweight, custom Node script (`prerender.js`) that uses `react-dom/server` (`renderToString`), `StaticRouter`, and Vite's SSR manifest is the most robust, transparent, and future-proof approach. It introduces **zero** new npm dependencies.

*   **Implementation Complexity**: Moderate. Requires creating an `entry-server.tsx`, a `prerender.js` script, and splitting `index.html` into a template.
*   **Cloudflare Pages Compatibility**: 100%. Generates pure static `.html` files.
*   **React Router Compatibility**: Native compatibility via `StaticRouter`.
*   **Metadata Compatibility**: `react-helmet-async` natively supports extracting the `<head>` tags during server rendering.
*   **Risks**: React hydration mismatches if the server-rendered HTML differs from what the client expects on first load.
*   **Maintenance Burden**: Very low. The script is heavily tailored to this exact app and won't break due to external plugin updates.

---

## PART 3 — PAGE GENERATION

**RECOMMENDATION**: Derive routes dynamically from `brandPages.ts`.

**Routes to prerender**:
*   `/` (Homepage)
*   `/carrier-serial-number-decoder`
*   `/goodman-serial-number-decoder`
*   `/lennox-serial-number-decoder`
*   `/404` (Error page)

**Future Behavior**:
The `prerender.js` script must import `getAllBrandPages()` from the configuration. The route list should be generated dynamically:
`const routes = ['/', ...getAllBrandPages().map(b => '/' + b.slug), '/404'];`
When a developer adds "Trane" to the registry and `brandPages.ts`, the SSG script will **automatically** discover it and prerender `dist/trane-serial-number-decoder.html`. No manual route arrays need updating.

---

## PART 4 — METADATA VERIFICATION

**RECOMMENDATION**: 
During the `renderToString` pass for each route, the prerender script will collect context from `react-helmet-async`.
The script must inject the generated `title`, `meta`, and `link` (canonical) tags directly into the `<!--app-head-->` placeholder of the `index.html` template before saving the file.

This guarantees the initial HTTP response contains:
*   Title
*   Meta description
*   Canonical URL
*   Open Graph tags
*   JSON-LD Structured Data

Googlebot will read these immediately without needing to execute JavaScript.

---

## PART 5 — SITEMAP

**RECOMMENDATION**: Programmatic generation during the SSG build step.

**Implementation**:
Append a function to `prerender.js` that iterates over the same dynamic `routes` array (excluding `/404`).
Using `VITE_SITE_URL` from `.env.production`, it will output a compliant `dist/sitemap.xml`.

**Scaling**:
Since it shares the exact route array used for prerendering, the sitemap scales automatically as new manufacturers are added. A sitemap index is unnecessary until the site exceeds 50,000 URLs.

---

## PART 6 — ROBOTS.TXT

**RECOMMENDATION**: Static file in the `/public` directory.

Create `public/robots.txt` with the following rules:
```text
User-agent: *
Allow: /

Sitemap: https://serialsense.com/sitemap.xml
```
*   Allows all public crawling.
*   Does not block `/assets/` (crucial for Google to evaluate CSS for mobile-friendliness).
*   Points directly to the generated sitemap.

---

## PART 7 — CLOUDFLARE PAGES ROUTING

**RECOMMENDATION**: Leverage Cloudflare's default static routing; minimal `_redirects` needed.

**Behavior**:
*   If we output prerendered routes as `dist/carrier-serial-number-decoder.html`, Cloudflare Pages automatically serves this file when a user navigates to `/carrier-serial-number-decoder` (extensionless URLs).
*   **Client-side route refreshes**: Handled natively because the HTML file exists at that exact path.
*   **Static Assets**: Served directly from `/assets/`.

A `public/_redirects` file is only needed if we want to enforce specific trailing slash behavior or redirect legacy URLs. For the core SPA/SSG hybrid, Cloudflare's default behavior is sufficient as long as we implement Part 8.

---

## PART 8 — 404 BEHAVIOR

**RECOMMENDATION**: 
1. Add `/404` to the dynamic route generation array in the SSG script.
2. Output it as `dist/404.html`.

**Why**:
Cloudflare Pages automatically looks for a `404.html` file at the root of the publish directory. If found, it serves this file and returns a **true HTTP 404 status code**.
This preserves the React UI (header, footer, styles), avoids "Soft 404" SEO penalties (which happen if you redirect unknown URLs to the homepage), and prevents search engines from indexing bad URLs.

---

## PART 9 — OG IMAGE

**REQUIREMENTS**:
The social sharing image (`public/og-image.jpg`) must be created before public launch.
*   **Filename**: `og-image.jpg`
*   **Format**: JPEG (for best compression and broad compatibility).
*   **Dimensions**: 1200 x 630 pixels.
*   **Safe Area**: 1000 x 500 pixels centered (to prevent text cropping on platforms like WhatsApp).
*   **Branding**: Must utilize the "Precision Utility" dark mode aesthetic.
*   **Text**: Include the SerialSense logo and a clear value proposition like "Decode Equipment Instantly".

---

## PART 10 — PERFORMANCE

**VERIFICATION**:
*   **Initial HTML**: The output `.html` files must contain the actual DOM of the app (e.g., `<main>`, `<header>`), not just a `<script>` tag.
*   **JS Hydration**: `src/main.tsx` must be updated to use `hydrateRoot` instead of `createRoot`. This prevents React from destroying and rebuilding the DOM, which causes layout shift (CLS).
*   **Caching**: Cloudflare Pages automatically handles aggressive caching and Cache-Control headers for static assets in `/assets/`.

---

## PART 11 — SEO VALIDATION

**CHECKLIST**:
1.  **Raw HTML Check**: Run `curl -s https://serialsense.com/carrier-serial-number-decoder | grep -i "<title>"`. The output must be the Carrier-specific title, not the fallback homepage title.
2.  **No-JS Check**: Disable JavaScript in Chrome. Navigate to the homepage. The UI (header, footer, layout) must render fully. (The decoder button won't work, which is expected).
3.  **Rich Results**: Paste a deployed brand URL into the Google Rich Results Test to confirm BreadcrumbList and FAQPage parse successfully.
4.  **Sitemap Check**: Open `/sitemap.xml` and confirm no `localhost` URLs exist.
5.  **Search Console**: Use "URL Inspection" on a live brand page and "View Crawled Page" to guarantee Googlebot sees the metadata in the raw HTML response.

---

## PART 12 — TESTING

**TESTING STRATEGY**:
*   **Build Integrity**: Add a test that runs the prerender script and asserts `fs.existsSync('dist/carrier-serial-number-decoder.html')`.
*   **Metadata Integrity**: Read the output HTML strings in a test and assert that `<title>` and JSON-LD strings are present.
*   **Logic Tests**: The existing 253 Vitest unit tests will remain untouched and must continue to pass, as the decoding logic is decoupled from rendering.
*   **Hydration**: Manual browser testing during development to ensure no React hydration mismatch warnings appear in the console.

---

## PART 13 — DEPLOYMENT COMPATIBILITY

**FACT**:
The output of this SSG strategy is a directory (`dist/`) of purely static files (`.html`, `.js`, `.css`).
It requires **no Node.js server**, **no Edge Workers**, and **no serverless functions**. It is 100% compatible with Cloudflare Pages' standard static hosting tier. The decoder logic remains entirely client-side after initial HTML hydration, ensuring maximum privacy and zero API latency.

---

## PART 14 — FINAL IMPLEMENTATION ORDER

To avoid broken builds, implement in this strict order:

1.  **Hydration Prep**: Update `src/main.tsx` to use `hydrateRoot`.
2.  **Server Entry**: Create `src/entry-server.tsx` exposing a `render` function that uses `StaticRouter` and `react-helmet-async`.
3.  **SSG Script**: Write `prerender.js` at the project root to loop through `getAllBrandPages()`.
4.  **HTML Templating**: Modify `index.html` to include injection placeholders (`<!--app-head-->`, `<!--app-html-->`).
5.  **Build Scripts**: Update `package.json` to build the client, build the server, run `prerender.js`, and clean up.
6.  **Sitemap & Robots**: Add sitemap generation to `prerender.js` and create `public/robots.txt`.
7.  **404 Route**: Ensure `/404` is in the prerender list and outputs to `404.html`.
8.  **Validation**: Run the build locally and perform the raw HTML check.

---

## PART 15 — ACCEPTANCE CRITERIA

Phase 6E-3 is complete when:
- [ ] `npm run build` succeeds and produces `dist/index.html`, brand HTML files, and `dist/404.html`.
- [ ] Brand HTML files contain route-specific `<title>`, `<meta>`, and JSON-LD in the raw file.
- [ ] `dist/sitemap.xml` exists and contains correct production URLs (no localhost).
- [ ] `dist/robots.txt` exists and points to the sitemap.
- [ ] Direct navigation to `localhost:5173/carrier-serial-number-decoder` works after build (simulating static host).
- [ ] The existing 253 tests continue to pass.
- [ ] No hydration mismatch warnings appear in the browser console.
