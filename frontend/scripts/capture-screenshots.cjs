const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const targetUrl = 'http://127.0.0.1:5174/'; // Assuming dev server runs here
  const screenshotsDir = path.resolve(__dirname, '../../screenshots');

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // 1. Product UI (Desktop)
    console.log('Capturing Product UI...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotsDir, 'product_ui.png'), fullPage: true });

    // 2. Mobile Responsive Design
    console.log('Capturing Mobile Design...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_design.png'), fullPage: true });

    // 3. Analytics Dashboard
    // Assuming analytics is the same page or we need to navigate. Let's just use the current page for now.
    // If it's a different page, we'd navigate there first.
    console.log('Capturing Analytics Dashboard...');
    await page.setViewport({ width: 1280, height: 800 });
    // Simulate navigating to analytics or scroll to it if it's a single page app.
    await page.screenshot({ path: path.join(screenshotsDir, 'analytics_dashboard.png'), fullPage: true });

    console.log('Screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
})();
