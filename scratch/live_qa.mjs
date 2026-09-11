import puppeteer from 'puppeteer';

import https from 'https';

const LIVE_URL = process.argv[2] || 'https://serialage.com';

const ROUTES = [
  '/',
  '/carrier-serial-number-decoder/',
  '/york-serial-number-decoder/',
  '/rheem-serial-number-decoder/',
  '/bryant-serial-number-decoder/',
  '/payne-serial-number-decoder/',
];

async function runLiveQA() {
  console.log(`Starting Live Verification on ${LIVE_URL}...`);
  const browser = await puppeteer.launch({ headless: 'new' });
  let hasErrors = false;

  // 1. Hydration & Route Tests
  console.log('\n--- 1. HYDRATION & ROUTE TESTS ---');
  for (const route of ROUTES) {
    const page = await browser.newPage();
    let hydrationError = false;
    let otherError = false;
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Minified React error #418') || text.includes('Hydration failed')) {
          hydrationError = true;
          console.error(`❌ Hydration Error on ${route}:`, text);
        } else {
          otherError = true;
          console.error(`❌ Console Error on ${route}:`, text);
        }
      }
    });

    try {
      await page.goto(`${LIVE_URL}${route}`, { waitUntil: 'networkidle0' });
      if (!hydrationError && !otherError) {
        console.log(`✅ [${route}] hydrated cleanly with no errors.`);
      } else {
        hasErrors = true;
      }
    } catch (err) {
      console.error(`❌ Failed to load ${route}:`, err.message);
      hasErrors = true;
    }
    await page.close();
  }

  // 2. Decoder Tests
  console.log('\n--- 2. DECODER TESTS ---');
  
  const testCases = [
    { brand: 'carrier', serial: '0180A12345', expected: ['1980', 'Week 1'] },
    { brand: 'carrier', serial: 'A912345', expected: ['ambiguous', '1969', '1979'] },
    { brand: 'carrier', serial: 'W4D14008', expected: ['September', '1984'] },
    { brand: 'carrier', serial: 'X4A12345', expected: ['October', '1984'] },
    { brand: 'york', serial: 'W1A5123456', expected: ['2015', 'January'] },
  ];

  for (const tc of testCases) {
    const page = await browser.newPage();
    try {
      await page.goto(`${LIVE_URL}/${tc.brand}-serial-number-decoder/`, { waitUntil: 'networkidle0' });
      await page.type('#inp-serial', tc.serial);
      await page.click('.decode-btn');
      await page.waitForSelector('.result-panel.visible', { timeout: 4000 });
      const resultText = await page.$eval('.result-panel.visible', el => el.textContent);
      
      const passed = tc.expected.every(e => resultText.includes(e));
      if (passed) {
        console.log(`✅ ${tc.brand.toUpperCase()} ${tc.serial} decoded correctly.`);
      } else {
        console.error(`❌ ${tc.brand.toUpperCase()} ${tc.serial} failed. Expected: ${tc.expected.join(', ')}. Got: ${resultText.substring(0, 100)}...`);
        hasErrors = true;
      }
    } catch (e) {
      console.error(`❌ ${tc.brand.toUpperCase()} ${tc.serial} threw error:`, e.message);
      hasErrors = true;
    }
    await page.close();
  }

  // 3. Theme & Mobile Tests
  console.log('\n--- 3. THEME & MOBILE TESTS ---');
  const themePage = await browser.newPage();
  await themePage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await themePage.goto(`${LIVE_URL}/`, { waitUntil: 'networkidle0' });
  
  // Theme Toggle
  const isDarkBefore = await themePage.evaluate(() => document.documentElement.classList.contains('dark'));
  await themePage.click('button[aria-label="Toggle Dark Mode"]');
  const isDarkAfter = await themePage.evaluate(() => document.documentElement.classList.contains('dark'));
  
  if (isDarkBefore !== isDarkAfter) {
    console.log(`✅ Theme toggle functional (switched).`);
  } else {
    console.error(`❌ Theme toggle failed.`);
    hasErrors = true;
  }

  // Horizontal overflow
  const bodyWidth = await themePage.evaluate(() => document.body.scrollWidth);
  const windowWidth = await themePage.evaluate(() => window.innerWidth);
  if (bodyWidth <= windowWidth) {
    console.log(`✅ Mobile layout has no horizontal overflow.`);
  } else {
    console.error(`❌ Mobile layout has horizontal overflow! Body: ${bodyWidth}px, Window: ${windowWidth}px`);
    hasErrors = true;
  }
  await themePage.close();
  await browser.close();

  // 4. SEO & SSG Tests
  console.log('\n--- 4. SEO & SSG TESTS ---');
  
  const seoRoutes = [
    '/carrier-serial-number-decoder/',
    '/york-serial-number-decoder/'
  ];

  for (const route of seoRoutes) {
    try {
      const res = await fetch(`${LIVE_URL}${route}`);
      const html = await res.text();
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      const desc = html.match(/<meta name="description" content="(.*?)"/)?.[1];
      const canonical = html.match(/<link rel="canonical" href="(.*?)"/)?.[1];
      const ogTitle = html.match(/<meta property="og:title" content="(.*?)"/)?.[1];
      const jsonLd = html.includes('type="application/ld+json"') ? 1 : 0;

      if (title && desc && canonical === `${LIVE_URL}${route}` && ogTitle && jsonLd > 0) {
        console.log(`✅ SEO tags verified for ${route}`);
      } else {
        console.error(`❌ SEO tags missing or incorrect for ${route}`);
        console.error({ title, desc, canonical, ogTitle, jsonLd });
        hasErrors = true;
      }
    } catch (e) {
      console.error(`❌ Fetch failed for ${route}:`, e.message);
      hasErrors = true;
    }
  }

  // Sitemap
  try {
    const smRes = await fetch(`${LIVE_URL}/sitemap.xml`);
    const smText = await smRes.text();
    if (smText.includes('<urlset') && smText.includes('carrier-serial-number-decoder/')) {
      console.log(`✅ Sitemap loads correctly.`);
    } else {
      console.error(`❌ Sitemap invalid or missing content.`);
      hasErrors = true;
    }
  } catch (e) {
    console.error(`❌ Failed to fetch sitemap:`, e.message);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log('\n❌ LIVE VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL LIVE VERIFICATION TESTS PASSED');
    process.exit(0);
  }
}

runLiveQA();
