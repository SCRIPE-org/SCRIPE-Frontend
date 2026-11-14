const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function main() {
  const rootDir = 'E:\\Scripe_pro';
  const brainDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\555143f1-37eb-4991-af0b-70be4ecc245c';
  const approvedDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const afterDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-evidence\\after';
  const outputEvidenceDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-evidence';
  const brainEvidenceDir = path.join(brainDir, 'batch-02-evidence');
  const packageDir = path.join(rootDir, 'SCRIPE_ACADEMY_BATCH02_PACKAGE');

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
      title: '03_skill_trials',
      approved: path.join(approvedDir, '03_Skill_Trials_and_Evaluations.png'),
      actual: path.join(afterDir, '01_skill_trials_dark_en_desktop.png'),
      outName: 'side_by_side_03_skill_trials.png',
      label: 'Screen 03: Skill Trials & Evaluations'
    },
    {
      title: '04_enrollments',
      approved: path.join(approvedDir, '04_Enrollments.png'),
      actual: path.join(afterDir, '05_enrollments_dark_en_desktop.png'),
      outName: 'side_by_side_04_enrollments.png',
      label: 'Screen 04: Enrollments'
    },
    {
      title: '05_programs',
      approved: path.join(approvedDir, '05_Programs_and_Offerings.png'),
      actual: path.join(afterDir, '09_programs_dark_en_desktop.png'),
      outName: 'side_by_side_05_programs.png',
      label: 'Screen 05: Programs & Offerings'
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
            <div class="badge badge-approved">Approved Final Design — 1672×941</div>
            <img src="data:image/png;base64,${approvedB64}" />
          </div>
          <div class="divider"></div>
          <div class="pane">
            <div class="badge badge-actual">Actual Running Frontend (Dark EN Desktop) — 1672×941</div>
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

  // Copy all 12 screenshots into packageDir
  const afterFiles = fs.readdirSync(afterDir);
  for (const f of afterFiles) {
    if (f.endsWith('.png')) {
      fs.copyFileSync(path.join(afterDir, f), path.join(packageDir, f));
      // Also copy to brainEvidenceDir
      fs.copyFileSync(path.join(afterDir, f), path.join(brainEvidenceDir, f));
    }
  }

  // Copy approved designs into packageDir
  fs.copyFileSync(path.join(approvedDir, '03_Skill_Trials_and_Evaluations.png'), path.join(packageDir, '03_Skill_Trials_and_Evaluations_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '04_Enrollments.png'), path.join(packageDir, '04_Enrollments_APPROVED.png'));
  fs.copyFileSync(path.join(approvedDir, '05_Programs_and_Offerings.png'), path.join(packageDir, '05_Programs_and_Offerings_APPROVED.png'));

  // Create ZIP using powershell Compress-Archive
  const zipFileRepo = path.join(rootDir, 'SCRIPE_ACADEMY_UI_BATCH02_VISUAL_EVIDENCE.zip');
  const zipFileBrain = path.join(brainDir, 'SCRIPE_ACADEMY_UI_BATCH02_VISUAL_EVIDENCE.zip');

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
