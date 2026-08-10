const { chromium } = require('playwright');
const path = require('path');

const routes = [
  '/dashboard',
  '/resources',
  '/projects',
  '/roster',
  '/planner',
  '/settings'
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Hard refresh for /dashboard to rule out cache
    if (route === '/dashboard') {
      await page.reload({ waitUntil: 'networkidle' });
    }

    // Wait a bit to ensure charts animate and render
    await page.waitForTimeout(1000);
    
    const screenshotPath = path.join(__dirname, 'scratch', `${route.replace('/', '')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);
  }

  await browser.close();
})();
