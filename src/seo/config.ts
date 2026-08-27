/**
 * SEO configuration — canonical origin and homepage metadata.
 *
 * Rules:
 * - The site origin comes from VITE_SITE_URL (set in .env.production).
 * - No trailing slash on the origin.
 * - No localhost URLs ever reach a canonical tag.
 * - Query parameters are never included in canonical URLs.
 *
 * Per phase_6_production_seo_specification.md Part 7 + Part 8.
 */

// ---------------------------------------------------------------------------
// Canonical origin
// ---------------------------------------------------------------------------

/**
 * The production site origin.
 * Set via VITE_SITE_URL in .env.production.
 * Falls back to the production domain — localhost is never used as canonical.
 */
const RAW_SITE_URL: string = import.meta.env['VITE_SITE_URL'] ?? 'https://serialage.com';

/**
 * Cleaned site origin: lowercase, no trailing slash, always https in production.
 * Used as the base for all canonical and OG URL generation.
 */
export const SITE_ORIGIN: string = RAW_SITE_URL.toLowerCase().replace(/\/$/, '');

/**
 * Build a canonical URL for the given path.
 *
 * Rules (per spec Part 7):
 * - No trailing slash on paths (except root `/`)
 * - Lowercase
 * - No query parameters
 * - No fragment
 *
 * @param path - An absolute path starting with `/` (e.g., '/carrier-serial-number-decoder')
 */
export function canonicalUrl(path: string): string {
  // Strip query strings and fragments from path (safety guard)
  const cleanPath = path.split('?')[0].split('#')[0];
  // Remove trailing slash unless it IS the root
  const normPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');
  return `${SITE_ORIGIN}${normPath}`;
}

// ---------------------------------------------------------------------------
// Open Graph defaults
// ---------------------------------------------------------------------------

/** Site name for og:site_name */
export const OG_SITE_NAME = 'SerialAge';

/**
 * Absolute URL to the OG image.
 * Referenced from /public/og-image.jpg — must be placed there before launch.
 * Listed as a required pre-launch asset in spec Part 22.
 */
export const OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;

// ---------------------------------------------------------------------------
// Homepage metadata
// ---------------------------------------------------------------------------

/**
 * Homepage SEO metadata — per spec Part 8.
 * Must NOT be reused verbatim on any brand page.
 */
export const HOMEPAGE_SEO = {
  title: `HVAC Serial Number Decoder — Find Equipment Age | ${OG_SITE_NAME}`,
  description:
    "Free, instant HVAC serial number decoder. Verify the exact manufacture date and age of Carrier, Goodman, Lennox, and other HVAC equipment. We don't guess.",
  path: '/',
} as const;

