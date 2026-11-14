const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function analyzeS03() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';

  const b64 = fs.readFileSync(path.join(refDir, '03_Skill_Trials_and_Evaluations.png')).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body style='margin:0;'><img id='im' src='data:image/png;base64,${b64}' style='width:1672px;height:941px;display:block;'/></body></html>`);
  await page.waitForSelector('#im');

  // Let's examine:
  // 1. Header of S03
  // 2. Col 1 (Queue): x: 298, width: 380
  // 3. Col 2 (Middle): x: 690, width: 440
  // 4. Col 3 (Right): x: 1145, width: 510
  await page.screenshot({ path: path.join(outDir, 's03_col1_exact.png'), clip: { x: 298, y: 260, width: 390, height: 670 } });
  await page.screenshot({ path: path.join(outDir, 's03_col2_exact.png'), clip: { x: 695, y: 260, width: 435, height: 670 } });
  await page.screenshot({ path: path.join(outDir, 's03_col3_exact.png'), clip: { x: 1140, y: 260, width: 515, height: 670 } });

  console.log('Saved exact column crops for S03');
  await browser.close();
}

analyzeS03().catch(e => { console.error(e); process.exit(1); });
