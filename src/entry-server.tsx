/**
 * entry-server.tsx — server-side rendering entry point.
 *
 * Used exclusively during the SSG/prerender build step.
 * NOT loaded in the browser — the browser uses main.tsx.
 *
 * Exports a single `render` function that:
 *   1. Renders the route tree at the given URL using StaticRouter.
 *   2. Collects Helmet (react-helmet-async) tags.
 *   3. Returns { appHtml, helmetContext } for injection into index.html.
 *
 * Architecture constraints:
 * - Uses StaticRouter (react-router-dom/server) for SSR — not BrowserRouter.
 * - HelmetProvider accepts a `context` object for server-side extraction.
 * - No browser APIs (window, document, localStorage) are called here.
 * - DecoderWidget interactive state is left for client hydration.
 */

import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { AppRouter } from './Router';

// Re-export so prerender.mjs can derive the route list without hard-coding manufacturers
export { getAllBrandPages } from './data/brandPages';

export interface HelmetContext {
  helmet?: HelmetServerState;
}

/**
 * Render a route to HTML.
 *
 * @param url - The path to render (e.g., '/', '/carrier-serial-number-decoder')
 * @returns appHtml and helmetContext for head injection
 */
export function render(url: string): { appHtml: string; helmetContext: HelmetContext } {
  const helmetContext: HelmetContext = {};

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AppRouter />
      </StaticRouter>
    </HelmetProvider>,
  );

  return { appHtml, helmetContext };
}

