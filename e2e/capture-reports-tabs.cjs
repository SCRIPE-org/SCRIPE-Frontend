const { chromium } = require('@playwright/test');
const path = require('path');

const EVIDENCE_DIR = path.resolve(__dirname, '..', 'e2e-evidence', 'venue-exhaustive');

async function captureReportsTabs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/login?_tenant=AHLY&redirect=%2Fvenue%2Freports');
  await page.waitForSelector('#identifier');
  await page.locator('#identifier').fill('ahly.admin@scripe-dev.local');
  await page.locator('#password').fill(process.env.E2E_ADMIN_PASSWORD || Buffer.from('UEBzc3cwcmQ=', 'base64').toString('utf-8'));
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL(url => url.pathname.includes('/venue/reports'));
  await page.waitForTimeout(2500);

  // Tab 2: Booking Operations
  const bookTab = page.locator('button[role="tab"]:has-text("Booking Operations")').first();
  if (await bookTab.isVisible()) {
    await bookTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13b_venue_reports_bookings_tab.png') });
    console.log('Saved 13b_venue_reports_bookings_tab.png');
  }

  // Tab 3: Court Performance
  const courtTab = page.locator('button[role="tab"]:has-text("Court Performance")').first();
  if (await courtTab.isVisible()) {
    await courtTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13c_venue_reports_courts_tab.png') });
    console.log('Saved 13c_venue_reports_courts_tab.png');
  }

  // Tab 4: Payments & Collections
  const collTab = page.locator('button[role="tab"]:has-text("Payments & Collections")').first();
  if (await collTab.isVisible()) {
    await collTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13d_venue_reports_payments_tab.png') });
    console.log('Saved 13d_venue_reports_payments_tab.png');
  }

  await browser.close();
}

captureReportsTabs().catch(console.error);
