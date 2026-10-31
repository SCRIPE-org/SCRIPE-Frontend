const { chromium } = require('@playwright/test');
const path = require('path');

const EVIDENCE_DIR = path.resolve(__dirname, '..', 'e2e-evidence', 'venue-exhaustive');

async function captureRemaining() {
  console.log('=== CAPTURING TARGETED REMAINING MODALS & TABS ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/login?_tenant=AHLY&redirect=%2Fvenue%2Fcalendar');
  await page.waitForSelector('#identifier', { timeout: 20000 });
  await page.locator('#identifier').fill('ahly.admin@scripe-dev.local');
  await page.locator('#password').fill('P@ssw0rd');
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL(url => url.pathname.includes('/venue/calendar'));
  await page.waitForTimeout(2000);

  // 1. Calendar: ClickToBookModal Step 3 (Quote & Confirm)
  console.log('\n--- 1. Capturing Calendar Step 3 (Quote & Confirm) ---');
  const newBookingBtn = page.locator('button:has-text("+ New Booking"), button:has-text("حجز جديد")').first();
  if (await newBookingBtn.isVisible()) {
    await newBookingBtn.click();
    await page.waitForTimeout(1000);

    // Step 1: select daytime time (11:00)
    const timeTrigger = page.locator('#booking-court-time').first();
    if (await timeTrigger.isVisible()) {
      await timeTrigger.click();
      await page.waitForTimeout(400);
      const opt = page.locator('[role="option"]:has-text("11:00"), [data-value="11:00"]').first();
      if (await opt.isVisible()) await opt.click();
      else await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // Click Next to Step 2
    const nextBtn1 = page.locator('[role="dialog"] button:has-text("Next"), [role="dialog"] button:has-text("التالي")').first();
    await nextBtn1.click();
    await page.waitForTimeout(800);

    // In Step 2: Search customer
    const custInput = page.locator('input[placeholder*="Search customer"], input[placeholder*="بحث"]').first();
    await custInput.fill('Farouk');
    await page.waitForTimeout(1000);

    // Click the returned customer item (which auto-advances to Step 3!)
    const custBtn = page.locator('[role="dialog"] div.overflow-y-auto button, [role="dialog"] button:has-text("Farouk")').first();
    if (await custBtn.isVisible()) {
      await custBtn.click();
      console.log('Customer selected! Auto-advanced to Step 3 Quote.');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: path.join(EVIDENCE_DIR, '06e_venue_calendar_new_booking_step3_quote.png') });
      console.log('Saved: 06e_venue_calendar_new_booking_step3_quote.png');
    }

    const closeBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  // 2. Customers: Customer detail / Add Customer Dialog
  console.log('\n--- 2. Capturing Customer Dialog ---');
  await page.goto('http://localhost:3000/venue/customers');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const addCustBtn = page.locator('button:has-text("New Customer"), button:has-text("عميل جديد")').first();
  if (await addCustBtn.isVisible()) {
    await addCustBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '07b_venue_customer_profile_modal.png') });
    console.log('Saved: 07b_venue_customer_profile_modal.png');
    const closeCustBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeCustBtn.isVisible()) await closeCustBtn.click();
  }

  // 3. Facilities: Add Facility Modal
  console.log('\n--- 3. Capturing Facilities Add Modal ---');
  await page.goto('http://localhost:3000/venue/facilities');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const addFacBtn = page.locator('button:has-text("Add"), button:has-text("إضافة")').first();
  if (await addFacBtn.isVisible()) {
    await addFacBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '08b_venue_facility_create_dialog.png') });
    console.log('Saved: 08b_venue_facility_create_dialog.png');
    const closeFacBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeFacBtn.isVisible()) await closeFacBtn.click();
  }

  // 4. Reports: Bookings & Courts tabs
  console.log('\n--- 4. Capturing Reports Tabs ---');
  await page.goto('http://localhost:3000/venue/reports');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const bookingsTab = page.locator('button[value="bookings"]').first();
  if (await bookingsTab.isVisible()) {
    await bookingsTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13b_venue_reports_bookings_tab.png') });
    console.log('Saved: 13b_venue_reports_bookings_tab.png');
  }

  const courtsTab = page.locator('button[value="court-performance"]').first();
  if (await courtsTab.isVisible()) {
    await courtsTab.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '13c_venue_reports_courts_tab.png') });
    console.log('Saved: 13c_venue_reports_courts_tab.png');
  }

  // 5. Sites: Add Site Dialog
  console.log('\n--- 5. Capturing Sites Add Dialog ---');
  await page.goto('http://localhost:3000/venue/sites');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const addSiteBtn = page.locator('button:has-text("Add"), button:has-text("إضافة")').first();
  if (await addSiteBtn.isVisible()) {
    await addSiteBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '19b_venue_site_create_dialog.png') });
    console.log('Saved: 19b_venue_site_create_dialog.png');
    const closeSiteBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeSiteBtn.isVisible()) await closeSiteBtn.click();
  }

  await browser.close();
  console.log('=== TARGETED REMAINING CAPTURES COMPLETE ===');
}

captureRemaining().catch(err => {
  console.error('Targeted capture error:', err);
  process.exit(1);
});
