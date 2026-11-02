const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.resolve(__dirname, '..', 'e2e-evidence', 'venue-exhaustive');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const auditLog = {
  timestamp: new Date().toISOString(),
  tenant: 'AHLY',
  baseUrl: 'http://localhost:3000',
  pagesAudited: [],
  consoleErrors: [],
  networkFailures: [],
  defectsObserved: []
};

async function runExhaustiveAudit() {
  console.log('=== STARTING EXHAUSTIVE SCRIPE VENUE MODULE AUDIT (FULL RUN) ===');
  console.log(`Evidence Directory: ${EVIDENCE_DIR}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US'
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      console.error(`[BROWSER ERROR] ${text}`);
      auditLog.consoleErrors.push({ url: page.url(), message: text });
    }
  });

  page.on('requestfailed', req => {
    const failure = req.failure();
    const url = req.url();
    if (!url.includes('_vercel') && !url.includes('google-analytics')) {
      console.warn(`[REQUEST FAILED] ${url} - ${failure?.errorText}`);
      auditLog.networkFailures.push({ url, error: failure?.errorText });
    }
  });

  async function takeScreenshot(name) {
    const filePath = path.join(EVIDENCE_DIR, name);
    try {
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`  [Screenshot] Saved: ${name}`);
      return filePath;
    } catch (err) {
      console.error(`  [Screenshot FAILED] ${name}: ${err.message}`);
      return null;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 0. AUTHENTICATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- STEP 0: AUTHENTICATION ---');
  await page.goto('http://localhost:3000/login?_tenant=AHLY&redirect=%2Fvenue%2Fcalendar', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#identifier', { timeout: 20000 });
  await page.locator('#identifier').fill('ahly.admin@scripe-dev.local');
  await page.locator('#password').fill(process.env.E2E_ADMIN_PASSWORD || Buffer.from('UEBzc3cwcmQ=', 'base64').toString('utf-8'));
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL(url => url.pathname.includes('/venue/calendar'), { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  console.log('Successfully authenticated as Ahly Admin! URL:', page.url());

  async function visitRoute(routePath, title) {
    console.log(`\n--- AUDITING: ${title} (${routePath}) ---`);
    const startTime = Date.now();
    const response = await page.goto(`http://localhost:3000${routePath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const status = response ? response.status() : 200;
    const durationMs = Date.now() - startTime;
    const pageTitle = await page.title();
    const isError = await page.locator('text=An unexpected error occurred').isVisible().catch(() => false);
    
    const record = {
      title,
      route: routePath,
      finalUrl: page.url(),
      httpStatus: status,
      pageTitle,
      hasRuntimeError: isError,
      durationMs,
      screenshots: []
    };
    auditLog.pagesAudited.push(record);
    return record;
  }

  // 1. /venue (Overview / Live Dashboard)
  const r1 = await visitRoute('/venue', '1. Venue Overview / Live Dashboard');
  const sc1a = await takeScreenshot('01a_venue_overview_dashboard.png');
  if (sc1a) r1.screenshots.push(sc1a);
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(600);
  const sc1b = await takeScreenshot('01b_venue_overview_dashboard_scrolled.png');
  if (sc1b) r1.screenshots.push(sc1b);
  await page.evaluate(() => window.scrollTo(0, 0));

  // 2. /venue/attention (Attention Queue / Alerts)
  const r2 = await visitRoute('/venue/attention', '2. Venue Attention Queue / Alerts');
  const sc2 = await takeScreenshot('02_venue_attention_center.png');
  if (sc2) r2.screenshots.push(sc2);

  // 3. /venue/availability (Availability Rules & Windows)
  const r3 = await visitRoute('/venue/availability', '3. Availability Rules & Windows');
  const sc3a = await takeScreenshot('03a_venue_availability_find_slots.png');
  if (sc3a) r3.screenshots.push(sc3a);

  const opWindowsTab = page.locator('button[role="tab"]:has-text("Operating Windows"), button[role="tab"]:has-text("فترات التشغيل")').first();
  if (await opWindowsTab.isVisible()) {
    await opWindowsTab.click();
    await page.waitForTimeout(800);
    const sc3b = await takeScreenshot('03b_venue_availability_operating_windows.png');
    if (sc3b) r3.screenshots.push(sc3b);
  }

  // 4. /venue/bookings/new (New booking route / redirect behavior)
  const r4 = await visitRoute('/venue/bookings/new', '4. New Booking Route (Redirect)');
  await page.waitForTimeout(1500);
  const sc4 = await takeScreenshot('04_venue_bookings_new_redirect.png');
  if (sc4) r4.screenshots.push(sc4);
  const closeBtn4 = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
  if (await closeBtn4.isVisible()) {
    await closeBtn4.click();
    await page.waitForTimeout(500);
  }

  // 5. /venue/bookings/[reservationId] (Booking 360 Detail View)
  const reservationId = '8711c875-6c4f-4a4f-a0e7-7af7375db557';
  const r5 = await visitRoute(`/venue/bookings/${reservationId}`, '5. Booking 360 Detail View');
  await page.waitForTimeout(1000);
  const sc5a = await takeScreenshot('05a_venue_booking_360_detail.png');
  if (sc5a) r5.screenshots.push(sc5a);
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(500);
  const sc5b = await takeScreenshot('05b_venue_booking_360_timeline_finance.png');
  if (sc5b) r5.screenshots.push(sc5b);
  await page.evaluate(() => window.scrollTo(0, 0));

  // 6. /venue/calendar (Operations Calendar)
  const r6 = await visitRoute('/venue/calendar', '6. Operations Calendar');
  const sc6a = await takeScreenshot('06a_venue_calendar_grid.png');
  if (sc6a) r6.screenshots.push(sc6a);

  // 6.1 Block Time Modal
  const blockTimeBtn = page.locator('button:has-text("Block Time"), button:has-text("حظر وقت")').first();
  if (await blockTimeBtn.isVisible()) {
    await blockTimeBtn.click();
    await page.waitForTimeout(800);
    const sc6b = await takeScreenshot('06b_venue_calendar_block_time_modal.png');
    if (sc6b) r6.screenshots.push(sc6b);
    const closeBlockBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeBlockBtn.isVisible()) {
      await closeBlockBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 6.2 New Booking Modal (ClickToBookModal) - All Steps
  const newBookingBtn = page.locator('button:has-text("+ New Booking"), button:has-text("حجز جديد")').first();
  if (await newBookingBtn.isVisible()) {
    await newBookingBtn.click();
    await page.waitForTimeout(800);
    const sc6c = await takeScreenshot('06c_venue_calendar_new_booking_step1_court.png');
    if (sc6c) r6.screenshots.push(sc6c);

    // Step 1: Select daytime slot and go Next
    const nextBtn1 = page.locator('[role="dialog"] button:has-text("Next"), [role="dialog"] button:has-text("التالي")').first();
    if (await nextBtn1.isVisible() && await nextBtn1.isEnabled()) {
      await nextBtn1.click();
      await page.waitForTimeout(800);
      const sc6d = await takeScreenshot('06d_venue_calendar_new_booking_step2_customer.png');
      if (sc6d) r6.screenshots.push(sc6d);

      // Search customer Farouk
      const customerInput = page.locator('input[placeholder*="Search customer"], input[placeholder*="بحث"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('Farouk');
        await page.waitForTimeout(600);
        const customerOption = page.locator('[role="dialog"] button:has-text("Farouk"), [role="dialog"] div:has-text("Farouk")').first();
        if (await customerOption.isVisible()) {
          await customerOption.click();
          await page.waitForTimeout(500);
        }
      }

      // Step 2: Next to Step 3 (Quote & Confirm)
      const nextBtn2 = page.locator('[role="dialog"] button:has-text("Next"), [role="dialog"] button:has-text("التالي")').first();
      if (await nextBtn2.isVisible() && await nextBtn2.isEnabled()) {
        await nextBtn2.click();
        await page.waitForTimeout(800);
        const sc6e = await takeScreenshot('06e_venue_calendar_new_booking_step3_quote.png');
        if (sc6e) r6.screenshots.push(sc6e);
      }
    }

    const closeBookingBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeBookingBtn.isVisible()) {
      await closeBookingBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 7. /venue/customers (Venue Customers directory)
  const r7 = await visitRoute('/venue/customers', '7. Venue Customers Directory');
  const sc7a = await takeScreenshot('07a_venue_customers_directory.png');
  if (sc7a) r7.screenshots.push(sc7a);

  // Click customer profile modal
  const customerRowBtn = page.locator('table tbody tr').first();
  if (await customerRowBtn.isVisible()) {
    await customerRowBtn.click();
    await page.waitForTimeout(1000);
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.isVisible()) {
      const sc7b = await takeScreenshot('07b_venue_customer_profile_modal.png');
      if (sc7b) r7.screenshots.push(sc7b);
      const closeCustModal = dialog.locator('button:has(svg.lucide-x)').first();
      if (await closeCustModal.isVisible()) {
        await closeCustModal.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // 8. /venue/facilities (Facilities registry)
  const r8 = await visitRoute('/venue/facilities', '8. Facilities Registry');
  const sc8a = await takeScreenshot('08a_venue_facilities_list.png');
  if (sc8a) r8.screenshots.push(sc8a);

  // Add Facility Dialog
  const addFacilityBtn = page.locator('button:has-text("Add Facility"), button:has-text("Create Facility"), button:has-text("إضافة مرفق"), button:has-text("+ Add Facility")').first();
  if (await addFacilityBtn.isVisible()) {
    await addFacilityBtn.click();
    await page.waitForTimeout(800);
    const sc8b = await takeScreenshot('08b_venue_facility_create_dialog.png');
    if (sc8b) r8.screenshots.push(sc8b);
    const closeFacBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeFacBtn.isVisible()) {
      await closeFacBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 9. /venue/money (Money Overview)
  const r9 = await visitRoute('/venue/money', '9. Money & Financial Overview');
  const sc9 = await takeScreenshot('09_venue_money_overview.png');
  if (sc9) r9.screenshots.push(sc9);

  // 10. /venue/money/payments (Payments ledger)
  const r10 = await visitRoute('/venue/money/payments', '10. Payments Ledger');
  const sc10 = await takeScreenshot('10_venue_money_payments_ledger.png');
  if (sc10) r10.screenshots.push(sc10);

  // 11. /venue/money/receivables (Receivables ledger)
  const r11 = await visitRoute('/venue/money/receivables', '11. Receivables Ledger');
  const sc11 = await takeScreenshot('11_venue_money_receivables_ledger.png');
  if (sc11) r11.screenshots.push(sc11);

  // 12. /venue/pricing (Commercial pricing configurations)
  const r12 = await visitRoute('/venue/pricing', '12. Resource Pricing & Rate Books');
  const sc12 = await takeScreenshot('12_venue_pricing_rate_cards.png');
  if (sc12) r12.screenshots.push(sc12);

  // 13. /venue/reports (Venue Analytics & Reports)
  const r13 = await visitRoute('/venue/reports', '13. Venue Reports & Analytics');
  const sc13a = await takeScreenshot('13a_venue_reports_revenue_tab.png');
  if (sc13a) r13.screenshots.push(sc13a);

  // Bookings Tab
  const bookingsTab = page.locator('button[role="tab"]:has-text("Bookings"), button[role="tab"]:has-text("الحجوزات")').first();
  if (await bookingsTab.isVisible()) {
    await bookingsTab.click();
    await page.waitForTimeout(600);
    const sc13b = await takeScreenshot('13b_venue_reports_bookings_tab.png');
    if (sc13b) r13.screenshots.push(sc13b);
  }

  // Courts Tab
  const courtsTab = page.locator('button[role="tab"]:has-text("Courts"), button[role="tab"]:has-text("الملاعب")').first();
  if (await courtsTab.isVisible()) {
    await courtsTab.click();
    await page.waitForTimeout(600);
    const sc13c = await takeScreenshot('13c_venue_reports_courts_tab.png');
    if (sc13c) r13.screenshots.push(sc13c);
  }

  // Payments Tab
  const paymentsTab = page.locator('button[role="tab"]:has-text("Payments"), button[role="tab"]:has-text("المدفوعات")').first();
  if (await paymentsTab.isVisible()) {
    await paymentsTab.click();
    await page.waitForTimeout(600);
    const sc13d = await takeScreenshot('13d_venue_reports_payments_tab.png');
    if (sc13d) r13.screenshots.push(sc13d);
  }

  // Import Data Modal
  const importBtn = page.locator('button:has-text("Import Data"), button:has-text("استيراد")').first();
  if (await importBtn.isVisible()) {
    await importBtn.click();
    await page.waitForTimeout(800);
    const sc13e = await takeScreenshot('13e_venue_reports_import_modal.png');
    if (sc13e) r13.screenshots.push(sc13e);
    const closeImportBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeImportBtn.isVisible()) {
      await closeImportBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 14. /venue/resource-builder (Resource Builder hierarchy)
  const r14 = await visitRoute('/venue/resource-builder', '14. Resource Builder Hierarchy');
  const sc14 = await takeScreenshot('14_venue_resource_builder_tree.png');
  if (sc14) r14.screenshots.push(sc14);

  // 15. /venue/resource-profiles (Resource profiles list & configs)
  const r15 = await visitRoute('/venue/resource-profiles', '15. Resource Profiles');
  const sc15 = await takeScreenshot('15_venue_resource_profiles_list.png');
  if (sc15) r15.screenshots.push(sc15);

  // 16. /venue/resources (Resources Workspace: court cards, status filters, + Add Court wizard)
  const r16 = await visitRoute('/venue/resources', '16. Resources Workspace');
  const sc16a = await takeScreenshot('16a_venue_resources_workspace.png');
  if (sc16a) r16.screenshots.push(sc16a);

  // Open + Add Court / Space Wizard
  const addCourtBtn = page.locator('button:has-text("Add Court / Space"), button:has-text("إضافة ملعب / مساحة"), button:has-text("+ Add Court")').first();
  if (await addCourtBtn.isVisible()) {
    await addCourtBtn.click();
    await page.waitForTimeout(800);
    const sc16b = await takeScreenshot('16b_venue_court_setup_wizard_step1.png');
    if (sc16b) r16.screenshots.push(sc16b);

    const nextWizardBtn = page.locator('[role="dialog"] button:has-text("Next: Court Details"), [role="dialog"] button:has-text("Next"), [role="dialog"] button:has-text("التالي")').first();
    if (await nextWizardBtn.isVisible() && await nextWizardBtn.isEnabled()) {
      await nextWizardBtn.click();
      await page.waitForTimeout(800);
      const sc16c = await takeScreenshot('16c_venue_court_setup_wizard_step2.png');
      if (sc16c) r16.screenshots.push(sc16c);
    }

    const closeWizardBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeWizardBtn.isVisible()) {
      await closeWizardBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 17. /venue/resources/[id] (Court Detail page: test all 5 tabs with REAL encrypted court ID)
  // Using active court ID Kf0zqwr8aUDPgtiquuUfHP_ajFSoZiYPiwcsQ5suOQQvagp8Ip9VjgNzswE
  const encryptedCourtId = 'Kf0zqwr8aUDPgtiquuUfHP_ajFSoZiYPiwcsQ5suOQQvagp8Ip9VjgNzswE';
  const r17 = await visitRoute(`/venue/resources/${encryptedCourtId}?tab=general`, '17. Court Detail View (5 Tabs)');
  
  // Tab 1: General
  const sc17a = await takeScreenshot('17a_court_detail_tab_general.png');
  if (sc17a) r17.screenshots.push(sc17a);

  // Tab 2: Working Hours
  const whTab = page.locator('button[role="tab"]:has-text("Working Hours"), button[role="tab"]:has-text("ساعات العمل")').first();
  if (await whTab.isVisible()) {
    await whTab.click();
    await page.waitForTimeout(800);
    const sc17b = await takeScreenshot('17b_court_detail_tab_working_hours.png');
    if (sc17b) r17.screenshots.push(sc17b);
  }

  // Tab 3: Booking Rules
  const brTab = page.locator('button[role="tab"]:has-text("Booking Rules"), button[role="tab"]:has-text("قواعد الحجز")').first();
  if (await brTab.isVisible()) {
    await brTab.click();
    await page.waitForTimeout(800);
    const sc17c = await takeScreenshot('17c_court_detail_tab_booking_rules.png');
    if (sc17c) r17.screenshots.push(sc17c);
  }

  // Tab 4: Pricing
  const prTab = page.locator('button[role="tab"]:has-text("Pricing"), button[role="tab"]:has-text("الأسعار")').first();
  if (await prTab.isVisible()) {
    await prTab.click();
    await page.waitForTimeout(800);
    const sc17d = await takeScreenshot('17d_court_detail_tab_pricing.png');
    if (sc17d) r17.screenshots.push(sc17d);
  }

  // Tab 5: Closures
  const clTab = page.locator('button[role="tab"]:has-text("Closures"), button[role="tab"]:has-text("الإغلاقات")').first();
  if (await clTab.isVisible()) {
    await clTab.click();
    await page.waitForTimeout(800);
    const sc17e = await takeScreenshot('17e_court_detail_tab_closures.png');
    if (sc17e) r17.screenshots.push(sc17e);
  }

  // 18. /venue/settings (Venue Profile & Settings: all tabs)
  const r18 = await visitRoute('/venue/settings', '18. Venue Settings (5 Tabs)');
  
  // Tab 1: Branch
  const sc18a = await takeScreenshot('18a_venue_settings_tab_branch.png');
  if (sc18a) r18.screenshots.push(sc18a);

  // Tab 2: Booking Preferences
  const bookingTab = page.locator('button[role="tab"]:has-text("Booking"), button[role="tab"]:has-text("الحجز")').first();
  if (await bookingTab.isVisible()) {
    await bookingTab.click();
    await page.waitForTimeout(600);
    const sc18b = await takeScreenshot('18b_venue_settings_tab_booking.png');
    if (sc18b) r18.screenshots.push(sc18b);
  }

  // Tab 3: Team
  const teamTab = page.locator('button[role="tab"]:has-text("Team"), button[role="tab"]:has-text("الفريق")').first();
  if (await teamTab.isVisible()) {
    await teamTab.click();
    await page.waitForTimeout(600);
    const sc18c = await takeScreenshot('18c_venue_settings_tab_team.png');
    if (sc18c) r18.screenshots.push(sc18c);
  }

  // Tab 4: Preferences / Localization
  const prefTab = page.locator('button[role="tab"]:has-text("Preferences"), button[role="tab"]:has-text("التفضيلات")').first();
  if (await prefTab.isVisible()) {
    await prefTab.click();
    await page.waitForTimeout(600);
    const sc18d = await takeScreenshot('18d_venue_settings_tab_preferences.png');
    if (sc18d) r18.screenshots.push(sc18d);
  }

  // Tab 5: Advanced
  const advTab = page.locator('button[role="tab"]:has-text("Advanced"), button[role="tab"]:has-text("متقدم")').first();
  if (await advTab.isVisible()) {
    await advTab.click();
    await page.waitForTimeout(600);
    const sc18e = await takeScreenshot('18e_venue_settings_tab_advanced.png');
    if (sc18e) r18.screenshots.push(sc18e);
  }

  // 19. /venue/sites (Sites topology)
  const r19 = await visitRoute('/venue/sites', '19. Sites Topology');
  const sc19a = await takeScreenshot('19a_venue_sites_topology.png');
  if (sc19a) r19.screenshots.push(sc19a);

  // Click Add Site dialog
  const addSiteBtn = page.locator('button:has-text("Add Site"), button:has-text("Create Site"), button:has-text("إضافة موقع"), button:has-text("+ Add Site")').first();
  if (await addSiteBtn.isVisible()) {
    await addSiteBtn.click();
    await page.waitForTimeout(800);
    const sc19b = await takeScreenshot('19b_venue_site_create_dialog.png');
    if (sc19b) r19.screenshots.push(sc19b);
    const closeSiteBtn = page.locator('[role="dialog"] button:has(svg.lucide-x)').first();
    if (await closeSiteBtn.isVisible()) {
      await closeSiteBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 20. /venue/venue-setup (First-time venue setup flow)
  const r20 = await visitRoute('/venue/venue-setup', '20. First-Time Venue Setup Flow');
  const sc20 = await takeScreenshot('20_venue_setup_flow.png');
  if (sc20) r20.screenshots.push(sc20);

  // Write full catalog
  const catalogPath = path.join(EVIDENCE_DIR, 'venue_audit_catalog.json');
  fs.writeFileSync(catalogPath, JSON.stringify(auditLog, null, 2), 'utf8');
  console.log(`\nAudit catalog written to: ${catalogPath}`);

  await browser.close();
  console.log('=== EXHAUSTIVE VENUE AUDIT COMPLETE ===');
}

runExhaustiveAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
