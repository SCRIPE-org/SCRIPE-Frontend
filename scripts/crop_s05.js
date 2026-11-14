const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';

  const b64 = fs.readFileSync(path.join(refDir, '05_Programs_and_Offerings.png')).toString('base64');
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000;"><img id="im" src="data:image/png;base64,${b64}" style="width:1672px;height:941px;display:block;"/></body></html>`;
  await page.setContent(html);
  await page.waitForSelector('#im');

  // Screenshot card 1 bottom
  await page.screenshot({
    path: path.join(outDir, 's05_card1_bottom.png'),
    clip: { x: 298, y: 500, width: 660, height: 130 }
  });

  // Screenshot filter bar
  await page.screenshot({
    path: path.join(outDir, 's05_filter_bar_full.png'),
    clip: { x: 298, y: 270, width: 1374, height: 50 }
  });

  await browser.close();
  console.log('Saved card 1 and filter bar');
}
main().catch(err => { console.error(err); process.exit(1); });
