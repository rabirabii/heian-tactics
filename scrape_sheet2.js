const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://docs.google.com/spreadsheets/d/1zZoMPfuA1plomt6Kq077Q9CZ3mD_0ThYzF_tIUyf28M/edit?gid=1118801361#gid=1118801361', { waitUntil: 'networkidle' });
  const title = await page.title();
  const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Title:', title);
  console.log('Text:', text);
  await browser.close();
})();
