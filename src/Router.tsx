/**
 * Router — all application route definitions.
 *
 * Routes:
 *   /                                → App (homepage shell — unchanged)
 *   /carrier-serial-number-decoder   → BrandPage (Carrier config)
 *   /goodman-serial-number-decoder   → BrandPage (Goodman config)
 *   /lennox-serial-number-decoder    → BrandPage (Lennox config)
 *   *                                → NotFoundPage (404, no redirect)
 *
 * Adding a new manufacturer:
 *   1. Add a BrandPageConfig entry in src/data/brandPages.ts.
 *   2. Add a Route entry below following the same pattern.
 *   3. No other files need changing.
 */

import { Routes, Route } from 'react-router-dom';
import App from './App';
import { BrandPage } from './pages/BrandPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { PayneWarrantyGuidePage } from './pages/PayneWarrantyGuidePage';
import { getAllBrandPages } from './data/brandPages';

export function AppRouter() {
  const brandPages = getAllBrandPages();

  return (
    <Routes>
      {/* Homepage — existing shell, completely unchanged */}
      <Route path="/" element={<App />} />

      {/* Brand pages — one explicit route per registered brand.
          Config is passed as a prop so BrandPage has no routing dependency. */}
      {brandPages.map((config) => (
        <Route
          key={config.slug}
          path={`/${config.slug}`}
          element={<BrandPage config={config} />}
        />
      ))}

      {/* Privacy Policy */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/methodology" element={<MethodologyPage />} />
      <Route path="/payne-secondary-heat-exchanger-warranty" element={<PayneWarrantyGuidePage />} />

      {/* 404 catch-all — must be the last route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
