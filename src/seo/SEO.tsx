/**
 * SEO — React Helmet wrapper for page-specific metadata.
 *
 * Injects into <head>:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - Open Graph: og:title, og:description, og:url, og:type, og:site_name, og:image
 *   - Twitter card meta tags
 *
 * Usage:
 *   // Homepage
 *   <SEO
 *     title="HVAC Serial Number Decoder — Find Equipment Age | SerialAge"
 *     description="Free, instant HVAC serial number decoder..."
 *     path="/"
 *   />
 *
 *   // Brand page
 *   <SEO
 *     title={config.pageTitle}
 *     description={config.metaDescription}
 *     path={`/${config.slug}`}
 *   />
 *
 * Architecture rules:
 * - No serial numbers in metadata.
 * - No duplicate metadata strings — all values come from the call-site.
 * - Canonical URLs are built via canonicalUrl() — never localhost, never trailing slash.
 *
 * Per phase_6_production_seo_specification.md Parts 7, 8, and 22.
 */

import { Helmet } from 'react-helmet-async';
import { canonicalUrl, OG_SITE_NAME, OG_IMAGE_URL } from './config';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SEOProps {
  /** Full <title> string for this page */
  title: string;

  /** <meta name="description"> content */
  description: string;

  /** Absolute path for this page — e.g., '/' or '/carrier-serial-number-decoder' */
  path: string;

  /**
   * Open Graph type.
   * Homepage and brand pages use 'website' (not 'article' — no publication date).
   * @default 'website'
   */
  ogType?: string;

  /**
   * Optional: structured data JSON-LD objects to inject as <script type="application/ld+json">.
   * Pass an array if the page has multiple schema objects (e.g., FAQPage + BreadcrumbList).
   */
  structuredData?: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SEO({
  title,
  description,
  path,
  ogType = 'website',
  structuredData,
}: SEOProps) {
  const canonical = canonicalUrl(path);

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* ── Open Graph ───────────────────────────────────── */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={OG_SITE_NAME} />
      <meta property="og:image" content={OG_IMAGE_URL} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${OG_SITE_NAME} — Decode HVAC Equipment Serial Numbers`} />

      {/* ── Twitter / X Card ─────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE_URL} />

      {/* ── Structured Data (JSON-LD) ─────────────────────── */}
      {structuredData?.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
}
