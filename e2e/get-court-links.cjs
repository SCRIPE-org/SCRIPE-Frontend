const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login?_tenant=AHLY&redirect=%2Fvenue%2Fresources');
  await page.waitForSelector('#identifier');
  await page.locator('#identifier').fill('ahly.admin@scripe-dev.local');
  await page.locator('#password').fill('P@ssw0rd');
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL(url => url.pathname.includes('/venue/resources'));
  await page.waitForTimeout(4000);
  const links = await page.locator('a[href*="/venue/resources/"]').evaluateAll(els => els.map(e => e.getAttribute('href')));
  console.log('REAL COURT LINKS IN WORKSPACE:', JSON.stringify(links, null, 2));
  await browser.close();
})();
