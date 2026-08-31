const https = require('https');


const baseUrl = 'https://serialage.pages.dev';
const deployUrl = 'https://e5b0e1de.serialage.pages.dev';
const routes = [
  '/',
  '/methodology/',
  '/privacy/',
  '/carrier-serial-number-decoder/',
  '/york-serial-number-decoder/'
];
const nonExistentPath = '/this-route-does-not-exist-serialage';

function fetchUrl(baseUrlToUse, urlPath) {
  return new Promise((resolve, reject) => {
    https.get(baseUrlToUse + urlPath, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    }).on('error', err => reject(err));
  });
}

async function runQA() {
  console.log(`Starting QA for ${baseUrl}...`);

  for (const route of routes) {
    const res = await fetchUrl(baseUrl, route);
    console.log(`\n--- Route: ${route} ---`);
    console.log(`Status: ${res.status}`);
    
    // Check indexing protection
    const robotsTag = res.headers['x-robots-tag'] || 'MISSING';
    console.log(`X-Robots-Tag: ${robotsTag}`);

    // SEO checks
    const canonicalMatch = res.body.match(/<link rel="canonical" href="([^"]+)"/);
    console.log(`Canonical: ${canonicalMatch ? canonicalMatch[1] : 'MISSING'}`);
    
    const titleMatch = res.body.match(/<title>([^<]+)<\/title>/);
    console.log(`Title: ${titleMatch ? titleMatch[1] : 'MISSING'}`);
    
    const h1Match = res.body.match(/<h1[^>]*>([^<]+)<\/h1>/);
    console.log(`H1: ${h1Match ? h1Match[1] : 'MISSING'}`);
  }

  // 404 test
  const res404 = await fetchUrl(baseUrl, nonExistentPath);
  console.log(`\n--- 404 Test: ${nonExistentPath} ---`);
  console.log(`Status: ${res404.status}`);
  console.log(`X-Robots-Tag: ${res404.headers['x-robots-tag'] || 'MISSING'}`);
  const title404Match = res404.body.match(/<title>([^<]+)<\/title>/);
  console.log(`404 Title: ${title404Match ? title404Match[1] : 'MISSING'}`);

}

runQA().catch(console.error);
