const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function main() {
  const rootDir = 'E:\\Scripe_pro';
  const brainDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\555143f1-37eb-4991-af0b-70be4ecc245c';
  const approvedDir = brainDir; // We copied all 5 approved images into brainDir earlier
  const afterDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-03-evidence\\after';
  const baselineDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-03-evidence\\baseline';
  const outputEvidenceDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-03-evidence';
  const brainEvidenceDir = path.join(brainDir, 'batch-03-evidence');
  const packageDir = path.join(rootDir, 'SCRIPE_ACADEMY_BATCH03_PACKAGE');

  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }
  if (!fs.existsSync(brainEvidenceDir)) {
    fs.mkdirSync(brainEvidenceDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 3344, height: 941 } });
  const page = await context.newPage();

  const comparisons = [
    {
      title: '06_groups',
      approved: path.join(approvedDir, '06_Groups_and_Rosters.png'),
      actual: path.join(afterDir, '01_groups_dark_en_desktop.png'),
      outName: 'side_by_side_06_groups.png',
      label: 'Screen 06: Groups & Rosters'
    },
    {
      title: '07_seasons',
      approved: path.join(approvedDir, '07_Academic_Seasons.png'),
      actual: path.join(afterDir, '05_seasons_dark_en_desktop.png'),
      outName: 'side_by_side_07_seasons.png',
      label: 'Screen 07: Academic Seasons'
    },
    {
      title: '08_sessions',
      approved: path.join(approvedDir, '08_Session_Schedule.png'),
      actual: path.join(afterDir, '09_sessions_dark_en_desktop.png'),
      outName: 'side_by_side_08_sessions.png',
      label: 'Screen 08: Session Schedule'
    },
    {
      title: '09_attendance',
      approved: path.join(approvedDir, '09_Session_Attendance.png'),
      actual: path.join(afterDir, '13_attendance_dark_en_desktop.png'),
      outName: 'side_by_side_09_attendance.png',
      label: 'Screen 09: Session Attendance'
    },
    {
      title: '10_fees_receivables',
      approved: path.join(approvedDir, '10_Fees_and_Receivables.png'),
      actual: path.join(afterDir, '17_fees_receivables_dark_en_desktop.png'),
      outName: 'side_by_side_10_fees_receivables.png',
      label: 'Screen 10: Fees & Receivables'
    }
  ];

  for (const comp of comparisons) {
    if (!fs.existsSync(comp.approved)) {
      console.error(`Missing approved image: ${comp.approved}`);
      continue;
    }
    if (!fs.existsSync(comp.actual)) {
      console.error(`Missing actual image: ${comp.actual}`);
      continue;
    }

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
          .pane { position: relative; width: 1672px; height: 941px; overflow: hidden; }
          .pane img { width: 1672px; height: 941px; display: block; object-fit: contain; background: #080a0b; }
          .badge {
            position: absolute;
            top: 14px;
            left: 20px;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 16px rgba(0,0,0,0.85);
            z-index: 100;
          }
          .badge-approved {
            background: #101214;
            color: #c8ff05;
            border: 1.5px solid #c8ff05;
          }
          .badge-actual {
            background: #101214;
            color: #00ffaa;
            border: 1.5px solid #00ffaa;
          }
          .divider {
            width: 2px;
            height: 941px;
            background: #c8ff05;
            box-shadow: 0 0 14px #c8ff05;
            z-index: 101;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="pane">
            <div class="badge badge-approved">Approved Final Design (${comp.label}) — 1672×941</div>
            <img src="data:image/png;base64,${approvedB64}" />
          </div>
          <div class="divider"></div>
          <div class="pane">
            <div class="badge badge-actual">Actual Running Frontend (${comp.label} Dark EN Desktop) — 1672×941</div>
            <img src="data:image/png;base64,${actualB64}" />
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(600);

    const outPath1 = path.join(outputEvidenceDir, comp.outName);
    const outPath2 = path.join(brainEvidenceDir, comp.outName);
    const outPathPkg = path.join(packageDir, comp.outName);

    await page.screenshot({ path: outPath1 });
    fs.copyFileSync(outPath1, outPath2);
    fs.copyFileSync(outPath1, outPathPkg);
    console.log(`Generated side-by-side: ${comp.outName}`);
  }

  await browser.close();

  // Copy all 20 after screenshots into packageDir and brainEvidenceDir
  const afterFiles = fs.readdirSync(afterDir);
  for (const f of afterFiles) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(afterDir, f), path.join(packageDir, f));
      fs.copyFileSync(path.join(afterDir, f), path.join(brainEvidenceDir, f));
    }
  }

  // Copy baseline screenshots into packageDir
  if (fs.existsSync(baselineDir)) {
    const baselineFiles = fs.readdirSync(baselineDir);
    for (const f of baselineFiles) {
      if (f.endsWith('.png')) {
        fs.copyFileSync(path.join(baselineDir, f), path.join(packageDir, f));
      }
    }
  }

  // Copy approved designs into packageDir
  fs.copyFileSync(path.join(approvedDir, '06_Groups_and_Rosters.png'), path.join(packageDir, '06_Groups_and_Rosters_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '07_Academic_Seasons.png'), path.join(packageDir, '07_Academic_Seasons_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '08_Session_Schedule.png'), path.join(packageDir, '08_Session_Schedule_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '09_Session_Attendance.png'), path.join(packageDir, '09_Session_Attendance_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '10_Fees_and_Receivables.png'), path.join(packageDir, '10_Fees_and_Receivables_APPROVED.png'));

  // Create ZIP using powershell Compress-Archive
  const zipFileRepo = path.join(rootDir, 'SCRIPE_ACADEMY_UI_BATCH03_FINAL_EVIDENCE.zip');
  const zipFileBrain = path.join(brainDir, 'SCRIPE_ACADEMY_UI_BATCH03_FINAL_EVIDENCE.zip');

  if (fs.existsSync(zipFileRepo)) fs.unlinkSync(zipFileRepo);
  if (fs.existsSync(zipFileBrain)) fs.unlinkSync(zipFileBrain);

  console.log('Compressing Batch 03 evidence into zip...');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipFileRepo}' -Force"`);
  fs.copyFileSync(zipFileRepo, zipFileBrain);

  console.log(`ZIP created successfully: ${zipFileRepo} and ${zipFileBrain}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
