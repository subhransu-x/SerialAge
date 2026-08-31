const fs = require('fs');
const files = [
  'src/seo/__tests__/ssg.test.ts',
  'src/seo/__tests__/seo.test.ts',
  'src/seo/schemas.ts',
  'src/Router.tsx',
  'src/pages/BrandPage.tsx',
  'src/entry-server.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/data\/brandPages'/g, "data/brandPagesConfig'");
  fs.writeFileSync(f, content);
});
