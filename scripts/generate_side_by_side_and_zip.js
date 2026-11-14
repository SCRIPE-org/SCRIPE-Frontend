const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function main() {
  const rootDir = 'E:\\Scripe_pro';
  const brainDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\555143f1-37eb-4991-af0b-70be4ecc245c';
  const approvedDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const afterDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\pilot-01-evidence\\after';
  const outputEvidenceDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\pilot-01-evidence';
  const packageDir = path.join(rootDir, 'SCRIPE_ACADEMY_PILOT01_PACKAGE');

  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 3344, height: 941 } });
  const page = await context.newPage();

  const comparisons = [
    {
      title: '01_command_center',
      approved: path.join(approvedDir, '01_Command_Center.png'),
      actual: path.join(afterDir, '01_command_center_dark_en_desktop.png'),
      outName: 'side_by_side_01_command_center.png'
    },
    {
      title: '02_athlete_directory',
      approved: path.join(approvedDir, '02_Athlete_Directory.png'),
      actual: path.join(afterDir, '05_athlete_directory_dark_en_desktop.png'),
      outName: 'side_by_side_02_athlete_directory.png'
    }
  ];

  for (const comp of comparisons) {
    const approvedB64 = fs.readFileSync(comp.approved).toString('base64');
    const actualB64 = fs.readFileSync(comp.actual).toString('base64');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; width: 3344px; height: 941px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .container { display: flex; flex-direction: row; width: 3344px; height: 941px; }
          .pane { position: relative; width: 1672px; height: 941px; }
          .badge { position: absolute; top: 14px; left: 14px; z-index: 50; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
          .badge-approved { background: rgba(14, 18, 12, 0.9); color: #c8ff05; border: 1.5px solid #c8ff05; box-shadow: 0 0 12px rgba(200,255,5,0.3); }
          .badge-actual { background: rgba(10, 16, 24, 0.9); color: #38bdf8; border: 1.5px solid #38bdf8; box-shadow: 0 0 12px rgba(56,189,248,0.3); }
          img { width: 1672px; height: 941px; display: block; object-fit: contain; }
          .divider { position: absolute; left: 1671px; top: 0; bottom: 0; width: 2px; background: #c8ff05; z-index: 100; box-shadow: 0 0 10px #c8ff05; }
        </style>
      </head>
      <body>
        <div class="divider"></div>
        <div class="container">
          <div class="pane">
            <div class="badge badge-approved">Approved Design (1672x941)</div>
            <img src="data:image/png;base64,${approvedB64}" />
          </div>
          <div class="pane">
            <div class="badge badge-actual">Actual Running Frontend (1672x941)</div>
            <img src="data:image/png;base64,${actualB64}" />
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(500);

    const outPath1 = path.join(outputEvidenceDir, comp.outName);
    const outPath2 = path.join(brainDir, 'pilot-01-evidence', comp.outName);
    const outPathPkg = path.join(packageDir, comp.outName);

    await page.screenshot({ path: outPath1 });
    fs.copyFileSync(outPath1, outPath2);
    fs.copyFileSync(outPath1, outPathPkg);
    console.log(`Generated side-by-side: ${comp.outName}`);
  }

  await browser.close();

  // Copy all 8 screenshots into packageDir
  const afterFiles = fs.readdirSync(afterDir);
  for (const f of afterFiles) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(afterDir, f), path.join(packageDir, f));
    }
  }

  // Copy approved designs into packageDir
  fs.copyFileSync(path.join(approvedDir, '01_Command_Center.png'), path.join(packageDir, '01_Command_Center_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '02_Athlete_Directory.png'), path.join(packageDir, '02_Athlete_Directory_APPROVED.png'));

  // Create ZIP using powershell Compress-Archive
  const zipFileRepo = path.join(rootDir, 'SCRIPE_ACADEMY_PILOT01_FINAL_VISUAL_EVIDENCE.zip');
  const zipFileBrain = path.join(brainDir, 'SCRIPE_ACADEMY_PILOT01_FINAL_VISUAL_EVIDENCE.zip');

  if (fs.existsSync(zipFileRepo)) fs.unlinkSync(zipFileRepo);
  if (fs.existsSync(zipFileBrain)) fs.unlinkSync(zipFileBrain);

  console.log('Compressing into zip...');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipFileRepo}' -Force"`);
  fs.copyFileSync(zipFileRepo, zipFileBrain);

  console.log(`ZIP created successfully: ${zipFileRepo} and ${zipFileBrain}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
