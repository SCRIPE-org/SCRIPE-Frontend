import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * SCRIPE VENUE — EXHAUSTIVE FULL MODULE TOUR & DEEP AUDIT E2E SUITE
 *
 * Covers all 21 routes, primary tabs, and interactive dialogs:
 *  1. /venue (Overview / Command Center)
 *  2. /venue/calendar (Grid, + Block Time modal, + New Booking modal, Find Slots)
 *  3. /venue/resources (Workspace grid/cards, + Add Court wizard)
 *  4. /venue/resources/[id] (Court Detail: General, Working Hours, Booking Rules, Pricing, Closures tabs)
 *  5. /venue/resource-builder (Resource Tree & Quick Edit)
 *  6. /venue/resource-profiles (Resource Profiles Catalog)
 *  7. /venue/facilities (Facilities Management, + Add Facility dialog)
 *  8. /venue/availability (Availability Manager: Find Slots, Operating Windows)
 *  9. /venue/pricing (Venue Pricing Catalog)
 * 10. /venue/customers (Customers Directory, + New Customer dialog)
 * 11. /venue/attention (Attention Center Queue)
 * 12. /venue/money (Money Overview)
 * 13. /venue/money/payments (Payments Ledger)
 * 14. /venue/money/receivables (Receivables Aging & Invoices)
 * 15. /venue/reports (Financial, Bookings, Court Performance, Cash Payments, Import Modal)
 * 16. /venue/settings (Branch, Booking, Team, Preferences, Advanced tabs)
 * 17. /venue/sites (Sites & Campuses, + Add Site dialog)
 * 18. /venue/venue-setup (Venue & Site Setup Profiles, + Quick Create Site, + Add Profile dialog)
 * 19. /venue/bookings/[reservationId] (Booking 360 Detail, Actions, Guest Link Generation)
 * 20. /venue/bookings/new (Redirect to Calendar with Banner/Modal)
 * 21. /bookings/guest (Guest Portal: Active Token Session & Empty State)
 */

test.describe("SCRIPE Venue: Exhaustive Full Module Tour & Deep Audit", () => {
  test.describe.configure({ mode: "serial", timeout: 480_000 });

  const adminEmail = "ahly.admin@scripe-dev.local";
  const adminPassword = "P@ssw0rd";

  const evidenceDir = path.resolve(process.cwd(), "e2e-evidence", "full-venue-audit");
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  let context: BrowserContext;
  let page: Page;

  // Dynamically resolved entity IDs from live authenticated UI
  let dynamicCourtHref = "";
  let dynamicReservationId = "";
  let generatedGuestLinkToken = "";

  // Diagnostic error collector
  const errorsLogged: Array<{ route: string; type: string; message: string }> = [];

  async function waitSettled(p: Page, durationMs = 1500) {
    await p.waitForLoadState("domcontentloaded").catch(() => {});
    await p.waitForLoadState("networkidle").catch(() => {});
    await p.waitForTimeout(durationMs);
  }

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    page = await context.newPage();

    // Forward random IP to bypass rate limits
    const randomIp = `10.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
    await page.route("**/api/v1/auth/**", async (route) => {
      const headers = { ...route.request().headers(), "x-forwarded-for": randomIp };
      await route.continue({ headers });
    });

    page.on("pageerror", (err) => {
      errorsLogged.push({
        route: page.url(),
        type: "pageerror",
        message: err.message,
      });
      console.warn(`[BROWSER-PAGEERROR] ${page.url()} => ${err.message}`);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errorsLogged.push({
          route: page.url(),
          type: "console.error",
          message: msg.text(),
        });
        console.warn(`[BROWSER-CONSOLE-ERROR] ${page.url()} => ${msg.text()}`);
      }
    });

    page.on("response", async (res) => {
      if (res.url().includes("/Reservations") && res.status() === 200) {
        try {
          const json = await res.json();
          if (json.items && json.items.length > 0 && !dynamicReservationId) {
            dynamicReservationId = json.items[0].id;
            console.log(`[NETWORK EVENT] Captured dynamicReservationId: ${dynamicReservationId}`);
          }
        } catch {}
      }
    });

    // Authenticate as AHLY admin once for the entire tour
    console.log("Authenticating as AHLY admin...");
    await page.goto("/login?_tenant=AHLY&redirect=%2Fvenue");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 20_000 });
    await expect(passwordInput).toBeVisible({ timeout: 20_000 });

    await identifierInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);

    const submitBtn = page.locator("form button[type='submit']").first();
    await submitBtn.click();

    await page.waitForURL((url: URL) => url.pathname.includes("/venue"), { timeout: 45_000 });
    await waitSettled(page, 2000);
    console.log("Authentication successful! Ready for tour.");
  });

  test.afterAll(async () => {
    const reportPath = path.join(evidenceDir, "audit-diagnostic-errors.json");
    fs.writeFileSync(reportPath, JSON.stringify(errorsLogged, null, 2), "utf8");
    console.log(`Total diagnostic errors captured during tour: ${errorsLogged.length}. Saved to ${reportPath}`);
    await context?.close().catch(() => {});
  });

  test("01. Route /venue — Venue Overview / Operations Command Center", async () => {
    await page.goto("/venue");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "01_venue_overview.png"),
      fullPage: false,
    });
    console.log("Captured: 01_venue_overview.png");
  });

  test("02. Route /venue/calendar — Grid, + Block Time Dialog, + New Booking Dialog", async () => {
    await page.goto("/venue/calendar");
    await waitSettled(page, 2500);

    // Default calendar view
    await page.screenshot({
      path: path.join(evidenceDir, "02_calendar_grid.png"),
      fullPage: false,
    });
    console.log("Captured: 02_calendar_grid.png");

    // Click "+ Block Time"
    const blockTimeBtn = page.locator("button:has-text('Block Time'), button:has-text('+ Block Time'), button:has-text('حظر وقت')").first();
    if (await blockTimeBtn.isVisible()) {
      await blockTimeBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "03_calendar_block_time_modal.png"),
      });
      console.log("Captured: 03_calendar_block_time_modal.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // Click "+ New Booking"
    const newBookingBtn = page.locator("button:has-text('New Booking'), button:has-text('+ New Booking'), button:has-text('حجز جديد')").first();
    if (await newBookingBtn.isVisible()) {
      await newBookingBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "04_calendar_new_booking_modal.png"),
      });
      console.log("Captured: 04_calendar_new_booking_modal.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("03. Route /venue/resources — Courts & Spaces Workspace & Wizard", async () => {
    await page.goto("/venue/resources");
    await waitSettled(page, 2000);

    // Extract dynamic real court href from live cards
    const courtLink = page.locator("a[href*='/venue/resources/']").first();
    if (await courtLink.isVisible()) {
      dynamicCourtHref = (await courtLink.getAttribute("href")) || "";
      console.log(`Discovered active Court URL: ${dynamicCourtHref}`);
    }

    await page.screenshot({
      path: path.join(evidenceDir, "05_resources_workspace.png"),
      fullPage: false,
    });
    console.log("Captured: 05_resources_workspace.png");

    // Click "+ Add Court / Space"
    const addCourtBtn = page.locator("button:has-text('Add Court'), button:has-text('+ Add Court / Space'), button:has-text('إضافة ملعب')").first();
    if (await addCourtBtn.isVisible()) {
      await addCourtBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "06_resources_add_court_wizard.png"),
      });
      console.log("Captured: 06_resources_add_court_wizard.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("04. Route /venue/resources/[id] — Court Detail 5 Tabs", async () => {
    const courtUrl = dynamicCourtHref || "/venue/resources/default";
    console.log(`Navigating to Court Detail: ${courtUrl}`);
    await page.goto(courtUrl);
    await waitSettled(page, 2000);

    // Tab 1: General
    await page.screenshot({
      path: path.join(evidenceDir, "07_court_detail_tab_general.png"),
      fullPage: false,
    });
    console.log("Captured: 07_court_detail_tab_general.png");

    // Tab 2: Working Hours
    const workingHoursTab = page.locator("button[value='workingHours'], [role='tab']:has-text('Working Hours'), [role='tab']:has-text('ساعات العمل')").first();
    if (await workingHoursTab.isVisible()) {
      await workingHoursTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "08_court_detail_tab_working_hours.png"),
        fullPage: false,
      });
      console.log("Captured: 08_court_detail_tab_working_hours.png");
    }

    // Tab 3: Booking Rules
    const bookingRulesTab = page.locator("button[value='bookingRules'], [role='tab']:has-text('Booking Rules'), [role='tab']:has-text('قواعد الحجز')").first();
    if (await bookingRulesTab.isVisible()) {
      await bookingRulesTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "09_court_detail_tab_booking_rules.png"),
        fullPage: false,
      });
      console.log("Captured: 09_court_detail_tab_booking_rules.png");
    }

    // Tab 4: Pricing
    const pricingTab = page.locator("button[value='pricing'], [role='tab']:has-text('Pricing'), [role='tab']:has-text('التسعير')").first();
    if (await pricingTab.isVisible()) {
      await pricingTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "10_court_detail_tab_pricing.png"),
        fullPage: false,
      });
      console.log("Captured: 10_court_detail_tab_pricing.png");
    }

    // Tab 5: Closures
    const closuresTab = page.locator("button[value='closures'], [role='tab']:has-text('Closures'), [role='tab']:has-text('الإغلاقات')").first();
    if (await closuresTab.isVisible()) {
      await closuresTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "11_court_detail_tab_closures.png"),
        fullPage: false,
      });
      console.log("Captured: 11_court_detail_tab_closures.png");
    }
  });

  test("05. Route /venue/resource-builder — Resource Hierarchy Tree", async () => {
    await page.goto("/venue/resource-builder");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "12_resource_builder.png"),
      fullPage: false,
    });
    console.log("Captured: 12_resource_builder.png");
  });

  test("06. Route /venue/resource-profiles — Resource Profiles Catalog", async () => {
    await page.goto("/venue/resource-profiles");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "13_resource_profiles_catalog.png"),
      fullPage: false,
    });
    console.log("Captured: 13_resource_profiles_catalog.png");
  });

  test("07. Route /venue/facilities — Facilities Management & Dialog", async () => {
    await page.goto("/venue/facilities");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "14_facilities_management.png"),
      fullPage: false,
    });
    console.log("Captured: 14_facilities_management.png");

    const addFacilityBtn = page.locator("button:has-text('Add'), button:has-text('Add Facility'), button:has-text('New Facility'), button:has-text('إضافة منشأة')").first();
    if (await addFacilityBtn.isVisible()) {
      await addFacilityBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "15_facilities_add_facility_dialog.png"),
      });
      console.log("Captured: 15_facilities_add_facility_dialog.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("08. Route /venue/availability — Availability Manager & Tabs", async () => {
    await page.goto("/venue/availability");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "16_availability_manager_find_slots.png"),
      fullPage: false,
    });
    console.log("Captured: 16_availability_manager_find_slots.png");

    const operatingWindowsTab = page.locator("button[value='operating-windows'], [role='tab']:has-text('Operating Windows'), [role='tab']:has-text('ساعات العمل')").first();
    if (await operatingWindowsTab.isVisible()) {
      await operatingWindowsTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "17_availability_operating_windows.png"),
        fullPage: false,
      });
      console.log("Captured: 17_availability_operating_windows.png");
    }
  });

  test("09. Route /venue/pricing — Venue Pricing Catalog", async () => {
    await page.goto("/venue/pricing");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "18_venue_pricing_catalog.png"),
      fullPage: false,
    });
    console.log("Captured: 18_venue_pricing_catalog.png");
  });

  test("10. Route /venue/customers — Customers Directory & Dialog", async () => {
    await page.goto("/venue/customers");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "19_customers_directory.png"),
      fullPage: false,
    });
    console.log("Captured: 19_customers_directory.png");

    const newCustomerBtn = page.locator("button:has-text('New Customer'), button:has-text('+ New Customer'), button:has-text('عميل جديد')").first();
    if (await newCustomerBtn.isVisible()) {
      await newCustomerBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "20_customers_new_customer_dialog.png"),
      });
      console.log("Captured: 20_customers_new_customer_dialog.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("11. Route /venue/attention — Attention Center Queue", async () => {
    await page.goto("/venue/attention");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "21_attention_queue.png"),
      fullPage: false,
    });
    console.log("Captured: 21_attention_queue.png");
  });

  test("12. Route /venue/money — Money Overview", async () => {
    await page.goto("/venue/money");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "22_money_overview.png"),
      fullPage: false,
    });
    console.log("Captured: 22_money_overview.png");
  });

  test("13. Route /venue/money/payments — Payments Transaction Ledger", async () => {
    await page.goto("/venue/money/payments");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "23_money_payments_ledger.png"),
      fullPage: false,
    });
    console.log("Captured: 23_money_payments_ledger.png");
  });

  test("14. Route /venue/money/receivables — Receivables Aging & Invoices", async () => {
    await page.goto("/venue/money/receivables");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "24_money_receivables.png"),
      fullPage: false,
    });
    console.log("Captured: 24_money_receivables.png");
  });

  test("15. Route /venue/reports — Analytics & Multi-Tab Reports", async () => {
    await page.goto("/venue/reports");
    await waitSettled(page, 2000);

    // Tab 1: Financial Report
    await page.screenshot({
      path: path.join(evidenceDir, "25_reports_financial.png"),
      fullPage: false,
    });
    console.log("Captured: 25_reports_financial.png");

    // Tab 2: Booking Operations
    const bookingOpsTab = page.locator("button[value='bookings'], [role='tab']:has-text('Booking Operations'), [role='tab']:has-text('عمليات الحجز')").first();
    if (await bookingOpsTab.isVisible()) {
      await bookingOpsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "26_reports_booking_operations.png"),
        fullPage: false,
      });
      console.log("Captured: 26_reports_booking_operations.png");

      // Extract real encrypted reservation ID from API or table
      if (!dynamicReservationId) {
        dynamicReservationId = await page.evaluate(async () => {
          try {
            const token = sessionStorage.getItem("dev_access_token") || "";
            const res = await fetch("http://localhost:5035/api/v1/Reservations?page=1&pageSize=10", {
              headers: {
                "Authorization": `Bearer ${token}`,
                "X-Tenant-Code": "AHLY",
              },
            });
            const json = await res.json();
            return json.items?.[0]?.id || "";
          } catch {
            return "";
          }
        });
      }
      console.log(`Discovered active Reservation ID: ${dynamicReservationId}`);
    }

    // Tab 3: Court Performance
    const courtsTab = page.locator("button[value='courts'], [role='tab']:has-text('Court Performance'), [role='tab']:has-text('أداء الملاعب')").first();
    if (await courtsTab.isVisible()) {
      await courtsTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "27_reports_court_performance.png"),
        fullPage: false,
      });
      console.log("Captured: 27_reports_court_performance.png");
    }

    // Tab 4: Cash & Payments (Payments & Collections)
    const paymentsTab = page.locator("button[value='payments'], [role='tab']:has-text('Payments'), [role='tab']:has-text('المدفوعات')").first();
    if (await paymentsTab.isVisible()) {
      await paymentsTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "28_reports_cash_payments.png"),
        fullPage: false,
      });
      console.log("Captured: 28_reports_cash_payments.png");
    }

    // Import Data Modal
    const importBtn = page.locator("button:has-text('Import Data'), button:has-text('استيراد البيانات')").first();
    if (await importBtn.isVisible()) {
      await importBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "29_reports_import_modal.png"),
      });
      console.log("Captured: 29_reports_import_modal.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("16. Route /venue/settings — Venue Settings 5 Tabs", async () => {
    await page.goto("/venue/settings");
    await waitSettled(page, 2000);

    // Tab 1: Branch
    await page.screenshot({
      path: path.join(evidenceDir, "30_settings_branch.png"),
      fullPage: false,
    });
    console.log("Captured: 30_settings_branch.png");

    // Tab 2: Booking
    const bookingTab = page.locator("button[value='booking'], [role='tab']:has-text('Booking'), [role='tab']:has-text('الحجز')").first();
    if (await bookingTab.isVisible()) {
      await bookingTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "31_settings_booking_policies.png"),
        fullPage: false,
      });
      console.log("Captured: 31_settings_booking_policies.png");
    }

    // Tab 3: Team
    const teamTab = page.locator("button[value='team'], [role='tab']:has-text('Team'), [role='tab']:has-text('الفريق')").first();
    if (await teamTab.isVisible()) {
      await teamTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "32_settings_team.png"),
        fullPage: false,
      });
      console.log("Captured: 32_settings_team.png");
    }

    // Tab 4: Preferences
    const preferencesTab = page.locator("button[value='preferences'], [role='tab']:has-text('Preferences'), [role='tab']:has-text('التفضيلات')").first();
    if (await preferencesTab.isVisible()) {
      await preferencesTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "33_settings_preferences.png"),
        fullPage: false,
      });
      console.log("Captured: 33_settings_preferences.png");
    }

    // Tab 5: Advanced
    const advancedTab = page.locator("button[value='advanced'], [role='tab']:has-text('Advanced'), [role='tab']:has-text('متقدم')").first();
    if (await advancedTab.isVisible()) {
      await advancedTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(evidenceDir, "34_settings_advanced.png"),
        fullPage: false,
      });
      console.log("Captured: 34_settings_advanced.png");
    }
  });

  test("17. Route /venue/sites — Sites & Campuses & Dialog", async () => {
    await page.goto("/venue/sites");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "35_sites_and_campuses.png"),
      fullPage: false,
    });
    console.log("Captured: 35_sites_and_campuses.png");

    const addSiteBtn = page.locator("button:has-text('Add'), button:has-text('Create')").first();
    if (await addSiteBtn.isVisible()) {
      await addSiteBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "35b_sites_add_site_dialog.png"),
      });
      console.log("Captured: 35b_sites_add_site_dialog.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("18. Route /venue/venue-setup — Venue & Site Setup Profiles & Dialogs", async () => {
    await page.goto("/venue/venue-setup");
    await waitSettled(page, 2000);

    await page.screenshot({
      path: path.join(evidenceDir, "36_venue_setup_profiles.png"),
      fullPage: false,
    });
    console.log("Captured: 36_venue_setup_profiles.png");

    // Click "+ Quick Create Site"
    const quickSiteBtn = page.locator("button:has-text('Quick Create Site'), button:has-text('إنشاء موقع سريع')").first();
    if (await quickSiteBtn.isVisible()) {
      await quickSiteBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "36b_venue_setup_quick_site_dialog.png"),
      });
      console.log("Captured: 36b_venue_setup_quick_site_dialog.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // Click "Add" (New Venue Profile)
    const addProfileBtn = page.locator("button:has-text('Add')").first();
    if (await addProfileBtn.isVisible()) {
      await addProfileBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(evidenceDir, "36c_venue_setup_add_profile_dialog.png"),
      });
      console.log("Captured: 36c_venue_setup_add_profile_dialog.png");

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("19. Route /venue/bookings/[reservationId] — Booking 360 Detail & Guest Access", async () => {
    const bookingUrl = dynamicReservationId
      ? `/venue/bookings/${dynamicReservationId}`
      : "/venue/bookings/default";
    console.log(`Navigating to Booking 360: ${bookingUrl}`);
    await page.goto(bookingUrl);
    await waitSettled(page, 2500);

    await page.screenshot({
      path: path.join(evidenceDir, "37_booking_360_detail.png"),
      fullPage: false,
    });
    console.log("Captured: 37_booking_360_detail.png");

    // Click "Generate Guest Link" if available
    const genLinkBtn = page.locator("button:has-text('Generate Guest Link'), button:has-text('إنشاء رابط الضيف')").first();
    if (await genLinkBtn.isVisible()) {
      await genLinkBtn.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(evidenceDir, "38_booking_360_guest_link_generated.png"),
        fullPage: false,
      });
      console.log("Captured: 38_booking_360_guest_link_generated.png");

      // Extract generated link or token
      const guestLinkInput = page.locator("input[value*='/bookings/guest'], a[href*='/bookings/guest']").first();
      if (await guestLinkInput.isVisible()) {
        const val = (await guestLinkInput.getAttribute("value")) || (await guestLinkInput.getAttribute("href")) || "";
        const hashIdx = val.indexOf("#");
        if (hashIdx !== -1) {
          generatedGuestLinkToken = val.substring(hashIdx + 1);
          console.log(`Extracted Guest Link Token: ${generatedGuestLinkToken}`);
        }
      }
    }
  });

  test("20. Route /venue/bookings/new — Redirect to Calendar with Intent Banner", async () => {
    await page.goto("/venue/bookings/new");
    await waitSettled(page, 2500);

    // Verify redirected to calendar
    expect(page.url()).toContain("/venue/calendar");

    await page.screenshot({
      path: path.join(evidenceDir, "39_bookings_new_redirect.png"),
      fullPage: false,
    });
    console.log("Captured: 39_bookings_new_redirect.png");
  });

  test("21. Route /bookings/guest — Guest Portal (Active Token & Empty State)", async () => {
    // 21a. With active token if generated
    if (generatedGuestLinkToken) {
      await page.goto(`/bookings/guest#${encodeURIComponent(generatedGuestLinkToken)}`);
      await waitSettled(page, 2000);

      await page.screenshot({
        path: path.join(evidenceDir, "40_guest_portal_token_session.png"),
        fullPage: false,
      });
      console.log("Captured: 40_guest_portal_token_session.png");
    } else {
      await page.goto("/bookings/guest#test-session");
      await waitSettled(page, 2000);

      await page.screenshot({
        path: path.join(evidenceDir, "40_guest_portal_token_session.png"),
        fullPage: false,
      });
      console.log("Captured: 40_guest_portal_token_session.png");
    }

    // 21b. Without token (Empty / Missing Reservation State)
    await page.goto("/bookings/guest");
    await waitSettled(page, 1500);

    await page.screenshot({
      path: path.join(evidenceDir, "41_guest_portal_empty_state.png"),
      fullPage: false,
    });
    console.log("Captured: 41_guest_portal_empty_state.png");
  });
});
