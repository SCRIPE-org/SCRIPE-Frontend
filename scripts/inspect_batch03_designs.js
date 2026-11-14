const fs = require('fs');
const path = require('path');

const refDir = 'e:/SCRIPE_Academy_FINAL_20_SCREENS_2026-11-11/SCRIPE_Academy_FINAL_Design_Pack/01_Final_Screens';

const screens = [
  '06_Groups_and_Rosters.png',
  '07_Academic_Seasons.png',
  '08_Session_Schedule.png',
  '09_Session_Attendance.png',
  '10_Fees_and_Receivables.png',
];

screens.forEach(s => {
  const p = path.join(refDir, s);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`Found: ${s} (${stat.size} bytes)`);
  } else {
    console.log(`Missing: ${s}`);
  }
});
