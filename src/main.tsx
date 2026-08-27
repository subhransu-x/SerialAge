/**
 * main.tsx — browser client entry point.
 *
 * Uses hydrateRoot (not createRoot) so React attaches event handlers
 * to the existing server-rendered DOM without destroying and rebuilding it.
 *
 * If the server-rendered HTML is present (SSG build):
 *   → hydrateRoot attaches handlers without layout shift (CLS = 0)
 *
 * If the HTML is empty (dev server / plain client build):
 *   → hydrateRoot falls back to full client render automatically
 *
 * DO NOT switch back to createRoot — that would cause hydration mismatch
 * and CLS on prerendered pages.
 */
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './fonts.css'
import './index.css'
import { AppRouter } from './Router.tsx'

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
