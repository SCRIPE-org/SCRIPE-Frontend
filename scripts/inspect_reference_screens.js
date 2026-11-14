const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });

  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Root-academy-s0-s8\\reports\\academy-execution\\batch-02-inspection';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const screens = [
    '03_Skill_Trials_and_Evaluations.png',
    '04_Enrollments.png',
    '05_Programs_and_Offerings.png'
  ];

  for (const s of screens) {
    const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
    const filePath = path.join(refDir, s);
    const b64 = fs.readFileSync(filePath).toString('base64');

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; background:#000; overflow:hidden;">
        <canvas id="c" width="1672" height="941"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            const ctx = document.getElementById('c').getContext('2d');
            ctx.drawImage(img, 0, 0);
            window.__IMAGE_LOADED__ = true;
          };
          img.src = 'data:image/png;base64,${b64}';
        </script>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForFunction(() => window.__IMAGE_LOADED__ === true);

    // Crop Header: x: 300, y: 55, width: 1372, height: 90
    // Crop Metrics: x: 300, y: 145, width: 1372, height: 120
    // Crop Main: x: 300, y: 265, width: 1372, height: 676
    const baseName = s.replace('.png', '');
    
    // Screenshot header
    await page.screenshot({
      path: path.join(outDir, `${baseName}_header.png`),
      clip: { x: 298, y: 55, width: 1374, height: 100 }
    });

    // Screenshot metrics
    await page.screenshot({
      path: path.join(outDir, `${baseName}_metrics.png`),
      clip: { x: 298, y: 140, width: 1374, height: 130 }
    });

    // Screenshot body
    await page.screenshot({
      path: path.join(outDir, `${baseName}_body.png`),
      clip: { x: 298, y: 260, width: 1374, height: 681 }
    });

    await page.close();

    console.log(`Cropped inspection areas for: ${s}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
