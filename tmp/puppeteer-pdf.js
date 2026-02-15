
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/rapport/cab-004', { waitUntil: 'networkidle0' });
  await page.pdf({ path: './tmp/rapport-cab-004.pdf', format: 'A4' });
  await browser.close();
})();
