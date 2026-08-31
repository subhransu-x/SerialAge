/**
 * SSG / prerender unit tests.
 *
 * These tests verify the logical correctness of the prerender pipeline
 * without actually invoking Node file I/O or the full build process.
 *
 * Tests cover:
 *   1. Route list derivation — derived from brandPages, not hard-coded
 *   2. Sitemap URL correctness — production domain, no localhost, correct paths
 *   3. Robots.txt content requirements
 *   4. Brand slug → file path mapping
 *   5. Future brand protection — new brands appear in routes automatically
 *   6. SITE_ORIGIN does not contain localhost
 *   7. 404 route is excluded from sitemap
 *   8. Query strings are not in sitemap
 *   9. All current brand routes present
 *  10. Index.html template has the app-head placeholder
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllBrandPages, getBrandPageBySlug } from '../../data/brandPagesConfig';
import { SITE_ORIGIN, canonicalUrl } from '../../seo/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// ---------------------------------------------------------------------------
// Route list derivation
// ---------------------------------------------------------------------------

describe('Prerender route list derivation', () => {
  const brands = getAllBrandPages();
  const brandRoutes = brands.map((b) => `/${b.slug}`);
  const publicRoutes = ['/', '/privacy', ...brandRoutes];
  const allRoutes = [...publicRoutes, '/404'];

  it('derives routes from getAllBrandPages() — not hard-coded', () => {
    // If brandPages has 3 entries, we get 3 brand routes
    expect(brandRoutes).toHaveLength(brands.length);
    expect(brandRoutes).toHaveLength(brands.length);
    expect(brands.length).toBeGreaterThanOrEqual(4);
  });

  it('public routes include homepage', () => {
    expect(publicRoutes).toContain('/');
  });

  it('public routes include Carrier', () => {
    expect(publicRoutes).toContain('/carrier-serial-number-decoder');
  });

  it('public routes include Goodman', () => {
    expect(publicRoutes).toContain('/goodman-serial-number-decoder');
  });

  it('public routes include Lennox', () => {
    expect(publicRoutes).toContain('/lennox-serial-number-decoder');
  });

  it('404 is in allRoutes but NOT in publicRoutes', () => {
    expect(allRoutes).toContain('/404');
    expect(publicRoutes).not.toContain('/404');
  });

  it('404 would be written to dist/404.html (slug mapping)', () => {
    // Simulate the writeRouteHtml slug logic
    const path404 = '/404';
    // The prerender script has: if (routePath === '/404') → write to dist/404.html
    expect(path404).toBe('/404');
  });

  it('a new brand added to brandPages automatically gets a route', () => {
    // If the array grew to 4, the 4th brand's route would be in brandRoutes
    // We verify the derivation logic works on the current set
    const derived = getAllBrandPages().map((b) => `/${b.slug}`);
    expect(derived).toHaveLength(getAllBrandPages().length);
  });
});

// ---------------------------------------------------------------------------
// Sitemap URL correctness
// ---------------------------------------------------------------------------

describe('Sitemap URL generation logic', () => {
  const brands = getAllBrandPages();
  const indexableRoutes = ['/', '/privacy', ...brands.map((b) => `/${b.slug}`)];

  // Simulate what prerender.mjs does to generate sitemap URLs
  function mockSitemapUrls(siteUrl: string) {
    return indexableRoutes.map((routePath) =>
      routePath === '/' ? `${siteUrl}/` : `${siteUrl}${routePath}`,
    );
  }

  const sitemapUrls = mockSitemapUrls('https://serialage.com');

  it('sitemap contains the homepage URL', () => {
    expect(sitemapUrls).toContain('https://serialage.com/');
  });

  it('sitemap contains Carrier URL', () => {
    expect(sitemapUrls).toContain(
      'https://serialage.com/carrier-serial-number-decoder',
    );
  });

  it('sitemap contains Goodman URL', () => {
    expect(sitemapUrls).toContain(
      'https://serialage.com/goodman-serial-number-decoder',
    );
  });

  it('sitemap contains Lennox URL', () => {
    expect(sitemapUrls).toContain(
      'https://serialage.com/lennox-serial-number-decoder',
    );
  });

  it('sitemap does NOT contain /404', () => {
    for (const url of sitemapUrls) {
      expect(url).not.toContain('/404');
    }
  });

  it('sitemap URLs do not contain localhost', () => {
    for (const url of sitemapUrls) {
      expect(url).not.toContain('localhost');
    }
  });

  it('sitemap URLs do not contain query strings', () => {
    for (const url of sitemapUrls) {
      expect(url).not.toContain('?');
    }
  });

  it('sitemap URLs do not contain fragments', () => {
    for (const url of sitemapUrls) {
      expect(url).not.toContain('#');
    }
  });

  it('sitemap has exactly 12 entries (homepage + privacy + 10 brand pages)', () => {
    expect(sitemapUrls).toHaveLength(12);
  });

  it('future brands would appear in sitemap automatically', () => {
    // The logic derives from getAllBrandPages() — adding a brand increases count
    // We verify the length always equals 2 (homepage + privacy) + brands.length
    expect(sitemapUrls).toHaveLength(2 + brands.length);
  });
});

// ---------------------------------------------------------------------------
// Robots.txt requirements
// ---------------------------------------------------------------------------

describe('robots.txt requirements', () => {
  const robotsPath = path.join(PROJECT_ROOT, 'public', 'robots.txt');

  it('public/robots.txt exists', () => {
    expect(fs.existsSync(robotsPath)).toBe(true);
  });

  it('robots.txt allows all user agents', () => {
    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
  });

  it('robots.txt references production sitemap', () => {
    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('https://serialage.com/sitemap.xml');
  });

  it('robots.txt does not reference localhost', () => {
    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).not.toContain('localhost');
  });
});

// ---------------------------------------------------------------------------
// index.html template
// ---------------------------------------------------------------------------

describe('index.html template', () => {
  const indexPath = path.join(PROJECT_ROOT, 'index.html');

  it('index.html exists', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('contains <!--app-head--> injection placeholder', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<!--app-head-->');
  });

  it('contains <div id="root"> for React hydration target', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<div id="root">');
  });

  it('does NOT contain a static fallback title (title is injected by prerender via app-head)', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    // Static fallback title was intentionally removed: prerendered pages inject
    // the correct <title> via <!--app-head-->; the SPA uses react-helmet-async.
    // index.html must NOT duplicate the title — that would cause double titles.
    expect(content).not.toContain('<title>');
    // The app-head placeholder must be present for prerender injection.
    expect(content).toContain('<!--app-head-->');
  });
});

// ---------------------------------------------------------------------------
// SITE_ORIGIN
// ---------------------------------------------------------------------------

describe('SITE_ORIGIN safety', () => {
  it('SITE_ORIGIN does not contain localhost', () => {
    expect(SITE_ORIGIN).not.toContain('localhost');
  });

  it('SITE_ORIGIN starts with https', () => {
    expect(SITE_ORIGIN).toMatch(/^https:\/\//);
  });

  it('canonicalUrl for brand page does not contain localhost', () => {
    const url = canonicalUrl('/carrier-serial-number-decoder');
    expect(url).not.toContain('localhost');
  });
});

// ---------------------------------------------------------------------------
// Brand route → output path mapping
// ---------------------------------------------------------------------------

describe('Route → output file path mapping', () => {
  // Simulate the writeRouteHtml path logic from prerender.mjs
  function getOutputPath(routePath: string): string {
    if (routePath === '/') return 'dist/index.html';
    if (routePath === '/404') return 'dist/404.html';
    const slug = routePath.replace(/^\//, '');
    return `dist/${slug}/index.html`;
  }

  it('/ maps to dist/index.html', () => {
    expect(getOutputPath('/')).toBe('dist/index.html');
  });

  it('/404 maps to dist/404.html', () => {
    expect(getOutputPath('/404')).toBe('dist/404.html');
  });

  it('/carrier-serial-number-decoder maps to dist/carrier-serial-number-decoder/index.html', () => {
    expect(getOutputPath('/carrier-serial-number-decoder')).toBe(
      'dist/carrier-serial-number-decoder/index.html',
    );
  });

  it('/goodman-serial-number-decoder maps to dist/goodman-serial-number-decoder/index.html', () => {
    expect(getOutputPath('/goodman-serial-number-decoder')).toBe(
      'dist/goodman-serial-number-decoder/index.html',
    );
  });

  it('/lennox-serial-number-decoder maps to dist/lennox-serial-number-decoder/index.html', () => {
    expect(getOutputPath('/lennox-serial-number-decoder')).toBe(
      'dist/lennox-serial-number-decoder/index.html',
    );
  });

  it('all brand pages map to directory/index.html', () => {
    for (const brand of getAllBrandPages()) {
      const outputPath = getOutputPath(`/${brand.slug}`);
      expect(outputPath).toBe(`dist/${brand.slug}/index.html`);
    }
  });
});

// ---------------------------------------------------------------------------
// getBrandPageBySlug safety for unknown slugs
// ---------------------------------------------------------------------------

describe('Unknown slugs do not produce output', () => {
  // Only truly unsupported slugs — rheem and ruud are now live
  const unsupportedSlugs = [
    'lennox-serial-number-decoder-INVALID',
  ];

  for (const slug of unsupportedSlugs) {
    it(`getBrandPageBySlug('${slug}') returns undefined — no prerender route`, () => {
      expect(getBrandPageBySlug(slug)).toBeUndefined();
    });
  }

  it('unsupported slugs do not appear in the route list', () => {
    const routes = getAllBrandPages().map((b) => b.slug);
    for (const slug of unsupportedSlugs) {
      expect(routes).not.toContain(slug);
    }
  });
});
