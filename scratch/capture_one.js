const { chromium } = require('playwright');
const path = require('path');

const url = process.argv[2];
const destination = process.argv[3];

if (!url || !destination) {
  console.error("Usage: node capture.js <url> <destination>");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: destination, fullPage: true });
  console.log(`Saved screenshot to ${destination}`);

  await browser.close();
})();
