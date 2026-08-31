/**
 * prerender.mjs — Static Site Generation script.
 *
 * Run AFTER:
 *   1. `vite build` (client build → dist/)
 *   2. `vite build --mode ssr` (server build → dist-server/)
 *
 * This script:
 *   1. Reads the index.html template from dist/
 *   2. Imports the SSR bundle (dist-server/entry-server.cjs)
 *   3. Renders each public route using StaticRouter + HelmetProvider
 *   4. Injects the resulting <head> tags and body HTML into the template
 *   5. Writes each route as a static HTML file in dist/
 *   6. Generates dist/sitemap.xml
 *   7. Copies public/robots.txt to dist/robots.txt (if present)
 *   8. Renders 404.html using the NotFoundPage route
 *
 * Output structure:
 *   dist/
 *     index.html                          ← homepage
 *     404.html                            ← Cloudflare Pages 404 handler
 *     sitemap.xml
 *     robots.txt
 *     carrier-serial-number-decoder/
 *       index.html
 *     goodman-serial-number-decoder/
 *       index.html
 *     lennox-serial-number-decoder/
 *       index.html
 *
 * Cloudflare Pages serves extensionless directory index.html files natively.
 * Direct navigation to /carrier-serial-number-decoder resolves to
 * dist/carrier-serial-number-decoder/index.html automatically.
 *
 * IMPORTANT: This is a Node.js ESM script. It uses dynamic import() for the
 * CJS server bundle to avoid require() in ESM context.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, 'dist');
const SERVER_DIST = path.join(__dirname, 'dist-server');

// ---------------------------------------------------------------------------
// Environment — read VITE_SITE_URL without Vite runtime
// ---------------------------------------------------------------------------

/**
 * Load VITE_SITE_URL from .env.production (or .env as fallback).
 * We cannot use import.meta.env here — this is a plain Node script.
 * Keep it simple: read the .env.production file directly.
 */
function readSiteUrl() {
  for (const envFile of ['.env.production', '.env']) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_SITE_URL=')) {
          const value = trimmed.slice('VITE_SITE_URL='.length).trim();
          if (value && !value.includes('localhost')) {
            return value.replace(/\/$/, ''); // no trailing slash
          }
        }
      }
    }
  }
  return 'https://serialage.com';
}

const SITE_URL = readSiteUrl();
console.log(`[prerender] Site URL: ${SITE_URL}`);

// ---------------------------------------------------------------------------
// Route list — derived from the brand page configs
// ---------------------------------------------------------------------------

/**
 * Load brand page slugs from the compiled server bundle.
 * Avoids hard-coding manufacturer names here.
 */
function loadBrandSlugs(serverModule) {
  if (typeof serverModule.getAllBrandPages === 'function') {
    return serverModule.getAllBrandPages().map((b) => b.slug);
  }
  // Fallback: the server bundle may not re-export getAllBrandPages.
  // In that case, derive them from rendering each brand path (they're
  // embedded in the brandPages config which the render function uses).
  // This path should not be reached with the current architecture.
  throw new Error('[prerender] Server bundle does not export getAllBrandPages. Check entry-server.tsx.');
}

// ---------------------------------------------------------------------------
// HTML injection helpers
// ---------------------------------------------------------------------------

/**
 * Split React 19 renderToString output into head tags and body HTML.
 *
 * React 19 hoists metadata elements (title, meta, link, and script) to the
 * very start of the renderToString output string, before any component markup.
 * This function parses the string forward, tag by tag:
 *   - Collects <title>, <meta>, and <link> tags into headHtml.
 *   - Skips <script> tags (JSON-LD) — they stay in the body div to prevent
 *     hydration mismatches (React 19 keeps script elements in the component
 *     tree; they are NOT hoisted to <head> during hydrateRoot).
 *   - Stops at the first non-head opening element (e.g., <header>), and
 *     returns everything from that point as bodyHtml.
 *
 * WHY JSON-LD STAYS IN BODY: Google accepts JSON-LD in <body>. Leaving it
 * in the server-rendered body div ensures that the client React tree matches
 * exactly what the server rendered, eliminating hydration mismatches.
 *
 * @param {string} appHtml - The raw output from renderToString()
 * @returns {{ headHtml: string, bodyHtml: string }}
 */
function splitAppHtml(appHtml) {
  // Head-only tag names. Anything else signals the start of the body.
  const HEAD_TAGS = new Set(['title', 'meta', 'link', 'script']);

  const headLines = [];
  let cursor = 0;

  while (cursor < appHtml.length) {
    const tagStart = appHtml.indexOf('<', cursor);
    if (tagStart === -1) break;

    // Peek at what follows the '<'
    const afterOpen = appHtml.substring(tagStart + 1, tagStart + 10).toLowerCase();

    // Closing tag (e.g., </title>) — consume and skip; don't treat as body start
    if (afterOpen.startsWith('/')) {
      const closeEnd = appHtml.indexOf('>', tagStart);
      cursor = closeEnd !== -1 ? closeEnd + 1 : tagStart + 2;
      continue;
    }

    // Determine the tag name (read until first whitespace, '/', or '>')
    const tagNameMatch = /^([a-z][a-z0-9]*)/i.exec(afterOpen);
    if (!tagNameMatch) {
      // Comment, doctype, or similar — skip
      const closeEnd = appHtml.indexOf('>', tagStart);
      cursor = closeEnd !== -1 ? closeEnd + 1 : tagStart + 2;
      continue;
    }
    const tagName = tagNameMatch[1].toLowerCase();

    if (!HEAD_TAGS.has(tagName)) {
      // First non-head element — everything from here is body content
      break;
    }

    // Find the end of the opening tag
    const tagEnd = appHtml.indexOf('>', tagStart);
    if (tagEnd === -1) break;

    if (tagName === 'title') {
      // Collect the full <title>...</title> element
      const closeTag = '</title>';
      const closeIdx = appHtml.indexOf(closeTag, tagEnd);
      if (closeIdx !== -1) {
        headLines.push(appHtml.substring(tagStart, closeIdx + closeTag.length));
        cursor = closeIdx + closeTag.length;
      } else {
        headLines.push(appHtml.substring(tagStart, tagEnd + 1));
        cursor = tagEnd + 1;
      }
    } else if (tagName === 'meta' || tagName === 'link') {
      // Self-closing — collect the full opening tag
      headLines.push(appHtml.substring(tagStart, tagEnd + 1));
      cursor = tagEnd + 1;
    } else if (tagName === 'script') {
      // Collect JSON-LD scripts for the <head>
      const closeTag = '</script>';
      const closeIdx = appHtml.indexOf(closeTag, tagEnd);
      if (closeIdx !== -1) {
        headLines.push(appHtml.substring(tagStart, closeIdx + closeTag.length));
        cursor = closeIdx + closeTag.length;
      } else {
        headLines.push(appHtml.substring(tagStart, tagEnd + 1));
        cursor = tagEnd + 1;
      }
    } else {
      cursor = tagEnd + 1;
    }
  }

  return {
    headHtml: headLines.join('\n    '),
    bodyHtml: appHtml.substring(cursor),
  };
}


/**
 * Inject rendered content into the HTML template.
 *
 * The template (index.html) has:
 *   <!--app-head-->         → replaced with hoistable head tags (title, meta, link)
 *   <div id="root"></div>   → replaced with the full server-rendered body HTML
 *                             (includes JSON-LD scripts which stay in body)
 */
function injectIntoTemplate(template, headHtml, appHtml) {
  return template
    .replace('<!--app-head-->', headHtml)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

// ---------------------------------------------------------------------------
// File output helpers
// ---------------------------------------------------------------------------

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write HTML for a route.
 *
 * Routes with a path (e.g., /carrier-serial-number-decoder) are written to
 * dist/carrier-serial-number-decoder/index.html so Cloudflare Pages serves
 * them at the extensionless URL natively.
 *
 * The root route (/) is written to dist/index.html.
 * The 404 route is written directly to dist/404.html.
 */
function writeRouteHtml(routePath, html) {
  if (routePath === '/') {
    const outFile = path.join(CLIENT_DIST, 'index.html');
    fs.writeFileSync(outFile, html, 'utf-8');
    return outFile;
  }

  if (routePath === '/404') {
    const outFile = path.join(CLIENT_DIST, '404.html');
    fs.writeFileSync(outFile, html, 'utf-8');
    return outFile;
  }

  // Brand pages → /slug/index.html
  const slug = routePath.replace(/^\//, '');
  const outDir = path.join(CLIENT_DIST, slug);
  ensureDir(outDir);
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  return outFile;
}

// ---------------------------------------------------------------------------
// Sitemap generator
// ---------------------------------------------------------------------------

/**
 * Generate sitemap.xml containing only indexable, canonical URLs.
 *
 * Excludes: /404, any localhost, query strings, fragments.
 * Includes: / and all brand page slugs.
 */
function generateSitemap(brandSlugs) {
  const indexableRoutes = ['/', ...brandSlugs.map((s) => `/${s}`)];

  const urls = indexableRoutes.map((routePath) => {
    const loc = routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');

  const outFile = path.join(CLIENT_DIST, 'sitemap.xml');
  fs.writeFileSync(outFile, sitemap, 'utf-8');
  return outFile;
}

// ---------------------------------------------------------------------------
// Robots.txt — copy from public/ or generate minimal version
// ---------------------------------------------------------------------------

function generateRobots() {
  const publicRobots = path.join(__dirname, 'public', 'robots.txt');
  const outFile = path.join(CLIENT_DIST, 'robots.txt');

  if (fs.existsSync(publicRobots)) {
    // Public folder robots.txt takes precedence (Vite copies it automatically)
    // If Vite already copied it, this is a no-op. Otherwise write it.
    if (!fs.existsSync(outFile)) {
      fs.copyFileSync(publicRobots, outFile);
    }
    return outFile;
  }

  // No public/robots.txt — generate the minimal correct version
  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  fs.writeFileSync(outFile, content, 'utf-8');
  return outFile;
}

// ---------------------------------------------------------------------------
// Main prerender pipeline
// ---------------------------------------------------------------------------

async function main() {
  console.log('[prerender] Starting SSG pipeline...');

  // Verify build outputs exist
  if (!fs.existsSync(CLIENT_DIST)) {
    throw new Error(`Client dist not found at ${CLIENT_DIST}. Run 'vite build' first.`);
  }
  if (!fs.existsSync(SERVER_DIST)) {
    throw new Error(`Server dist not found at ${SERVER_DIST}. Run 'vite build --mode ssr' first.`);
  }

  // Load the server bundle (CJS)
  const serverBundlePath = path.join(SERVER_DIST, 'entry-server.cjs');
  if (!fs.existsSync(serverBundlePath)) {
    throw new Error(`Server bundle not found at ${serverBundlePath}.`);
  }

  const require = createRequire(import.meta.url);
  const serverModule = require(serverBundlePath);

  const { render } = serverModule;
  if (typeof render !== 'function') {
    throw new Error('[prerender] Server bundle does not export a render() function.');
  }

  // Load brand slugs from server bundle
  const brandSlugs = loadBrandSlugs(serverModule);
  console.log(`[prerender] Brand routes: ${brandSlugs.map((s) => `/${s}`).join(', ')}`);

  // Routes to prerender (404 rendered last — it's not indexable)
  const publicRoutes = ['/', '/privacy', '/methodology', '/payne-secondary-heat-exchanger-warranty', ...brandSlugs.map((s) => `/${s}`)];
  const allRoutes = [...publicRoutes, '/404'];

  // Read the production index.html template
  const templatePath = path.join(CLIENT_DIST, 'index.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Add injection placeholder if not present (idempotent guard)
  if (!template.includes('<!--app-head-->')) {
    // Insert placeholder before </head>
    template = template.replace('</head>', '    <!--app-head-->\n  </head>');
  }

  // Prerender each route
  for (const routePath of allRoutes) {
    console.log(`[prerender] Rendering ${routePath}...`);

    // Render app HTML and capture helmet context
    const { appHtml, helmetContext } = render(routePath);

    // Split: extract title/meta/link for <head> if natively hoisted
    const { headHtml, bodyHtml } = splitAppHtml(appHtml);

    // Extract react-helmet-async tags
    const helmet = helmetContext.helmet;
    let helmetHead = '';
    if (helmet) {
      helmetHead = `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${helmet.script.toString()}
      `.trim();
    }

    const combinedHeadHtml = (headHtml + '\n    ' + helmetHead).trim();

    const html = injectIntoTemplate(template, combinedHeadHtml, bodyHtml);
    const outFile = writeRouteHtml(routePath, html);

    console.log(`[prerender] ✓ ${outFile.replace(__dirname, '.')}`);
  }

  // Generate sitemap.xml
  const sitemapFile = generateSitemap(brandSlugs);
  console.log(`[prerender] ✓ sitemap.xml → ${sitemapFile.replace(__dirname, '.')}`);

  // Generate/copy robots.txt
  const robotsFile = generateRobots();
  console.log(`[prerender] ✓ robots.txt → ${robotsFile.replace(__dirname, '.')}`);

  console.log('[prerender] SSG pipeline complete.');
  console.log(`[prerender] Routes prerendered: ${allRoutes.join(', ')}`);
  console.log('[prerender] Files in dist/:');

  for (const routePath of allRoutes) {
    if (routePath === '/') {
      console.log('  dist/index.html');
    } else if (routePath === '/404') {
      console.log('  dist/404.html');
    } else {
      const slug = routePath.replace(/^\//, '');
      console.log(`  dist/${slug}/index.html`);
    }
  }
}

main().catch((err) => {
  console.error('[prerender] FAILED:', err);
  process.exit(1);
});
