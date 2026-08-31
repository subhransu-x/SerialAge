/**
 * Structured data (JSON-LD) schema builders.
 *
 * Implements the schemas approved in phase_6_production_seo_specification.md Part 9:
 *   1. WebApplication  — homepage + brand pages
 *   2. WebSite         — homepage only
 *   3. BreadcrumbList  — brand pages only
 *   4. FAQPage         — brand pages only
 *
 * Rules:
 * - NO fabricated reviews, ratings, prices, or availability.
 * - NO schema types not in the specification.
 * - All data sourced from brandPages.ts config or seo/config.ts — never from user input.
 *
 * Per phase_6_production_seo_specification.md Part 9.
 */

import { SITE_ORIGIN, OG_SITE_NAME, canonicalUrl } from './config';
import type { FaqItem } from '../data/brandPages';

// ---------------------------------------------------------------------------
// WebSite — homepage only
// ---------------------------------------------------------------------------

/**
 * Establishes brand identity and canonical domain.
 * Place on the homepage ONLY.
 */
export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: OG_SITE_NAME,
    url: SITE_ORIGIN,
    description:
      "Free HVAC serial number decoder. Verify the exact manufacture date and age of Carrier, Goodman, Lennox, and other HVAC equipment. We don't guess.",
  };
}

// ---------------------------------------------------------------------------
// WebApplication — homepage + brand pages
// ---------------------------------------------------------------------------

/**
 * Describes SerialAge as a utility application.
 * Per spec Part 9 — "Use now: Yes."
 *
 * @param pageUrl - Canonical URL of the specific page
 * @param name    - Application name for this page (e.g., "Carrier Serial Number Decoder")
 * @param description - Application description for this page
 */
export function buildWebApplicationSchema(
  pageUrl: string,
  name: string,
  description: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: pageUrl,
    description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList — brand pages only
// ---------------------------------------------------------------------------

/**
 * Communicates the flat hierarchy: Home > [Brand] Decoder.
 * Per spec Part 9 — "Use now: Yes."
 *
 * @param brandName - Display name of the brand (e.g., "Carrier")
 * @param brandSlug - URL path segment (e.g., "carrier-serial-number-decoder")
 */
export function buildBreadcrumbSchema(
  brandName: string,
  brandSlug: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: OG_SITE_NAME,
        item: SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${brandName} Serial Number Decoder`,
        item: canonicalUrl(`/${brandSlug}`),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// FAQPage — brand pages only
// ---------------------------------------------------------------------------

/**
 * FAQ structured data — helps Google capture "How old is my [Brand] AC?" rich snippets.
 * Per spec Part 9 — "Use now: Yes."
 *
 * @param faqs - The FAQ items from BrandPageConfig (sourced from phase_6_faq_strategy.md)
 */
export function buildFaqPageSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerSchema || (typeof item.answer === 'string' ? item.answer : ''),
      },
    })),
  };
}
