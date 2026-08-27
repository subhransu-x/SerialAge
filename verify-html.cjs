// verify-html.cjs — verify generated HTML after build
'use strict';
const fs = require('fs');

function checkFile(filePath, label, expectCanonical = true, expectJsonLd = true) {
  const html = fs.readFileSync(filePath, 'utf8');

  // Extract head and body using start/end indices (not lazy regex that might fail)
  const headStart = html.indexOf('<head>');
  const headEnd = html.indexOf('</head>');
  const bodyStart = html.indexOf('<body>');
  const bodyEnd = html.lastIndexOf('</body>');

  const headContent = (headStart !== -1 && headEnd !== -1) ? html.substring(headStart, headEnd) : '';
  const bodyContent = (bodyStart !== -1 && bodyEnd !== -1) ? html.substring(bodyStart, bodyEnd) : '';

  // Counts in head
  const titleInHead = (headContent.match(/<title/gi) || []).length;
  const metaDescInHead = (headContent.match(/name="description"/gi) || []).length;
  const canonicalInHead = (headContent.match(/rel="canonical"/gi) || []).length;
  const jsonLdInHead = (headContent.match(/<script type="application\/ld\+json"/gi) || []).length;

  // Counts in body
  const titleInBody = (bodyContent.match(/<title/gi) || []).length;
  const metaInBody = (bodyContent.match(/name="description"|property="og:/gi) || []).length;
  const jsonLdInBody = (bodyContent.match(/<script type="application\/ld\+json"/gi) || []).length;
  const h1Count = (bodyContent.match(/<h1/gi) || []).length;

  console.log(`\n=== ${label} ===`);
  console.log('IN <head>:');
  console.log('  <title>:', titleInHead, titleInHead === 1 ? '✓' : '✗ WRONG (expected 1)');
  console.log('  meta[description]:', metaDescInHead, metaDescInHead === 1 ? '✓' : `✗ WRONG (expected 1, got ${metaDescInHead})`);
  console.log('  rel=canonical:', canonicalInHead, (!expectCanonical || canonicalInHead === 1) ? '✓' : '✗ MISSING');
  console.log('  JSON-LD in head:', jsonLdInHead, jsonLdInHead === 0 ? '✓ (none, correct)' : '⚠ WARN: in head');
  console.log('IN <body>:');
  console.log('  <title> in body:', titleInBody, titleInBody === 0 ? '✓' : '✗ LEAK');
  console.log('  OG meta in body:', metaInBody, metaInBody === 0 ? '✓' : '✗ LEAK');
  console.log('  JSON-LD in body:', jsonLdInBody, !expectJsonLd || jsonLdInBody > 0 ? '✓' : '⚠ MISSING');
  console.log('  <h1>:', h1Count, h1Count === 1 ? '✓' : '? check');

  // Overall pass/fail
  const is404 = !expectCanonical;
  const pass = titleInHead === 1 && (is404 || metaDescInHead === 1) && titleInBody === 0 && metaInBody === 0;
  console.log('  OVERALL:', pass ? '✅ PASS' : '❌ ISSUES FOUND');
}

checkFile('dist/index.html', 'Homepage /');
checkFile('dist/privacy/index.html', 'Privacy /privacy', true, false);
checkFile('dist/carrier-serial-number-decoder/index.html', 'Carrier');
checkFile('dist/goodman-serial-number-decoder/index.html', 'Goodman');
checkFile('dist/lennox-serial-number-decoder/index.html', 'Lennox');
checkFile('dist/404.html', '404', false, false);
