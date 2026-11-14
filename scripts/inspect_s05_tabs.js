const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function inspectS05Tabs() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';

  const b64 = fs.readFileSync(path.join(refDir, '05_Programs_and_Offerings.png')).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body style='margin:0;'><img id='im' src='data:image/png;base64,${b64}' style='width:1672px;height:941px;display:block;'/></body></html>`);
  await page.waitForSelector('#im');

  // Let's crop between header and grid: y: 220 to 335
  await page.screenshot({ path: path.join(outDir, 's05_tabs_and_filters.png'), clip: { x: 298, y: 220, width: 1374, height: 115 } });

  console.log('Saved S05 tabs and filters');
  await browser.close();
}

inspectS05Tabs().catch(e => { console.error(e); process.exit(1); });
