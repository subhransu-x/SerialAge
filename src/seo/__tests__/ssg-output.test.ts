/**
 * ssg-output.test.ts — Validates the raw HTML output of the SSG process.
 * 
 * Ensures that <head> metadata (title, description, canonical, json-ld) 
 * is correctly injected into the static HTML files without requiring JS hydration.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '..', '..', '..', 'dist');

const ROUTES = [
  '/',
  '/methodology',
  '/carrier-serial-number-decoder',
  '/goodman-serial-number-decoder',
  '/lennox-serial-number-decoder',
  '/trane-serial-number-decoder',
  '/rheem-serial-number-decoder',
  '/ruud-serial-number-decoder',
  '/york-serial-number-decoder',
  '/bryant-serial-number-decoder',
  '/payne-serial-number-decoder',
  '/amana-serial-number-decoder'
];

function getFilePathForRoute(route: string): string {
  if (route === '/') {
    return path.join(CLIENT_DIST, 'index.html');
  }
  const slug = route.replace(/^\//, '');
  return path.join(CLIENT_DIST, slug, 'index.html');
}

describe('SSG Raw HTML Output', () => {
  beforeAll(() => {
    if (!fs.existsSync(CLIENT_DIST)) {
      throw new Error(`dist directory not found at ${CLIENT_DIST}. Did you run npm run build?`);
    }
  });

  for (const route of ROUTES) {
    describe(`Route: ${route}`, () => {
      let rawHtml = '';
      let rootNode: any;
      
      beforeAll(() => {
        const filePath = getFilePathForRoute(route);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Missing generated file: ${filePath}`);
        }
        rawHtml = fs.readFileSync(filePath, 'utf-8');
        rootNode = parse(rawHtml);
      });

      it('has exactly one meaningful <title> inside <head>', () => {
        const head = rootNode.querySelector('head');
        expect(head).toBeDefined();
        
        const titles = head.querySelectorAll('title');
        expect(titles.length).toBe(1);
        
        const titleText = titles[0].textContent.trim();
        expect(titleText.length).toBeGreaterThan(5);
        expect(titleText).not.toBe('{{title}}');
        expect(titleText).not.toBe('<!--app-head-->');

        // Verify it doesn't accidentally have the homepage title unless it IS the homepage
        if (route !== '/') {
          expect(titleText).not.toBe('HVAC Serial Number Decoder — Find Equipment Age | SerialAge');
        }
      });

      it('has one meta description inside <head>', () => {
        const head = rootNode.querySelector('head');
        const descriptions = head.querySelectorAll('meta[name="description"]');
        expect(descriptions.length).toBe(1);
        
        const content = descriptions[0].getAttribute('content');
        expect(content).toBeDefined();
        expect(content?.length).toBeGreaterThan(10);
      });

      it('has one canonical link inside <head>', () => {
        const head = rootNode.querySelector('head');
        const canonicals = head.querySelectorAll('link[rel="canonical"]');
        expect(canonicals.length).toBe(1);
        
        const href = canonicals[0].getAttribute('href');
        expect(href).toBeDefined();
        expect(href).toMatch(/^https:\/\//);
        expect(href).not.toContain('localhost');

        // Check it points to the correct route
        if (route === '/') {
          expect(href).toBe('https://serialage.com/');
        } else {
          expect(href).toBe(`https://serialage.com${route}`);
        }
      });

      it('has JSON-LD script(s) inside <head>', () => {
        const head = rootNode.querySelector('head');
        const jsonLdScripts = head.querySelectorAll('script[type="application/ld+json"]');
        
        // Homepage and brand pages should have JSON-LD
        if (route !== '/methodology' && route !== '/privacy') {
          expect(jsonLdScripts.length).toBeGreaterThanOrEqual(1);
        }

        for (const script of jsonLdScripts) {
          const content = script.textContent;
          expect(content).toBeDefined();
          
          // Verify it parses as valid JSON
          expect(() => JSON.parse(content)).not.toThrow();
        }
      });

      // Phase 9D: FAQ schema sync tests
      if (route === '/') {
        it('homepage renders exactly 6 FAQ items in static HTML', () => {
          const appRoot = rootNode.querySelector('#root');
          expect(appRoot).toBeDefined();
          const faqButtons = appRoot.querySelectorAll('.faq-q');
          expect(faqButtons.length).toBe(6);
        });
      }

      if (route !== '/' && route !== '/methodology' && route !== '/privacy') {
        it('FAQPage JSON-LD mainEntity count matches visible FAQ item count', () => {
          const head = rootNode.querySelector('head');
          const jsonLdScripts = head.querySelectorAll('script[type="application/ld+json"]');
          
          let faqPageSchema: { '@type': string; mainEntity?: unknown[] } | null = null;
          for (const script of jsonLdScripts) {
            const parsed = JSON.parse(script.textContent);
            if (parsed['@type'] === 'FAQPage') {
              faqPageSchema = parsed;
              break;
            }
          }
          
          // All brand pages must have a FAQPage schema
          expect(faqPageSchema).not.toBeNull();
          const schemaCount = faqPageSchema?.mainEntity?.length ?? 0;
          expect(schemaCount).toBeGreaterThan(0);
          
          // The visible FAQ button count must match the schema question count
          const appRoot = rootNode.querySelector('#root');
          const faqButtons = appRoot.querySelectorAll('.faq-q');
          expect(faqButtons.length).toBe(schemaCount);
        });

        it('FAQPage JSON-LD question names appear in visible FAQ content', () => {
          const head = rootNode.querySelector('head');
          const jsonLdScripts = head.querySelectorAll('script[type="application/ld+json"]');
          
          let faqPageSchema: { '@type': string; mainEntity?: Array<{ name: string }> } | null = null;
          for (const script of jsonLdScripts) {
            const parsed = JSON.parse(script.textContent);
            if (parsed['@type'] === 'FAQPage') {
              faqPageSchema = parsed;
              break;
            }
          }
          
          if (!faqPageSchema?.mainEntity) return;
          
          const appRoot = rootNode.querySelector('#root');
          const faqButtons = appRoot.querySelectorAll('.faq-q');
          const visibleTexts: string[] = Array.from(faqButtons).map(
            (btn: unknown) => (btn as { textContent: string }).textContent.trim().replace(/\s+/g, ' ')
          );
          
          for (const entity of faqPageSchema.mainEntity) {
            const questionName = entity.name.trim();
            const found = visibleTexts.some((t) => t.includes(questionName));
            expect(
              found,
              `Schema question not found in visible FAQ buttons: "${questionName}"`
            ).toBe(true);
          }
        });
      }

      it('has no SEO metadata incorrectly leaked inside #root', () => {
        const appRoot = rootNode.querySelector('#root');
        expect(appRoot).toBeDefined();
        
        const rootTitles = appRoot.querySelectorAll('title');
        expect(rootTitles.length).toBe(0);
        
        const rootDescriptions = appRoot.querySelectorAll('meta[name="description"]');
        expect(rootDescriptions.length).toBe(0);
        
        const rootCanonicals = appRoot.querySelectorAll('link[rel="canonical"]');
        expect(rootCanonicals.length).toBe(0);
      });

      // Verification for Phase 9C-1: Sources & Methodology Separation
      if (route !== '/' && route !== '/methodology' && route !== '/privacy') {
        it('renders External Sources and Our Methodology correctly', () => {
          const appRoot = rootNode.querySelector('#root');
          expect(appRoot).toBeDefined();

          const textContent = appRoot.textContent;
          const hasExternal = textContent.includes('External Sources');
          const hasInternal = textContent.includes('Our Methodology');

          // The page should have at least one of the two sections
          expect(hasExternal || hasInternal).toBe(true);

          if (hasExternal) {
            const extSection = appRoot.querySelector('#external-sources')?.parentNode;
            expect(extSection).toBeDefined();
            
            // Should contain links or plain text with publisher
            const listItems = extSection?.querySelectorAll('li');
            expect(listItems?.length).toBeGreaterThan(0);
          }

          if (hasInternal) {
            const intSection = appRoot.querySelector('#methodology')?.parentNode;
            expect(intSection).toBeDefined();

            // Internal sources should not be links
            const intLinks = intSection?.querySelectorAll('a');
            expect(intLinks?.length).toBe(0);

            // Ensure "Internal research record" or similar terminology is present
            const intText = intSection?.textContent || '';
            expect(
              intText.includes('Internal research record') || 
              intText.includes('Implementation audit') ||
              intText.includes('Source evaluation record')
            ).toBe(true);
          }
        });
      }

      // UI Verification for Payne Model Number Input (Step 5)
      // Only run on routes that actually contain the DecoderWidget (homepage and brand pages)
      if (route === '/' || route.endsWith('-serial-number-decoder')) {
        it('conditionally renders Model Number input only for Payne', () => {
          const appRoot = rootNode.querySelector('#root');
          expect(appRoot).toBeDefined();

          const modelInput = appRoot.querySelector('input#inp-model');
          const serialInput = appRoot.querySelector('input#inp-serial');
          
          // Serial number input MUST always exist
          expect(serialInput).not.toBeNull();

          if (route === '/payne-serial-number-decoder') {
            // Payne must have the model input
            expect(modelInput).not.toBeNull();
          } else {
            // Other manufacturers must NOT have the model input
            expect(modelInput).toBeNull();
          }
        });
      }
        
    });
  }
});
