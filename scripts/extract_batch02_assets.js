const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });

  const refDir = 'E:\\SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11\\SCRIPE_Academy_FINAL_Design_Pack\\01_Final_Screens';
  const outDir = 'E:\\Scripe_pro\\SCRIPE-Frontend-academy-s0-s8\\public\\images\\academy';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Extract Program Images from 05_Programs_and_Offerings.png
  {
    const filePath = path.join(refDir, '05_Programs_and_Offerings.png');
    const b64 = fs.readFileSync(filePath).toString('base64');
    await page.setContent(`
      <body style="margin:0; background:#000; overflow:hidden;">
        <canvas id="c" width="1672" height="941"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            const ctx = document.getElementById('c').getContext('2d');
            ctx.drawImage(img, 0, 0);
            window.__READY__ = true;
          };
          img.src = 'data:image/png;base64,${b64}';
        </script>
      </body>
    `);
    await page.waitForFunction(() => window.__READY__ === true);

    // Row 1 cards: y: ~333 to ~570
    // Col 1: x: ~322, width: ~110, height: ~235
    // Let's sample crops for the image part inside each card:
    // Card 1 image: x: 326, y: 340, width: 104, height: 232
    // Card 2 image: x: 770, y: 340, width: 104, height: 232
    // Card 3 image: x: 1215, y: 340, width: 104, height: 232
    // Row 2 cards: y: 593 to 825
    // Card 4 image: x: 326, y: 596, width: 104, height: 232
    // Card 5 image: x: 770, y: 596, width: 104, height: 232
    // Card 6 image: x: 1215, y: 596, width: 104, height: 232

    const programCrops = [
      { name: 'program_football.png', clip: { x: 326, y: 338, width: 104, height: 234 } },
      { name: 'program_swimming.png', clip: { x: 770, y: 338, width: 104, height: 234 } },
      { name: 'program_padel.png', clip: { x: 1214, y: 338, width: 104, height: 234 } },
      { name: 'program_basketball.png', clip: { x: 326, y: 594, width: 104, height: 234 } },
      { name: 'program_gymnastics.png', clip: { x: 770, y: 594, width: 104, height: 234 } },
      { name: 'program_u12_elite.png', clip: { x: 1214, y: 594, width: 104, height: 234 } }
    ];

    for (const crop of programCrops) {
      await page.screenshot({
        path: path.join(outDir, crop.name),
        clip: crop.clip
      });
      console.log(`Extracted: ${crop.name}`);
    }
  }

  // 2. Extract Athlete Avatars from 03_Skill_Trials_and_Evaluations.png
  {
    const filePath = path.join(refDir, '03_Skill_Trials_and_Evaluations.png');
    const b64 = fs.readFileSync(filePath).toString('base64');
    await page.setContent(`
      <body style="margin:0; background:#000; overflow:hidden;">
        <canvas id="c" width="1672" height="941"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            const ctx = document.getElementById('c').getContext('2d');
            ctx.drawImage(img, 0, 0);
            window.__READY__ = true;
          };
          img.src = 'data:image/png;base64,${b64}';
        </script>
      </body>
    `);
    await page.waitForFunction(() => window.__READY__ === true);

    // Big Avatar for Ahmed Essam in right detail panel: x: 1200, y: 196, width: 56, height: 56
    await page.screenshot({
      path: path.join(outDir, 'avatar_ahmed_essam_lg.png'),
      clip: { x: 1195, y: 195, width: 62, height: 62 }
    });
    console.log('Extracted avatar_ahmed_essam_lg.png');

    // Table avatars: x: ~353, y: ~342, width: ~36, height: ~36
    const athleteAvatars = [
      { name: 'avatar_ahmed_essam.png', clip: { x: 350, y: 341, width: 36, height: 36 } },
      { name: 'avatar_lina_mostafa.png', clip: { x: 350, y: 407, width: 36, height: 36 } },
      { name: 'avatar_omar_khaled.png', clip: { x: 350, y: 473, width: 36, height: 36 } },
      { name: 'avatar_youssef_hany.png', clip: { x: 350, y: 539, width: 36, height: 36 } },
      { name: 'avatar_salma_ali.png', clip: { x: 350, y: 605, width: 36, height: 36 } },
      { name: 'avatar_malek_ibrahim.png', clip: { x: 350, y: 671, width: 36, height: 36 } },
      { name: 'avatar_amina_hassan.png', clip: { x: 350, y: 737, width: 36, height: 36 } },
      { name: 'avatar_karim_remy.png', clip: { x: 350, y: 803, width: 36, height: 36 } },
    ];

    for (const crop of athleteAvatars) {
      await page.screenshot({
        path: path.join(outDir, crop.name),
        clip: crop.clip
      });
      console.log(`Extracted: ${crop.name}`);
    }
  }

  // 3. Extract Watermark from 04_Enrollments.png
  {
    const filePath = path.join(refDir, '04_Enrollments.png');
    const b64 = fs.readFileSync(filePath).toString('base64');
    await page.setContent(`
      <body style="margin:0; background:#000; overflow:hidden;">
        <canvas id="c" width="1672" height="941"></canvas>
        <script>
          const img = new Image();
          img.onload = () => {
            const ctx = document.getElementById('c').getContext('2d');
            ctx.drawImage(img, 0, 0);
            window.__READY__ = true;
          };
          img.src = 'data:image/png;base64,${b64}';
        </script>
      </body>
    `);
    await page.waitForFunction(() => window.__READY__ === true);

    await page.screenshot({
      path: path.join(outDir, 'scripe_neon_watermark.png'),
      clip: { x: 1200, y: 60, width: 200, height: 80 }
    });
    console.log('Extracted scripe_neon_watermark.png');
  }

  await browser.close();
  console.log('All assets extracted successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
