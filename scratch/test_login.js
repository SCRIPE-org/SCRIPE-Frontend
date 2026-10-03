const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('response', async res => {
    if (res.url().includes('login') || res.url().includes('auth') || res.status() >= 400) {
      try {
        const text = await res.text();
        console.log('HTTP RESP:', res.status(), res.url(), text.slice(0, 300));
      } catch (e) {
        console.log('HTTP RESP:', res.status(), res.url());
      }
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3005/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('#identifier', { timeout: 10000 });
  
  console.log('Filling credentials...');
  await page.click('#identifier');
  await page.fill('#identifier', 'superadmin');
  await page.press('#identifier', 'Tab');
  await page.fill('input[type="password"]', 'P@ssw0rd');
  await page.waitForTimeout(1000);
  
  console.log('Submitting...');
  const submitBtn = page.locator('button[type="submit"]');
  console.log('Is submit enabled?', await submitBtn.isEnabled());
  await submitBtn.click();
  
  await page.waitForTimeout(6000);
  console.log('Current URL after submit:', page.url());
  
  // Now navigate to /venue
  console.log('Navigating to /venue...');
  await page.goto('http://localhost:3005/venue', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(4000);
  
  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Final Title:', title);
  
  const content = await page.innerText('body');
  console.log('Body snippet:', content.slice(0, 500));
  
  await page.screenshot({ path: 'scratch/venue_check.png', fullPage: true });
  console.log('Screenshot saved to scratch/venue_check.png');
  
  await browser.close();
})().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
