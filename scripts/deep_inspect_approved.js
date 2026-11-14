const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function inspectApproved() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';

  // Let's crop Screen 03 specifically:
  // We want to see:
  // 1. Screen 03 Columns:
  // - Col 1: Trial Athletes queue
  // - Col 2: Middle column (Evaluation Sessions / Schedule)
  // - Col 3: Right column (Rubric / Placement)
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  const b64_s03 = fs.readFileSync(path.join(refDir, '03_Skill_Trials_and_Evaluations.png')).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body style='margin:0;'><img id='im' src='data:image/png;base64,${b64_s03}' style='width:1672px;height:941px;display:block;'/></body></html>`);
  await page.waitForSelector('#im');

  // Let's crop the 3 columns of S03
  await page.screenshot({ path: path.join(outDir, 's03_col1_queue.png'), clip: { x: 298, y: 260, width: 450, height: 670 } });
  await page.screenshot({ path: path.join(outDir, 's03_col2_middle.png'), clip: { x: 750, y: 260, width: 450, height: 670 } });
  await page.screenshot({ path: path.join(outDir, 's03_col3_detail.png'), clip: { x: 1200, y: 260, width: 470, height: 670 } });
  await page.screenshot({ path: path.join(outDir, 's03_metrics_row.png'), clip: { x: 298, y: 140, width: 1374, height: 115 } });

  console.log('Saved Screen 03 detailed crops');

  await browser.close();
}

inspectApproved().catch(e => { console.error(e); process.exit(1); });
