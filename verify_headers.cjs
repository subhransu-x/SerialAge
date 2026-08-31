const routes = ['/', '/methodology', '/carrier-serial-number-decoder', '/york-serial-number-decoder'];
async function test() {
  for (const route of routes) {
    const res = await fetch('https://serialage.pages.dev' + route);
    const text = await res.text();
    const xRobots = res.headers.get('x-robots-tag');
    const canonicalMatch = text.match(/<link rel="canonical" href="([^"]+)"/);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';
    console.log(`Route: ${route}`);
    console.log(`Status: ${res.status}`);
    console.log(`X-Robots-Tag: ${xRobots || 'MISSING'}`);
    console.log(`Canonical: ${canonical}`);
    console.log('---');
  }
}
test();
