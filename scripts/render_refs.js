const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function inspectImages() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  
  const screens = [
    { id: '06', name: '06_Groups_and_Rosters.png' },
    { id: '07', name: '07_Academic_Seasons.png' },
    { id: '08', name: '08_Session_Schedule.png' },
    { id: '09', name: '09_Session_Attendance.png' },
    { id: '10', name: '10_Fees_and_Receivables.png' },
  ];

  for (const s of screens) {
    const imgPath = path.resolve(`e:/SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11/SCRIPE_Academy_FINAL_Design_Pack/01_Final_Screens/${s.name}`);
    const html = `<html><body style="margin:0;background:#000;"><img src="file:///${imgPath.replace(/\\/g, '/')}" style="width:1672px;height:941px;display:block;"/></body></html>`;
    await page.setContent(html);
    await page.waitForTimeout(500);
    console.log(`Rendered reference ${s.name}`);
  }

  await browser.close();
}

inspectImages().catch(console.error);
