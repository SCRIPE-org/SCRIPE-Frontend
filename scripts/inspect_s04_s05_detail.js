const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function inspectScreen4and5() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });

  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';

  const inspectCrops = [
    {
      screen: '04_Enrollments.png',
      crops: [
        { name: 's04_header_full', clip: { x: 298, y: 55, width: 1374, height: 85 } },
        { name: 's04_metrics_cards', clip: { x: 298, y: 140, width: 1374, height: 115 } },
        { name: 's04_filters_bar', clip: { x: 298, y: 255, width: 1374, height: 55 } },
        { name: 's04_table_header_and_first_row', clip: { x: 298, y: 310, width: 900, height: 160 } },
        { name: 's04_detail_panel_top', clip: { x: 1200, y: 310, width: 472, height: 280 } },
        { name: 's04_detail_panel_bottom', clip: { x: 1200, y: 590, width: 472, height: 350 } }
      ]
    },
    {
      screen: '05_Programs_and_Offerings.png',
      crops: [
        { name: 's05_header_full', clip: { x: 298, y: 55, width: 1374, height: 85 } },
        { name: 's05_sport_tabs_and_metrics', clip: { x: 298, y: 140, width: 1374, height: 140 } },
        { name: 's05_secondary_filter_bar', clip: { x: 298, y: 280, width: 1374, height: 55 } },
        { name: 's05_program_card_1', clip: { x: 298, y: 335, width: 680, height: 280 } },
        { name: 's05_program_card_2', clip: { x: 990, y: 335, width: 680, height: 280 } },
        { name: 's05_program_card_3', clip: { x: 298, y: 625, width: 680, height: 280 } }
      ]
    }
  ];

  for (const item of inspectCrops) {
    const filePath = path.join(refDir, item.screen);
    const b64 = fs.readFileSync(filePath).toString('base64');
    const html = `<!DOCTYPE html><html><body style='margin:0;background:#000;'><img id='im' src='data:image/png;base64,${b64}' style='width:1672px;height:941px;display:block;'/></body></html>`;
    await page.setContent(html);
    await page.waitForSelector('#im');
    
    for (const crop of item.crops) {
      await page.screenshot({
        path: path.join(outDir, crop.name + '.png'),
        clip: crop.clip
      });
      console.log('Saved crop:', crop.name);
    }
  }

  await browser.close();
}

inspectScreen4and5().catch(e => { console.error(e); process.exit(1); });
