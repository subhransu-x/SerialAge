/**
 * SEO unit tests
 *
 * Tests:
 * 1. canonicalUrl() — no trailing slash, no query strings, correct origin
 * 2. HOMEPAGE_SEO — values match phase_6_production_seo_specification.md Part 8
 * 3. Brand page metadata — title, description, slug uniqueness per manufacturer
 * 4. FAQ per brand — correct count, no empty questions/answers
 * 5. Schema builders — correct @type and key fields
 * 6. Only current manufacturers have brand pages (no future/unsupported brands)
 */

import { describe, it, expect } from 'vitest';
import { canonicalUrl, HOMEPAGE_SEO, SITE_ORIGIN, OG_SITE_NAME } from '../../seo/config';
import {
  getBrandPageBySlug,
  getAllBrandPages,
} from '../../data/brandPagesConfig';
import {
  buildWebSiteSchema,
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
} from '../../seo/schemas';

// ---------------------------------------------------------------------------
// canonicalUrl()
// ---------------------------------------------------------------------------

describe('canonicalUrl', () => {
  it('builds root canonical correctly', () => {
    expect(canonicalUrl('/')).toBe(`${SITE_ORIGIN}/`);
  });

  it('builds brand page canonical without trailing slash', () => {
    expect(canonicalUrl('/carrier-serial-number-decoder')).toBe(
      `${SITE_ORIGIN}/carrier-serial-number-decoder`,
    );
  });

  it('strips query parameters from path', () => {
    expect(canonicalUrl('/carrier-serial-number-decoder?serial=12345')).toBe(
      `${SITE_ORIGIN}/carrier-serial-number-decoder`,
    );
  });

  it('strips fragment from path', () => {
    expect(canonicalUrl('/carrier-serial-number-decoder#faq')).toBe(
      `${SITE_ORIGIN}/carrier-serial-number-decoder`,
    );
  });

  it('removes trailing slash from non-root paths', () => {
    expect(canonicalUrl('/goodman-serial-number-decoder/')).toBe(
      `${SITE_ORIGIN}/goodman-serial-number-decoder`,
    );
  });

  it('never contains localhost', () => {
    const url = canonicalUrl('/carrier-serial-number-decoder');
    expect(url).not.toContain('localhost');
  });

  it('SITE_ORIGIN does not have a trailing slash', () => {
    expect(SITE_ORIGIN).not.toMatch(/\/$/);
  });
});

// ---------------------------------------------------------------------------
// HOMEPAGE_SEO — values per specification Part 8
// ---------------------------------------------------------------------------

describe('HOMEPAGE_SEO', () => {
  it('title matches specification Part 8 exactly', () => {
    expect(HOMEPAGE_SEO.title).toBe(
      'HVAC Serial Number Decoder — Find Equipment Age | SerialAge',
    );
  });

  it('description matches specification Part 8 exactly', () => {
    expect(HOMEPAGE_SEO.description).toBe(
      "Free, instant HVAC serial number decoder. Verify the exact manufacture date and age of Carrier, Goodman, Lennox, and other HVAC equipment. We don't guess.",
    );
  });

  it('path is root', () => {
    expect(HOMEPAGE_SEO.path).toBe('/');
  });

  it('title is within 70 character SEO limit', () => {
    expect(HOMEPAGE_SEO.title.length).toBeLessThanOrEqual(70);
  });

  it('description is within 160 character SEO limit', () => {
    expect(HOMEPAGE_SEO.description.length).toBeLessThanOrEqual(160);
  });
});

// ---------------------------------------------------------------------------
// OG constants
// ---------------------------------------------------------------------------

describe('OG constants', () => {
  it('OG_SITE_NAME is SerialAge', () => {
    expect(OG_SITE_NAME).toBe('SerialAge');
  });
});

// ---------------------------------------------------------------------------
// Brand page metadata (Carrier, Goodman, Lennox)
// ---------------------------------------------------------------------------

describe('Brand page configs', () => {
  const brands = getAllBrandPages();
  const slugs = [
    'carrier-serial-number-decoder',
    'goodman-serial-number-decoder',
    'lennox-serial-number-decoder',
    'rheem-serial-number-decoder',
    'ruud-serial-number-decoder',
    'trane-serial-number-decoder',
    'york-serial-number-decoder',
    'bryant-serial-number-decoder',
    'payne-serial-number-decoder',
  ];

  it('exactly 10 brand pages are registered', () => {
    expect(brands).toHaveLength(10);
  });

  it('brand page slugs match expected routes', () => {
    const actualSlugs = brands.map((b) => b.slug);
    for (const slug of slugs) {
      expect(actualSlugs).toContain(slug);
    }
  });

  it('all slugs are unique', () => {
    const actualSlugs = brands.map((b) => b.slug);
    const unique = new Set(actualSlugs);
    expect(unique.size).toBe(brands.length);
  });

  it('all manufacturerIds are unique', () => {
    const ids = brands.map((b) => b.manufacturerId);
    const unique = new Set(ids);
    expect(unique.size).toBe(brands.length);
  });

  for (const slug of slugs) {
    describe(`/${slug}`, () => {
      const config = getBrandPageBySlug(slug);

      it('config exists', () => {
        expect(config).toBeDefined();
      });

      it('pageTitle is non-empty and contains "SerialAge"', () => {
        expect(config!.pageTitle).toBeTruthy();
        expect(config!.pageTitle).toContain('SerialAge');
      });

      it('pageTitle matches spec pattern "[Brand] Serial Number Decoder — Find (Equipment|HVAC) Age | SerialAge"', () => {
        expect(config!.pageTitle).toMatch(
          /Serial Number Decoder — Find (Equipment|HVAC) Age \| SerialAge$/,
        );
      });

      it('pageTitle is within 70 character SEO limit', () => {
        expect(config!.pageTitle.length).toBeLessThanOrEqual(70);
      });

      it('metaDescription is non-empty', () => {
        expect(config!.metaDescription).toBeTruthy();
      });

      it('metaDescription is within 160 character SEO limit', () => {
        expect(config!.metaDescription.length).toBeLessThanOrEqual(160);
      });

      it('pageTitle and metaDescription are not identical to homepage values', () => {
        expect(config!.pageTitle).not.toBe(HOMEPAGE_SEO.title);
        expect(config!.metaDescription).not.toBe(HOMEPAGE_SEO.description);
      });

      it('has at least 4 FAQs', () => {
        expect(config!.faqs.length).toBeGreaterThanOrEqual(4);
      });

      it('all FAQ questions are non-empty strings', () => {
        for (const faq of config!.faqs) {
          expect(typeof faq.question).toBe('string');
          expect(faq.question.length).toBeGreaterThan(0);
        }
      });

      it('all FAQ answers are non-empty', () => {
        for (const faq of config!.faqs) {
          const content = faq.answerSchema || (typeof faq.answer === 'string' ? faq.answer : null);
          expect(typeof content).toBe('string');
          expect(content!.length).toBeGreaterThan(0);
        }
      });

      it('has at least 1 limitation', () => {
        expect(config!.limitations.length).toBeGreaterThanOrEqual(1);
      });

      it('headline is non-empty', () => {
        expect(config!.headline).toBeTruthy();
      });

      it('slug matches expected value', () => {
        expect(config!.slug).toBe(slug);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Unknown slugs — no future/unsupported brand pages bleed through
// ---------------------------------------------------------------------------

describe('Unknown brand slugs', () => {
  // These slugs are NOT yet implemented — they must return undefined
  const futureSlugs = [
    'lennox-serial-number-decoder-INVALID',
  ];

  for (const slug of futureSlugs) {
    it(`getBrandPageBySlug('${slug}') returns undefined`, () => {
      expect(getBrandPageBySlug(slug)).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// Schema builders
// ---------------------------------------------------------------------------

describe('buildWebSiteSchema', () => {
  const schema = buildWebSiteSchema();

  it('@type is WebSite', () => {
    expect(schema['@type']).toBe('WebSite');
  });

  it('@context is schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
  });

  it('url is the site origin', () => {
    expect(schema['url']).toBe(SITE_ORIGIN);
  });

  it('name is SerialAge', () => {
    expect(schema['name']).toBe('SerialAge');
  });
});

describe('buildWebApplicationSchema', () => {
  const schema = buildWebApplicationSchema(
    `${SITE_ORIGIN}/`,
    'Test App',
    'Test description',
  );

  it('@type is WebApplication', () => {
    expect(schema['@type']).toBe('WebApplication');
  });

  it('applicationCategory is UtilityApplication', () => {
    expect(schema['applicationCategory']).toBe('UtilityApplication');
  });

  it('url matches passed pageUrl', () => {
    expect(schema['url']).toBe(`${SITE_ORIGIN}/`);
  });

  it('price is 0 (free tool)', () => {
    const offers = schema['offers'] as Record<string, unknown>;
    expect(offers['price']).toBe('0');
  });
});

describe('buildBreadcrumbSchema', () => {
  const schema = buildBreadcrumbSchema('Carrier', 'carrier-serial-number-decoder');

  it('@type is BreadcrumbList', () => {
    expect(schema['@type']).toBe('BreadcrumbList');
  });

  it('has 2 list items', () => {
    const items = schema['itemListElement'] as unknown[];
    expect(items).toHaveLength(2);
  });

  it('first item is site root', () => {
    const items = schema['itemListElement'] as Record<string, unknown>[];
    expect(items[0]['position']).toBe(1);
    expect(items[0]['item']).toBe(SITE_ORIGIN);
  });

  it('second item is the brand page', () => {
    const items = schema['itemListElement'] as Record<string, unknown>[];
    expect(items[1]['position']).toBe(2);
    expect(items[1]['item']).toBe(`${SITE_ORIGIN}/carrier-serial-number-decoder`);
    expect(items[1]['name']).toBe('Carrier Serial Number Decoder');
  });

  it('brand page URL does not have trailing slash', () => {
    const items = schema['itemListElement'] as Record<string, unknown>[];
    expect(items[1]['item'] as string).not.toMatch(/\/$/);
  });
});

describe('buildFaqPageSchema', () => {
  const faqs = [
    { question: 'What is Q1?', answer: 'Answer 1.' },
    { question: 'What is Q2?', answer: 'Answer 2.' },
  ];
  const schema = buildFaqPageSchema(faqs);

  it('@type is FAQPage', () => {
    expect(schema['@type']).toBe('FAQPage');
  });

  it('mainEntity has same length as input faqs', () => {
    const entities = schema['mainEntity'] as unknown[];
    expect(entities).toHaveLength(2);
  });

  it('each entity is a Question with acceptedAnswer', () => {
    const entities = schema['mainEntity'] as Record<string, unknown>[];
    for (const entity of entities) {
      expect(entity['@type']).toBe('Question');
      const answer = entity['acceptedAnswer'] as Record<string, unknown>;
      expect(answer['@type']).toBe('Answer');
      expect(typeof answer['text']).toBe('string');
    }
  });

  it('question names match input', () => {
    const entities = schema['mainEntity'] as Record<string, unknown>[];
    expect(entities[0]['name']).toBe('What is Q1?');
    expect(entities[1]['name']).toBe('What is Q2?');
  });
});
