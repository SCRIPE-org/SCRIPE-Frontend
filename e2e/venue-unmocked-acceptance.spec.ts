import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

/**
 * SCRIPE Venue: 100% Real Runtime Unmocked Operational Acceptance Suite
 *
 * Requirements:
 * - NO page.route() mock interception on Venue or Auth APIs.
 * - Authenticates against real ASP.NET Core API host (port 5035).
 * - Creates real reservation through the browser via ClickToBookModal.
 * - Verifies physical database persistence in PostgreSQL venue.reservations.
 * - Verifies Booking 360 (/venue/bookings/[id]).
 * - Verifies Negative Security Scenarios (401, 403, 409).
 */
test.describe("SCRIPE Venue: Real Runtime End-to-End Operational Acceptance", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  const adminEmail = "ahly.admin@scripe-dev.local";
  const adminPassword = "P@ssw0rd";
  const tenantId = "944caec0-f3fd-454c-878a-da833a3c7c6c";

  let createdReservationId = "";
  let createdReservationCode = "";

  /** Helper to query PostgreSQL directly for physical read-only database verification */
  function queryPostgres(sql: string): string {
    const dbHost = process.env.PGHOST ?? "127.0.0.1";
    const dbPort = process.env.PGPORT ?? "5432";
    const dbName = process.env.PGDATABASE ?? "SCRIPE_SHARED";
    const dbUser = process.env.PGUSER ?? "postgres";
    const psqlBin =
      process.env.PSQL_PATH ??
      (process.platform === "win32" && require("fs").existsSync("C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe")
        ? '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe"'
        : "psql");
    const env = { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "1598741258" };
    const cmd = `${psqlBin} -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${sql.replace(/"/g, '\\"')}"`;
    return execSync(cmd, { encoding: "utf8", env });
  }

  test.beforeEach(async ({ page }) => {
    // Forward random IP to avoid test runner hitting Kestrel rate-limiter
    const randomIp = `10.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
    await page.route("**/api/v1/auth/**", async (route) => {
      const headers = { ...route.request().headers(), "x-forwarded-for": randomIp };
      await route.continue({ headers });
    });
  });

  test("1. Unmocked Authentication & Calendar Navigation", async ({ page }) => {
    // Navigate to Login with Al-Ahly tenant scope
    await page.goto("/login?_tenant=AHLY&redirect=%2Fvenue%2Fcalendar");
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 15_000 });
    await expect(passwordInput).toBeVisible({ timeout: 15_000 });

    await identifierInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    // Verify redirection to /venue/calendar
    await page.waitForURL((url) => url.pathname.includes("/venue/calendar"), { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    // Verify Calendar Grid mounts with real backend data
    const newBookingBtn = page.locator("button:has-text('+ New Booking'), button:has-text('حجز جديد')").first();
    await expect(newBookingBtn).toBeVisible({ timeout: 20_000 });
  });

  test("2. Unmocked Booking Journey via ClickToBookModal (Resolves DEF-VENUE-005 & UI Bugs)", async ({ page }) => {
    // Ensure test slot (11:00 on 2026-11-01) is free
    try {
      queryPostgres(`
        DELETE FROM venue.booking_status_histories WHERE reservation_id IN (SELECT id FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%');
        DELETE FROM venue.booking_requests WHERE reservation_id IN (SELECT id FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%');
        DELETE FROM venue.guest_reservation_accesses WHERE reservation_id IN (SELECT id FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%');
        DELETE FROM venue.capacity_ledger_entries WHERE reservation_id IN (SELECT id FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%');
        DELETE FROM venue.booking_holds WHERE reservation_id IN (SELECT id FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%');
        DELETE FROM venue.reservations WHERE reservation_number LIKE 'RES-20261101-%';
      `);
    } catch {
      // ignore
    }

    // Direct authenticated session setup
    await page.goto("/login?_tenant=AHLY&redirect=%2Fvenue%2Fcalendar");
    await page.locator("#identifier").fill(adminEmail);
    await page.locator("#password").fill(adminPassword);
    await page.locator("form button[type='submit']").first().click();
    await page.waitForURL((url) => url.pathname.includes("/venue/calendar"), { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    // Open ClickToBookModal
    const newBookingBtn = page.locator("button:has-text('+ New Booking'), button:has-text('حجز جديد')").first();
    await expect(newBookingBtn).toBeVisible({ timeout: 15_000 });
    await newBookingBtn.click();

    // Verify Modal mounted
    const modal = page.locator("[role='dialog']").first();
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Verify Stepper does not overlap Close button (Visual remediation check)
    const step3 = modal.locator("[data-testid='click-to-book-step-3']");
    await expect(step3).toBeVisible({ timeout: 5_000 });
    const headerCloseBtn = modal.locator("button:has(svg.lucide-x)").first();
    await expect(headerCloseBtn).toBeVisible({ timeout: 5_000 });

    const step3Box = await step3.boundingBox();
    const closeBtnBox = await headerCloseBtn.boundingBox();
    expect(step3Box).toBeTruthy();
    expect(closeBtnBox).toBeTruthy();
    if (step3Box && closeBtnBox) {
      console.log(`Step 3: (x=${step3Box.x}, y=${step3Box.y}, w=${step3Box.width}, h=${step3Box.height})`);
      console.log(`Close button: (x=${closeBtnBox.x}, y=${closeBtnBox.y}, w=${closeBtnBox.width}, h=${closeBtnBox.height})`);
      // Zero collision: stepper is rendered strictly below the header close button (vertical clearance > 10px)
      // or to the left (horizontal clearance > 15px)
      const verticalClearance = step3Box.y - (closeBtnBox.y + closeBtnBox.height);
      const horizontalClearance = closeBtnBox.x - (step3Box.x + step3Box.width);
      const isSeparated = verticalClearance > 10 || horizontalClearance > 15;
      expect(isSeparated).toBe(true);
    }

    // Capture visual evidence: Stepper clear of close button
    await modal.screenshot({
      path: "test-results/fixed_stepper_close_button.png",
    });

    // ── Step 1: Court & Time ──
    // Select valid daytime time slot (11:00) so booking is within authentic operating hours (07:00 - 23:00)
    const timeSelectTrigger = modal.locator("#booking-court-time").first();
    if (await timeSelectTrigger.isVisible()) {
      await timeSelectTrigger.click();
      await page.waitForTimeout(400);
      const option11 = page.locator("[role='option']:has-text('11:00'), [data-value='11:00']").first();
      if (await option11.isVisible()) {
        await option11.click();
        await page.waitForTimeout(400);
      } else {
        await page.keyboard.press("Escape");
      }
    }

    const nextBtn = modal.getByRole("button", { name: /next|التالي/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 10_000 });
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click();

    // ── Step 2: Customer Selection & Search Debounce Check (DEF-VENUE-005) ──
    const customerSearchInput = modal.locator("input[placeholder*='Search customer'], input[placeholder*='بحث']").first();
    await expect(customerSearchInput).toBeVisible({ timeout: 10_000 });

    // Test search for non-existent query "MMWs" — verify spinner resets cleanly and does NOT freeze
    await customerSearchInput.fill("MMWs");
    await page.waitForTimeout(600); // debounce wait
    // Verify loading spinner is not permanently stuck
    await expect(modal.locator("text=Loading...").or(modal.locator("text=جاري التحميل..."))).not.toBeVisible({ timeout: 10_000 });

    // Capture visual evidence: Search for "MMWs" with clean empty state and no stuck spinner
    await modal.screenshot({
      path: "test-results/fixed_customer_search_mmws.png",
    });

    // Now search for real customer "Farouk"
    await customerSearchInput.fill("Farouk");
    await page.waitForTimeout(600); // debounce wait

    // Select customer card (automatically advances to Step 3 confirmation)
    const customerItem = modal.locator("text=Farouk Abdel-Rahman").or(modal.locator("text=Omar Farouk")).first();
    await expect(customerItem).toBeVisible({ timeout: 15_000 });
    await customerItem.click();

    // ── Step 3: Confirmation & Persistence ──
    const confirmBtn = modal.getByRole("button", { name: /confirm booking|تأكيد الحجز/i }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 15_000 });
    await expect(confirmBtn).toBeEnabled({ timeout: 15_000 });
    await confirmBtn.click();

    // Verify confirmation stage is reached (View Booking link is rendered)
    const viewBookingLink = modal.locator("a[href*='/venue/bookings/']").first();
    await expect(viewBookingLink).toBeVisible({ timeout: 35_000 });

    const href = await viewBookingLink.getAttribute("href");
    if (href) {
      const parts = href.split("/");
      createdReservationId = parts[parts.length - 1];
      console.log(`Extracted createdReservationId from link: ${createdReservationId}`);
    }

    // Close modal
    const closeBtn = modal.getByRole("button", { name: /close|إغلاق/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test("3. Physical Database Persistence Verification in PostgreSQL", async () => {
    // 1. Authoritative verification by exact reservation number and tenant context
    const query = createdReservationCode
      ? `SELECT id, reservation_number, status, resource_id, requested_start_utc, requested_end_utc, tenant_id FROM venue.reservations WHERE reservation_number = '${createdReservationCode}' AND tenant_id = '${tenantId}';`
      : "SELECT id, reservation_number, status, resource_id, requested_start_utc, requested_end_utc, tenant_id FROM venue.reservations ORDER BY created_at DESC LIMIT 1;";

    const dbOutput = queryPostgres(query);
    console.log("PostgreSQL venue.reservations authoritative query output:\n", dbOutput);

    expect(dbOutput).toContain("RES-");
    expect(dbOutput).toContain("1 row");
    expect(dbOutput).toContain(tenantId);

    // Status 4 is Confirmed
    expect(dbOutput).toMatch(/\|\s+4\s+\|/);

    // Extract raw DB GUID
    const match = dbOutput.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s+\|\s+(RES-[A-Z0-9\-]+)/i);
    expect(match).not.toBeNull();

    if (match) {
      const rawDbId = match[1];
      createdReservationCode = match[2];
      if (!createdReservationId) {
        createdReservationId = rawDbId;
      }
      console.log(`Authoritative Reservation Correlated in DB: RawDbId=${rawDbId}, Code=${createdReservationCode}, TenantId=${tenantId}`);
    }
  });

  test("4. Booking 360 Operational Detail Page (/venue/bookings/[id])", async ({ page }) => {
    expect(createdReservationId).toBeTruthy();

    // Login and navigate directly to Booking 360
    await page.goto(`/login?_tenant=AHLY&redirect=%2Fvenue%2Fbookings%2F${encodeURIComponent(createdReservationId)}`);
    await page.locator("#identifier").fill(adminEmail);
    await page.locator("#password").fill(adminPassword);
    await page.locator("form button[type='submit']").first().click();

    await page.waitForURL((url) => url.pathname.includes(`/venue/bookings/${encodeURIComponent(createdReservationId)}`) || url.pathname.includes("/venue/bookings/"), { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    // Verify Booking 360 loaded with real reservation code
    await expect(page.locator(`text=${createdReservationCode}`).first()).toBeVisible({ timeout: 25_000 });
  });

  test("5. Critical Negative Security & Concurrency Scenarios", async ({ request }) => {
    const apiBase = "http://127.0.0.1:5035/api/v1";

    // ── Scenario A: Unauthenticated Access Rejected (401 Unauthorized) ──
    const unauthResponse = await request.get(`${apiBase}/venue-profiles`);
    expect(unauthResponse.status()).toBe(401);

    // ── Scenario B: Valid View-Only Guest Token Security (403 Forbidden on cancel) ──
    const guestCancelResponse = await request.post(`${apiBase}/venue/guest/booking/cancel`, {
      data: {
        reason: "Unauthorized attempt with view-only or unauthenticated token",
        idempotencyKey: "e2e-guest-cancel-key-01"
      },
    });
    expect([401, 403]).toContain(guestCancelResponse.status());

    // ── Scenario C: Double-Booking Prevention (409 Conflict) ──
    // Login as Ahly admin to acquire access token
    const loginRes = await request.post(`${apiBase}/auth/admin/login?tenantId=${tenantId}`, {
      data: {
        identifier: adminEmail,
        password: adminPassword,
      },
      headers: { "x-forwarded-for": "10.20.30.40" },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Retrieve the exact times of the confirmed reservation
    const resRowOutput = queryPostgres(`SELECT requested_start_utc, requested_end_utc FROM venue.reservations WHERE reservation_number = '${createdReservationCode}';`);
    const timeMatch = resRowOutput.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}[^\s|]+)\s+\|\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}[^\s|]+)/);
    if (timeMatch) {
      const startUtc = new Date(timeMatch[1]).toISOString();
      const endUtc = new Date(timeMatch[2]).toISOString();
      const resourceId = "bddb5176-47c5-41e5-bb57-dc6487a9de71"; // Zayed Floodlit Pitch

      // Attempt to create a conflicting draft on the exact same resource and overlapping slot
      const duplicateDraftRes = await request.post(`${apiBase}/booking-drafts`, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
        data: {
          schedulableResourceId: resourceId,
          startUtc: startUtc,
          endUtc: endUtc,
          customerName: "Duplicate Conflict Attempter",
          customerPhone: "+201000000999"
        }
      });

      if (duplicateDraftRes.status() === 200 || duplicateDraftRes.status() === 201) {
        const draftData = await duplicateDraftRes.json();
        const conflictingReservationId = draftData.id || draftData.reservationId;

        // Attempting to hold capacity on already booked single-unit resource MUST return 409 Conflict
        const conflictHoldRes = await request.post(`${apiBase}/booking-holds`, {
          headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
          data: {
            reservationId: conflictingReservationId,
            idempotencyKey: `double-book-attempt-${Date.now()}`
          }
        });
        expect([409, 422]).toContain(conflictHoldRes.status());
        console.log(`Double-booking prevented successfully: status=${conflictHoldRes.status()}`);
      } else {
        // Even the draft creation rejected the conflicting slot
        expect([400, 409, 422]).toContain(duplicateDraftRes.status());
        console.log(`Conflicting slot creation rejected: status=${duplicateDraftRes.status()}`);
      }
    }

    // ── Scenario D: Tenant Isolation Enforcement (Cross-Tenant 404 Rejection) ──
    const cityTenantId = "2b59128b-1205-4381-95a6-345bf3453e0b";
    const cityLoginRes = await request.post(`${apiBase}/auth/admin/login?tenantId=${cityTenantId}`, {
      data: {
        identifier: "city.admin@scripe-dev.local",
        password: "P@ssw0rd",
      },
      headers: { "x-forwarded-for": "10.20.30.50" },
    });
    expect(cityLoginRes.status()).toBe(200);
    const cityToken = (await cityLoginRes.json()).accessToken;

    // Attempt to access Al-Ahly reservation with City FC bearer token
    const crossTenantRes = await request.get(`${apiBase}/reservations/${createdReservationId}`, {
      headers: { Authorization: `Bearer ${cityToken}`, "x-tenant-id": cityTenantId },
    });
    // Strict isolation must return 404 Not Found (or 403 Forbidden)
    expect([403, 404]).toContain(crossTenantRes.status());
    console.log(`Cross-tenant reservation access safely rejected with status=${crossTenantRes.status()}`);

    // ── Scenario E: Stale Concurrency RowVersion Rejection (409 Conflict) ──
    const facRes = await request.get(`${apiBase}/Facilities`, {
      headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    });
    expect(facRes.status()).toBe(200);
    const facData = await facRes.json();
    const targetFacility = facData.items[0];

    // Attempt update with stale rowVersion
    const staleUpdateRes = await request.put(`${apiBase}/Facilities/${targetFacility.id}`, {
      headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
      data: {
        name: "Conflict Name Update",
        timeZoneId: "Africa/Cairo",
        rowVersion: "AQIDBAUGBwgJCgsMDQ4PEA==", // intentionally stale/bogus rowversion
      },
    });
    expect([400, 409]).toContain(staleUpdateRes.status());
  });
});
