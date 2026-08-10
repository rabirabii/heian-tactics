const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://docs.google.com/spreadsheets/d/1zZoMPfuA1plomt6Kq077Q9CZ3mD_0ThYzF_tIUyf28M/htmlview', { waitUntil: 'networkidle' });
  const tabs = await page.$$eval('#sheet-menu li a', els => els.map(e => e.textContent));
  console.log('Tabs:', tabs);
  
  const spTab = await page.$('text="SP"');
  if (spTab) {
    await spTab.click();
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('SP Text:', text);
  }
  await browser.close();
})();
