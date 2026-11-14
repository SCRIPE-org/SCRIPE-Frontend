const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const REF_DIR = "e:/SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11/SCRIPE_Academy_FINAL_Design_Pack/01_Final_Screens";
const OUT_DIR = "E:/Scripe_pro/SCRIPE-Frontend-academy-s0-s8/scripts/ref_crops";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const screens = [
  "06_Groups_and_Rosters.png",
  "07_Academic_Seasons.png",
  "08_Session_Schedule.png",
  "09_Session_Attendance.png",
  "10_Fees_and_Receivables.png",
];

async function inspect() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });

  for (const s of screens) {
    const fullPath = path.resolve(REF_DIR, s).replace(/\\/g, "/");
    await page.setContent(`
      <html>
        <body style="margin:0;background:#000;">
          <img id="img" src="file:///${fullPath}" style="width:1672px;height:941px;display:block;" />
        </body>
      </html>
    `);
    await page.waitForTimeout(1000);

    // Crop key regions: Top Header, Metrics, Left Panel, Right Panel
    // Header: y 55 to 140
    const headerPath = path.join(OUT_DIR, `${s}_header.png`);
    await page.screenshot({
      path: headerPath,
      clip: { x: 298, y: 55, width: 1374, height: 160 },
    });

    // Content: y 215 to 941
    const contentPath = path.join(OUT_DIR, `${s}_content.png`);
    await page.screenshot({
      path: contentPath,
      clip: { x: 298, y: 215, width: 1374, height: 726 },
    });

    console.log(`Cropped ${s}: Header -> ${headerPath}, Content -> ${contentPath}`);
  }

  await browser.close();
}

inspect().catch(console.error);
