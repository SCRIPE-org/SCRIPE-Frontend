const { chromium } = require("@playwright/test");
const path = require("path");

const REF_DIR = "e:/SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11/SCRIPE_Academy_FINAL_Design_Pack/01_Final_Screens";

const screens = [
  "06_Groups_and_Rosters.png",
  "07_Academic_Seasons.png",
  "08_Session_Schedule.png",
  "09_Session_Attendance.png",
  "10_Fees_and_Receivables.png",
];

async function inspectFull() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });

  for (const s of screens) {
    const fullPath = path.resolve(REF_DIR, s).replace(/\\/g, "/");
    await page.setContent(`
      <html>
        <body style="margin:0;background:#000;">
          <img id="ref-img" src="file:///${fullPath}" style="width:1672px;height:941px;display:block;" />
        </body>
      </html>
    `);
    await page.waitForTimeout(500);

    // Save full image copy for inspection in brain
    const brainDest = `C:/Users/DELL/.gemini/antigravity/brain/555143f1-37eb-4991-af0b-70be4ecc245c/${s}`;
    await page.screenshot({ path: brainDest, fullPage: false });
    console.log(`Saved reference to brain: ${brainDest}`);
  }

  await browser.close();
}

inspectFull().catch(console.error);
