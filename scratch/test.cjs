const https = require('https');
https.get('https://serialage.com/ruud-serial-number-decoder', (res) => {
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    const i = d.indexOf('how-it-works');
    console.log(d.substring(Math.max(0, i - 100), i + 2000));
  });
});
