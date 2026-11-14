const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Frontend-academy-s0-s8\\public\\images\\academy';

  // 1. Crop Ahmed Essam large avatar from 04_Enrollments.png (at detail panel top)
  const b64_s04 = fs.readFileSync(path.join(refDir, '04_Enrollments.png')).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#000;"><img id="im" src="data:image/png;base64,${b64_s04}" style="width:1672px;height:941px;display:block;"/></body></html>`);
  await page.waitForSelector('#im');

  // Large avatar in detail panel: x: 1215, y: 325, width: 64, height: 64
  await page.screenshot({
    path: path.join(outDir, 'avatar_ahmed_essam_lg.png'),
    clip: { x: 1214, y: 326, width: 62, height: 62 }
  });

  // Small avatar from row 1 in 04_Enrollments: x: 345, y: 440, width: 34, height: 34
  await page.screenshot({
    path: path.join(outDir, 'avatar_ahmed_essam.png'),
    clip: { x: 345, y: 440, width: 34, height: 34 }
  });

  // Small avatar row 2: Lina Mostafa
  await page.screenshot({
    path: path.join(outDir, 'avatar_lina_mostafa.png'),
    clip: { x: 345, y: 492, width: 34, height: 34 }
  });

  // Small avatar row 3: Omar Khaled
  await page.screenshot({
    path: path.join(outDir, 'avatar_omar_khaled.png'),
    clip: { x: 345, y: 544, width: 34, height: 34 }
  });

  // Small avatar row 4: Youssef Hany
  await page.screenshot({
    path: path.join(outDir, 'avatar_youssef_hany.png'),
    clip: { x: 345, y: 596, width: 34, height: 34 }
  });

  // Small avatar row 5: Salma Ali
  await page.screenshot({
    path: path.join(outDir, 'avatar_salma_ali.png'),
    clip: { x: 345, y: 648, width: 34, height: 34 }
  });

  // Small avatar row 6: Malek Ibrahim
  await page.screenshot({
    path: path.join(outDir, 'avatar_malek_ibrahim.png'),
    clip: { x: 345, y: 700, width: 34, height: 34 }
  });

  // Crop watermarks from header of 04_Enrollments: x: 1040, y: 65, width: 300, height: 75
  await page.screenshot({
    path: path.join(outDir, 'scripe_neon_watermark.png'),
    clip: { x: 1040, y: 62, width: 310, height: 75 }
  });

  console.log('Successfully cropped authentic athlete photos and watermark!');
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
