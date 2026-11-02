import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";

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
 * - Strictly targets SCRIPE_UAT database on localhost:5432.
 * - Zero wildcard or prefix-based destructive SQL deletions.
 * - Cleans up only explicitly tracked test fixture IDs in test.afterAll.
 */
test.describe("SCRIPE Venue: Real Runtime End-to-End Operational Acceptance", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  function requireEnv(name: string, fallback?: string): string {
    const val = process.env[name] ?? fallback;
    if (!val || val.trim() === "") {
      throw new Error(`[SECURITY GATE] Missing required environment variable: '${name}'. Test suite fails closed.`);
    }
    return val.trim();
  }

  const adminEmail = process.env.E2E_AHLY_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "ahly.admin@scripe-dev.local";
  const adminPassword = requireEnv("E2E_AHLY_ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);
  const cityAdminEmail = process.env.E2E_CITY_ADMIN_EMAIL ?? "city.admin@scripe-dev.local";
  const cityAdminPassword = requireEnv("E2E_CITY_ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);
  const tenantId = "944caec0-f3fd-454c-878a-da833a3c7c6c";
  const cityTenantId = "2b59128b-1205-4381-95a6-345bf3453e0b";

  interface FixtureTracker {
    reservationIds: Set<string>;
    reservationCodes: Set<string>;
    bookingHoldIds: Set<string>;
    guestAccessIds: Set<string>;
    paymentRefundIds: Set<string>;
    paymentIds: Set<string>;
    invoiceIds: Set<string>;
  }

  const testFixtures: FixtureTracker = {
    reservationIds: new Set<string>(),
    reservationCodes: new Set<string>(),
    bookingHoldIds: new Set<string>(),
    guestAccessIds: new Set<string>(),
    paymentRefundIds: new Set<string>(),
    paymentIds: new Set<string>(),
    invoiceIds: new Set<string>(),
  };

  let createdReservationId = "";
  let createdReservationRawId = "";
  let createdReservationCode = "";
  let bookedResourceId = "";
  let bookedStartUtc = "";
  let bookedEndUtc = "";
  let encryptedBookedResourceId = "";
  let encryptedCustomerPartyId = "";

  /** Helper to generate mandatory replay protection and auth headers for mutating requests */
  function authMutationHeaders(token: string, tenantId?: string) {
    return {
      Authorization: `Bearer ${token}`,
      ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      "X-Request-Timestamp": Date.now().toString(),
      "X-Request-Nonce": crypto.randomUUID(),
    };
  }

  /** Helper to query PostgreSQL directly for physical read-only database verification */
  function queryPostgres(sql: string): string {
    const dbHost = process.env.PGHOST ?? "127.0.0.1";
    const dbPort = process.env.PGPORT ?? "5432";
    const dbName = "SCRIPE_UAT";
    const dbUser = process.env.PGUSER ?? "postgres";
    const psqlBin =
      process.env.PSQL_PATH ??
      (process.platform === "win32" && fs.existsSync("C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe")
        ? '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe"'
        : "psql");
    const pgPassword = process.env.PGPASSWORD;
    if (!pgPassword) {
      throw new Error("[SECURITY GATE] Missing required environment variable: 'PGPASSWORD'. Tests fail closed.");
    }
    const env = { ...process.env, PGPASSWORD: pgPassword };
    const normalizedSql = sql.replace(/\r?\n/g, " ").replace(/"/g, '\\"');
    const cmd = `${psqlBin} -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${normalizedSql}"`;
    return execSync(cmd, { encoding: "utf8", env });
  }

  test.beforeAll(async () => {
    // 1. Validate configured database target
    const configuredDb = process.env.PGDATABASE ?? "SCRIPE_UAT";
    if (configuredDb !== "SCRIPE_UAT") {
      throw new Error(
        `[SECURITY GATE] Target database must be explicitly and exclusively 'SCRIPE_UAT'. Detected PGDATABASE='${configuredDb}'. Mutating or querying SCRIPE_SHARED is strictly forbidden.`
      );
    }
    const dbHost = process.env.PGHOST ?? "127.0.0.1";
    if (dbHost !== "127.0.0.1" && dbHost !== "localhost") {
      throw new Error(
        `[SECURITY GATE] Database host must be localhost or 127.0.0.1. Detected PGHOST='${dbHost}'.`
      );
    }
    const dbPort = process.env.PGPORT ?? "5432";
    if (dbPort !== "5432") {
      throw new Error(
        `[SECURITY GATE] Database port must be 5432. Detected PGPORT='${dbPort}'.`
      );
    }

    // 2. Physical verification via PostgreSQL current_database()
    const dbIdentityOutput = queryPostgres("SELECT current_database(), inet_server_addr(), inet_server_port();");
    if (!dbIdentityOutput.includes("SCRIPE_UAT")) {
      throw new Error(
        `[SECURITY GATE] Physical database is NOT 'SCRIPE_UAT'. Output:\n${dbIdentityOutput}`
      );
    }
    if (dbIdentityOutput.includes("SCRIPE_SHARED")) {
      throw new Error(
        `[SECURITY GATE] Detected SCRIPE_SHARED in database connection. Aborting immediately.`
      );
    }
  });

  test.afterAll(async () => {
    console.log("[CLEANUP] Executing exact fixture-only cleanup...");

    if (testFixtures.guestAccessIds.size > 0) {
      const ids = Array.from(testFixtures.guestAccessIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`DELETE FROM venue.guest_reservation_accesses WHERE id IN (${ids});`);
        console.log(`[CLEANUP] Purged ${testFixtures.guestAccessIds.size} exact guest_reservation_accesses fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Guest access cleanup error:", e);
      }
    }

    if (testFixtures.paymentRefundIds.size > 0) {
      const ids = Array.from(testFixtures.paymentRefundIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`DELETE FROM finance.payment_refunds WHERE id IN (${ids});`);
        console.log(`[CLEANUP] Purged ${testFixtures.paymentRefundIds.size} exact payment_refunds fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Refund cleanup error:", e);
      }
    }

    if (testFixtures.paymentIds.size > 0) {
      const ids = Array.from(testFixtures.paymentIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`
          DELETE FROM finance.payment_allocations WHERE payment_id IN (${ids});
          DELETE FROM finance.payment_receipts WHERE recorded_payment_id IN (${ids});
          DELETE FROM finance.recorded_payments WHERE id IN (${ids});
        `);
        console.log(`[CLEANUP] Purged ${testFixtures.paymentIds.size} exact recorded_payments fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Payment cleanup error:", e);
      }
    }

    if (testFixtures.invoiceIds.size > 0) {
      const ids = Array.from(testFixtures.invoiceIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`
          DELETE FROM finance.customer_invoice_lines WHERE invoice_id IN (${ids});
          DELETE FROM finance.customer_invoices WHERE id IN (${ids});
        `);
        console.log(`[CLEANUP] Purged ${testFixtures.invoiceIds.size} exact customer_invoices fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Invoice cleanup error:", e);
      }
    }

    if (testFixtures.bookingHoldIds.size > 0) {
      const ids = Array.from(testFixtures.bookingHoldIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`
          DELETE FROM venue.capacity_ledger_entries WHERE booking_hold_id IN (${ids});
          DELETE FROM venue.booking_holds WHERE id IN (${ids});
        `);
        console.log(`[CLEANUP] Purged ${testFixtures.bookingHoldIds.size} exact booking_holds fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Booking hold cleanup error:", e);
      }
    }

    if (testFixtures.reservationIds.size > 0) {
      const ids = Array.from(testFixtures.reservationIds).map((id) => `'${id}'`).join(",");
      try {
        queryPostgres(`
          DELETE FROM venue.capacity_ledger_entries WHERE reservation_id IN (${ids});
          DELETE FROM venue.booking_holds WHERE reservation_id IN (${ids});
          DELETE FROM venue.booking_status_histories WHERE reservation_id IN (${ids});
          DELETE FROM venue.booking_requests WHERE reservation_id IN (${ids});
          DELETE FROM venue.guest_reservation_accesses WHERE reservation_id IN (${ids});
          DELETE FROM venue.reservations WHERE id IN (${ids});
        `);
        console.log(`[CLEANUP] Purged ${testFixtures.reservationIds.size} exact reservations fixtures.`);
      } catch (e) {
        console.warn("[CLEANUP WARNING] Reservation cleanup error:", e);
      }
    }
  });

  async function loginAndNavigate(page: any, targetPath: string) {
    const encodedTarget = encodeURIComponent(targetPath);
    await page.goto(`/login?_tenant=AHLY&redirect=${encodedTarget}`);
    await page.waitForLoadState("domcontentloaded");

    const identifierInput = page.locator("#identifier");
    const passwordInput = page.locator("#password");
    await expect(identifierInput).toBeVisible({ timeout: 20_000 });
    await expect(passwordInput).toBeVisible({ timeout: 20_000 });

    await identifierInput.fill(adminEmail);
    await passwordInput.fill(adminPassword);

    const submitBtn = page.locator("form button[type='submit']").first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    await page.waitForURL((url: URL) => !url.pathname.includes("/login"), { timeout: 45_000 });

    const expectedPath = targetPath.split("?")[0];
    if (!page.url().includes(expectedPath)) {
      await page.goto(targetPath);
    }
    await page.waitForLoadState("networkidle");
  }

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
    // Observe network responses to capture server-issued reservation details
    page.on("response", async (res) => {
      if (res.url().includes("/Reservations") && res.status() === 200 && res.request().method() === "GET") {
        try {
          const body = await res.json();
          if (body?.reservationNumber && !createdReservationCode) {
            createdReservationCode = body.reservationNumber;
            console.log(`[Network Intercept] Correlated reservationNumber: ${createdReservationCode}`);
          }
        } catch {}
      }
    });

    page.on("request", (req) => {
      if (req.url().includes("/Reservations") && req.method() === "POST") {
        try {
          const postData = req.postDataJSON();
          if (postData?.resourceId) {
            encryptedBookedResourceId = postData.resourceId;
            console.log(`[Network Intercept] Captured encryptedBookedResourceId: ${encryptedBookedResourceId}`);
          }
          if (postData?.customerPartyId) {
            encryptedCustomerPartyId = postData.customerPartyId;
            console.log(`[Network Intercept] Captured encryptedCustomerPartyId: ${encryptedCustomerPartyId}`);
          }
        } catch {}
      }
    });

    // Direct authenticated session setup
    await loginAndNavigate(page, "/venue/calendar");

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
    // Select valid daytime time slot within operating hours (07:00 - 23:00) that has no existing reservation
    const nextBtn = modal.getByRole("button", { name: /next|التالي/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 10_000 });

    const customerSearchInput = modal.locator("input[placeholder*='Search customer'], input[placeholder*='بحث']").first();
    const candidateSlots = ["12:00", "13:00", "16:00", "17:00", "18:00", "19:00", "20:00", "11:00"];
    for (const slot of candidateSlots) {
      const timeSelectTrigger = modal.locator("#booking-court-time").first();
      if (await timeSelectTrigger.isVisible()) {
        await timeSelectTrigger.click();
        await page.waitForTimeout(300);
        const option = page.locator(`[cmdk-item]:has-text('${slot}'), [role='option']:has-text('${slot}'), [data-value='${slot}']`).first();
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(400);
        } else {
          await page.keyboard.press("Escape");
        }
      }
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(600);
        if (await customerSearchInput.isVisible()) {
          break;
        }
      }
    }

    // ── Step 2: Customer Selection & Search Debounce Check (DEF-VENUE-005) ──
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
    // 1. Authoritative verification by exact reservation number or GUID ID (Fail closed, no fallback to latest)
    if (!createdReservationCode && !createdReservationId) {
      throw new Error(
        "[SECURITY GATE] Correlation failure: neither createdReservationCode nor createdReservationId was captured during Test 2. Failing closed without querying random reservations."
      );
    }

    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(createdReservationId);
    let whereClause = "";
    if (createdReservationCode) {
      whereClause = `reservation_number = '${createdReservationCode}' AND tenant_id = '${tenantId}'`;
    } else if (isGuid) {
      whereClause = `id = '${createdReservationId}' AND tenant_id = '${tenantId}'`;
    } else {
      throw new Error(
        `[SECURITY GATE] Created reservation identifier '${createdReservationId}' is not a raw GUID and createdReservationCode is missing. Failing closed.`
      );
    }

    const query = `SELECT id, reservation_number, status, resource_id, requested_start_utc, requested_end_utc, tenant_id FROM venue.reservations WHERE ${whereClause};`;
    const dbOutput = queryPostgres(query);
    console.log("PostgreSQL venue.reservations authoritative query output:\n", dbOutput);

    expect(dbOutput).toContain("1 row");
    expect(dbOutput).toContain(tenantId);

    // Status 4 is Confirmed
    expect(dbOutput).toMatch(/\|\s+4\s+\|/);

    // Extract raw DB GUID, reservation number, resource ID, and requested time slot
    const match = dbOutput.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s+\|\s+([A-Z0-9\-]+)\s+\|\s+4\s+\|\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s+\|\s+([^\s|]+(?:\s+[^\s|]+)?)\s+\|\s+([^\s|]+(?:\s+[^\s|]+)?)/i
    );
    expect(match).not.toBeNull();

    if (match) {
      const rawDbId = match[1];
      createdReservationCode = match[2];
      createdReservationRawId = rawDbId;
      bookedResourceId = match[3];
      bookedStartUtc = new Date(match[4]).toISOString();
      bookedEndUtc = new Date(match[5]).toISOString();

      if (!createdReservationId) {
        createdReservationId = rawDbId;
      }

      // Track exact fixtures for cleanup
      testFixtures.reservationIds.add(rawDbId);
      testFixtures.reservationCodes.add(createdReservationCode);

      console.log(
        `Authoritative Reservation Correlated in DB: RawDbId=${rawDbId}, Code=${createdReservationCode}, ResourceId=${bookedResourceId}, Start=${bookedStartUtc}, End=${bookedEndUtc}`
      );
    }
  });

  test("4. Booking 360 Operational Detail Page (/venue/bookings/[id])", async ({ page }) => {
    expect(createdReservationId).toBeTruthy();

    // Login and navigate directly to Booking 360
    await loginAndNavigate(page, `/venue/bookings/${encodeURIComponent(createdReservationId)}`);

    // Verify Booking 360 loaded with real reservation code
    await expect(page.locator(`text=${createdReservationCode}`).first()).toBeVisible({ timeout: 25_000 });

    // Verify Slice 2 features in Booking 360:
    // 1. Distinct reservation and payment status badges
    await expect(page.locator("[data-testid='reservation-status-badge']").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-testid='payment-status-badge']").first()).toBeVisible({ timeout: 10_000 });

    // 2. Customer identity card & Party Kernel ID
    await expect(page.locator("[data-testid='customer-identity-card']").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-testid='customer-party-id']").first()).toBeVisible({ timeout: 10_000 });

    // 3. Guest Access card
    await expect(page.locator("[data-testid='guest-access-card']").first()).toBeVisible({ timeout: 10_000 });

    // 4. Calendar return link with contextual date and resource query
    const backToCal = page.locator("[data-testid='back-to-calendar-link']").first();
    await expect(backToCal).toBeVisible({ timeout: 10_000 });
    const calHref = await backToCal.getAttribute("href");
    expect(calHref).toContain("/venue/calendar");
  });

  test("5. Critical Negative Security & Concurrency Scenarios", async ({ request }) => {
    const apiBase = "http://127.0.0.1:5035/api/v1";

    // ── Scenario A: Unauthenticated Access Rejected (401 Unauthorized) ──
    const unauthResponse = await request.get(`${apiBase}/venue-profiles`);
    expect(unauthResponse.status()).toBe(401);

    // ── Scenario B: Valid View-Only Guest Token Security (403 Forbidden on cancel) ──
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex").toUpperCase();
    const guestAccessId = crypto.randomUUID();

    // Ensure venue profile has guest experience enabled in test database
    queryPostgres(`UPDATE venue.venue_profiles SET enable_guest_experience = TRUE WHERE tenant_id = '${tenantId}';`);

    // Insert guest reservation access record with view-only action scope ('View')
    queryPostgres(`
      INSERT INTO venue.guest_reservation_accesses (
        id, tenant_id, reservation_id, token_hash, expires_at_utc,
        is_revoked, allowed_actions, access_count,
        is_deleted, is_active, created_at
      ) VALUES (
        '${guestAccessId}', '${tenantId}', '${createdReservationRawId}', '${tokenHash}', NOW() + INTERVAL '7 days',
        FALSE, 'View', 0,
        FALSE, TRUE, NOW()
      );
    `);
    testFixtures.guestAccessIds.add(guestAccessId);

    // 1. Exchange unauthenticated bearer token for scoped guest session
    const sessionRes = await request.post(`${apiBase}/venue/guest/session`, {
      data: { token: rawToken },
    });
    expect(sessionRes.status()).toBe(200);

    // Extract session cookie from Set-Cookie header
    const setCookieHeader = sessionRes.headers()["set-cookie"] ?? "";
    const cookieMatch = setCookieHeader.match(/scr_guest_session=([^;]+)/);
    const sessionCookie = cookieMatch ? `scr_guest_session=${cookieMatch[1]}` : "";
    expect(sessionCookie).toBeTruthy();

    // 2. View booking succeeds with HTTP 200 and indicates canCancel: false
    const viewBookingRes = await request.get(`${apiBase}/venue/guest/booking`, {
      headers: { Cookie: sessionCookie },
    });
    expect(viewBookingRes.status()).toBe(200);
    const viewBookingData = await viewBookingRes.json();
    expect(viewBookingData.canCancel).toBe(false);
    expect(viewBookingData.allowedActions).toContain("View");
    expect(viewBookingData.allowedActions).not.toContain("Cancel");

    // 3. Attempting cancellation with view-only token must be strictly rejected with HTTP 403 Forbidden
    const cancelAttemptKey = `e2e-guest-cancel-${Date.now()}`;
    const guestCancelResponse = await request.post(`${apiBase}/venue/guest/booking/cancel`, {
      headers: {
        Cookie: sessionCookie,
        "Idempotency-Key": cancelAttemptKey,
      },
      data: {
        reason: "Unauthorized attempt with view-only guest token",
        idempotencyKey: cancelAttemptKey,
      },
    });
    expect(guestCancelResponse.status()).toBe(403);

    // 4. Authoritative DB verification: reservation status remains 4 (Confirmed)
    const dbStatusCheck = queryPostgres(
      `SELECT status FROM venue.reservations WHERE id = '${createdReservationRawId}';`
    );
    expect(dbStatusCheck).toMatch(/\b4\b/);

    // ── Scenario C: Double-Booking Prevention (409 Conflict) ──
    // Login as Ahly admin to acquire access token (no spoofed headers)
    const loginRes = await request.post(`${apiBase}/auth/admin/login?tenantId=${tenantId}`, {
      data: {
        identifier: adminEmail,
        password: adminPassword,
      },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Unconditional assertion on booked resource and time slot
    expect(bookedResourceId).toBeTruthy();
    expect(bookedStartUtc).toBeTruthy();
    expect(bookedEndUtc).toBeTruthy();

    let targetResourceId = encryptedBookedResourceId;
    let targetPartyId = encryptedCustomerPartyId;

    if (!targetResourceId) {
      const resListRes = await request.get(`${apiBase}/schedulable-resources?pageSize=100`, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
      });
      if (resListRes.status() === 200) {
        const resListData = await resListRes.json();
        targetResourceId = resListData.items[0]?.id;
      }
    }
    if (!targetPartyId) {
      const partiesRes = await request.get(`${apiBase}/Parties?pageSize=1`, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
      });
      if (partiesRes.status() === 200) {
        const partiesData = await partiesRes.json();
        targetPartyId = partiesData.items[0]?.id;
      }
    }

    // Attempt to create a conflicting draft on the exact same resource and overlapping slot
    const conflictDraftKey = `conflict-draft-${Date.now()}`;
    const duplicateDraftRes = await request.post(`${apiBase}/Reservations`, {
      headers: authMutationHeaders(token, tenantId),
      data: {
        resourceId: targetResourceId,
        customerPartyId: targetPartyId,
        bookerPartyId: targetPartyId,
        payerPartyId: targetPartyId,
        requestedStartUtc: bookedStartUtc,
        requestedEndUtc: bookedEndUtc,
        quantity: 1,
        idempotencyKey: conflictDraftKey,
      },
    });

    if (duplicateDraftRes.status() === 201) {
      const draftData = await duplicateDraftRes.json();
      const conflictingReservationId = draftData.id;

      // Track created conflicting draft reservation for cleanup
      const conflictDbOut = queryPostgres(
        `SELECT id FROM venue.reservations WHERE resource_id = '${bookedResourceId}' AND status = 1 AND tenant_id = '${tenantId}' ORDER BY created_at DESC LIMIT 1;`
      );
      const conflictMatch = conflictDbOut.match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
      );
      if (conflictMatch) {
        testFixtures.reservationIds.add(conflictMatch[1]);
      }

      // Attempting to hold capacity on already booked single-unit resource MUST return 409 Conflict
      const conflictHoldRes = await request.post(`${apiBase}/booking-holds`, {
        headers: authMutationHeaders(token, tenantId),
        data: {
          reservationId: conflictingReservationId,
          idempotencyKey: `double-book-attempt-${Date.now()}`,
        },
      });
      expect(conflictHoldRes.status()).toBe(409);
      console.log(`Double-booking prevented successfully: status=${conflictHoldRes.status()}`);
    } else {
      // If the draft creation itself enforced slot exclusivity, it must return 409 Conflict
      expect(duplicateDraftRes.status()).toBe(409);
      console.log(`Conflicting slot creation rejected with status=409`);
    }

    // ── Scenario D: Tenant Isolation Enforcement (Cross-Tenant 404 Rejection) ──
    const cityLoginRes = await request.post(`${apiBase}/auth/admin/login?tenantId=${cityTenantId}`, {
      data: {
        identifier: cityAdminEmail,
        password: cityAdminPassword,
      },
    });
    expect(cityLoginRes.status()).toBe(200);
    const cityToken = (await cityLoginRes.json()).accessToken;

    // Attempt to access Al-Ahly reservation with City FC bearer token
    const crossTenantRes = await request.get(`${apiBase}/Reservations/${createdReservationId}`, {
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

    // Attempt update with stale rowVersion (must include valid code and name to test concurrency check)
    const staleUpdateRes = await request.put(`${apiBase}/Facilities/${targetFacility.id}`, {
      headers: authMutationHeaders(token, tenantId),
      data: {
        code: targetFacility.code,
        name: "Conflict Name Update",
        description: targetFacility.description ?? "Concurrency test description",
        rowVersion: "AQIDBAUGBwgJCgsMDQ4PEA==", // intentionally stale/bogus rowversion
      },
    });
    expect(staleUpdateRes.status()).toBe(409);
  });

  test("6. Unmocked Venue Customers Directory, Detail Drawer & Booking History (Slice 3)", async ({ page }) => {
    // Navigate to /venue/customers with Al-Ahly tenant scope
    await loginAndNavigate(page, "/venue/customers");

    // 1. Verify View mounts & Total Customer Count badge is displayed
    await expect(page.locator("[data-testid='venue-customers-view']").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("h1:has-text('Customers')").first()).toBeVisible({ timeout: 15_000 });

    // 2. Verify Pagination Summary on Page 1 (Showing 1 to 20 of 37X customers)
    await expect(page.locator("text=/Showing 1 to 20 of \\d+ customers/").first()).toBeVisible({ timeout: 10_000 });

    // 3. Verify Pagination Transition to Page 2
    const nextBtn = page.getByRole("button", { name: /next|التالي/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 10_000 });
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Verify Page 2 items (Showing 21 to 40 of 37X customers)
    await expect(page.locator("text=/Showing 21 to 40 of \\d+ customers/").first()).toBeVisible({ timeout: 10_000 });

    // 4. Verify Live Debounced Search for "Omar"
    const searchInput = page.locator("input[placeholder*='Search customers'], input[placeholder*='البحث']").first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill("Omar");
    await page.waitForTimeout(1000); // 300ms debounce wait

    // Select Omar Farouk card
    const omarCard = page.locator("text=Omar Farouk").first();
    await expect(omarCard).toBeVisible({ timeout: 15_000 });
    await omarCard.click();

    // 5. Verify Customer Detail Drawer (DetailSheet) opens
    const drawer = page.locator("[role='dialog']").first();
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    await expect(drawer.locator("text=Party Kernel ID").or(drawer.locator("text=معرّف الهوية"))).toBeVisible({ timeout: 10_000 });

    // Verify Copy Party Kernel ID action
    const copyBtn = drawer.locator("button:has-text('Copy ID'), button:has-text('نسخ')").first();
    await expect(copyBtn).toBeVisible({ timeout: 5_000 });

    // 6. Verify Customer Booking History loads with real seeded reservations
    await expect(drawer.locator("text=Booking History").or(drawer.locator("text=سجل الحجوزات"))).toBeVisible({ timeout: 10_000 });
    const resRow = drawer.locator("text=RES-AHLY-").first();
    await expect(resRow).toBeVisible({ timeout: 20_000 });

    // 7. Verify Direct Link to Booking 360
    const view360Link = drawer.locator("a:has-text('View Booking 360'), a:has-text('عرض تفاصيل الحجز 360')").first();
    await expect(view360Link).toBeVisible({ timeout: 10_000 });
    const view360Href = await view360Link.getAttribute("href");
    expect(view360Href).toContain("/venue/bookings/");

    // 8. Verify "+ Book for Customer" CTA Link
    const bookCta = drawer.locator("a:has-text('+ Book for Customer'), a:has-text('+ حجز للعميل')").first();
    await expect(bookCta).toBeVisible({ timeout: 10_000 });
    const bookHref = await bookCta.getAttribute("href");
    expect(bookHref).toContain("/venue/calendar?newBooking=true&customerPartyId=");

    // 9. Follow CTA to Operations Calendar and verify modal opens prefilled
    await bookCta.click();
    await page.waitForURL((url) => url.pathname.includes("/venue/calendar") && url.searchParams.get("newBooking") === "true", { timeout: 30_000 });
    const calendarModal = page.locator("[role='dialog']").first();
    await expect(calendarModal).toBeVisible({ timeout: 15_000 });
  });

  test("7. Unmocked Money Landing Overview, Daily Shift Summary, Booking Links & Refund Workflow (Slice 4)", async ({ page }) => {
    // 1. Authenticate with Al-Ahly tenant scope and navigate to /venue/money
    await loginAndNavigate(page, "/venue/money");

    // 2. Verify Money Landing Workspace mounts
    const landingView = page.locator("[data-testid='venue-money-landing']").first();
    await expect(landingView).toBeVisible({ timeout: 20_000 });

    // 3. Verify Standardized Financial Terminology on KPI cards
    await expect(page.locator("text=Amount Due (Invoiced)").or(page.locator("text=القيمة المستحقة (المفوترة)")).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Amount Collected").or(page.locator("text=المبالغ المحصلة")).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Collected Today").or(page.locator("text=المحصل اليوم")).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Outstanding Balance").or(page.locator("text=الرصيد المتبقي")).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Refund Status").or(page.locator("text=حالة الإرجاعات")).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Net Collected").or(page.locator("text=صافي التحصيل")).first()).toBeVisible({ timeout: 10_000 });

    // 4. Switch to "Today" filter and verify Consolidated Today's Operational Shift Summary card
    const todayFilterBtn = page.locator("button:has-text('Today'), button:has-text('اليوم')").first();
    await expect(todayFilterBtn).toBeVisible({ timeout: 10_000 });
    await todayFilterBtn.click();
    await page.waitForTimeout(600);

    const shiftSummaryCard = page.locator("[data-testid='today-shift-summary-card']").first();
    await expect(shiftSummaryCard).toBeVisible({ timeout: 15_000 });
    await expect(shiftSummaryCard.locator("text=Today's Operational Shift Summary").or(shiftSummaryCard.locator("text=الملخص التشغيلي لوردية اليوم")).first()).toBeVisible({ timeout: 10_000 });

    // 5. Verify Booking 360 Deep Link exists in tables
    const bookingDeepLink = page.locator("[data-testid^='receivable-booking-link-'], [data-testid^='payment-booking-link-']").first();
    await expect(bookingDeepLink).toBeVisible({ timeout: 15_000 });
    const bookingHref = await bookingDeepLink.getAttribute("href");
    expect(bookingHref).toContain("/venue/bookings/");

    // 6. Provision an isolated financial test fixture in SCRIPE_UAT for Refund Workflow verification
    // 6.1 Authenticate via API to obtain admin access token for API operations
    const apiLoginRes = await page.request.post(`http://127.0.0.1:5035/api/v1/auth/admin/login?tenantId=${tenantId}`, {
      data: {
        identifier: adminEmail,
        password: adminPassword,
      },
    });
    expect(apiLoginRes.status()).toBe(200);
    const apiAdminToken = (await apiLoginRes.json()).accessToken;

    // 6.2 Create a dedicated reservation via API to acquire a valid server-encrypted ID
    const fixtureDraftKey = `e2e-refund-draft-${Date.now()}`;
    const fixtureResListRes = await page.request.get("http://127.0.0.1:5035/api/v1/schedulable-resources?pageSize=1", {
      headers: { Authorization: `Bearer ${apiAdminToken}`, "x-tenant-id": tenantId },
    });
    expect(fixtureResListRes.status()).toBe(200);
    const fixtureResourceId = (await fixtureResListRes.json()).items[0].id;

    const fixturePartiesRes = await page.request.get("http://127.0.0.1:5035/api/v1/Parties?pageSize=1", {
      headers: { Authorization: `Bearer ${apiAdminToken}`, "x-tenant-id": tenantId },
    });
    expect(fixturePartiesRes.status()).toBe(200);
    const fixturePartyId = (await fixturePartiesRes.json()).items[0].id;

    const fixtureDraftRes = await page.request.post("http://127.0.0.1:5035/api/v1/Reservations", {
      headers: authMutationHeaders(apiAdminToken, tenantId),
      data: {
        resourceId: fixtureResourceId,
        customerPartyId: fixturePartyId,
        bookerPartyId: fixturePartyId,
        payerPartyId: fixturePartyId,
        requestedStartUtc: new Date(Date.now() + 86400000 * 60).toISOString(),
        requestedEndUtc: new Date(Date.now() + 86400000 * 60 + 3600000).toISOString(),
        quantity: 1,
        idempotencyKey: fixtureDraftKey,
      },
    });
    expect(fixtureDraftRes.status()).toBe(201);
    const fixtureDraftData = await fixtureDraftRes.json();
    const fixtureEncryptedResId = fixtureDraftData.id;
    expect(fixtureEncryptedResId).toBeTruthy();

    // 6.3 Query database for raw GUID of created reservation
    const fixtureDbOut = queryPostgres(
      `SELECT id FROM venue.reservations WHERE tenant_id = '${tenantId}' ORDER BY created_at DESC LIMIT 1;`
    );
    const fixtureResMatch = fixtureDbOut.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    expect(fixtureResMatch).not.toBeNull();
    const fixtureReservationRawId = fixtureResMatch![1];
    testFixtures.reservationIds.add(fixtureReservationRawId);

    // 6.4 Transition reservation status to Cancelled (Status 8) in database
    queryPostgres(
      `UPDATE venue.reservations SET status = 8 WHERE id = '${fixtureReservationRawId}';`
    );

    // 6.5 Provision dedicated paid invoice, customer invoice line, recorded payment, and allocation in SCRIPE_UAT
    const fixtureInvoiceId = crypto.randomUUID();
    const fixtureLineId = crypto.randomUUID();
    const fixturePaymentId = crypto.randomUUID();
    const fixtureAllocId = crypto.randomUUID();
    const uniqueSuffix = Date.now().toString();

    testFixtures.invoiceIds.add(fixtureInvoiceId);
    testFixtures.paymentIds.add(fixturePaymentId);

    queryPostgres(`
      INSERT INTO finance.customer_invoices (
        id, tenant_id, invoice_number, status, customer_party_id, payer_party_id,
        currency_code, subtotal_amount, discount_amount, tax_amount, total_amount,
        adjustment_amount, paid_amount, reservation_id, issued_at_utc, due_at_utc,
        source, source_reference, is_deleted, is_active, created_at
      ) VALUES (
        '${fixtureInvoiceId}', '${tenantId}', 'INV-E2E-${uniqueSuffix}', 3,
        '7c8d9e0f-1a23-4233-9445-c3d4e5f6a7b8', '7c8d9e0f-1a23-4233-9445-c3d4e5f6a7b8',
        'EGP', 1500.00, 0, 0, 1500.00,
        0, 1500.00, '${fixtureReservationRawId}', NOW(), NOW(),
        'VenueReservation', 'RES-E2E-${uniqueSuffix}', FALSE, TRUE, NOW()
      );

      INSERT INTO finance.customer_invoice_lines (
        id, tenant_id, invoice_id, description, line_type,
        quantity, unit_amount, discount_amount, tax_amount, total_amount, sort_order,
        is_deleted, is_active, created_at
      ) VALUES (
        '${fixtureLineId}', '${tenantId}', '${fixtureInvoiceId}', 'E2E Refund Test Line', 0,
        1, 1500.00, 0, 0, 1500.00, 1,
        FALSE, TRUE, NOW()
      );

      INSERT INTO finance.recorded_payments (
        id, tenant_id, payment_number, status, method,
        currency_code, amount, allocated_amount, payer_party_id,
        reservation_id, recorded_at_utc, recorded_by_actor_id,
        idempotency_key, reason, is_deleted, is_active, created_at
      ) VALUES (
        '${fixturePaymentId}', '${tenantId}', 'PAY-E2E-${uniqueSuffix}', 2, 2,
        'EGP', 1500.00, 1500.00, '7c8d9e0f-1a23-4233-9445-c3d4e5f6a7b8',
        '${fixtureReservationRawId}', NOW(), '1ac0aade-f40c-4df5-b1ba-760ce297b8d7',
        'pay-key-${uniqueSuffix}', 'E2E Refund Test Payment', FALSE, TRUE, NOW()
      );

      INSERT INTO finance.payment_allocations (
        id, tenant_id, payment_id, invoice_id, amount,
        allocated_at_utc, idempotency_key, is_deleted, is_active, created_at
      ) VALUES (
        '${fixtureAllocId}', '${tenantId}', '${fixturePaymentId}', '${fixtureInvoiceId}', 1500.00,
        NOW(), 'alloc-key-${uniqueSuffix}', FALSE, TRUE, NOW()
      );
    `);

    // 6.6 Navigate directly to the Cancelled Reservation's Booking 360 page
    await page.goto(`/venue/bookings/${fixtureEncryptedResId}`);
    await page.waitForLoadState("networkidle");

    // Verify reservation status badge displays Cancelled
    const resBadge = page.locator("[data-testid='reservation-status-badge']").first();
    await expect(resBadge).toBeVisible({ timeout: 20_000 });
    await expect(resBadge).toContainText(/Cancelled|ملغي/i);

    // Verify Secondary Payment Status Badge displays Refund Required
    const payStatusBadge = page.locator("[data-testid='payment-status-badge']").first();
    await expect(payStatusBadge).toBeVisible({ timeout: 15_000 });
    await expect(payStatusBadge).toContainText(/Refund Required|مطلوب استرداد/i);

    // Verify Financial Advisory Alert banner for Cancelled booking with unrefunded recorded payment
    const cancelledAlert = page.locator("[data-testid='cancelled-paid-advisory']").first();
    await expect(cancelledAlert).toBeVisible({ timeout: 15_000 });

    // Verify refund CTA button is present and click it
    const issueRefundBtn = page.locator("[data-testid='issue-refund-cta-btn']").first();
    await expect(issueRefundBtn).toBeVisible({ timeout: 15_000 });
    await issueRefundBtn.click();

    // Follow Issue Refund link into Payments ledger
    await page.waitForURL((url) => url.pathname.includes("/venue/money/payments") && url.searchParams.get("action") === "refund", { timeout: 30_000 });
    await page.waitForLoadState("networkidle");

    // Verify refund card auto-mounts prefilled with the payment
    const refundReasonInput = page.locator("#refund-reason").first();
    await expect(refundReasonInput).toBeVisible({ timeout: 15_000 });
    await refundReasonInput.fill(`Automated unmocked test refund for fixture payment ${fixturePaymentId}`);

    // Submit refund
    const recordRefundBtn = page.locator("[data-testid='submit-refund-btn']").or(page.locator("button:has-text('Record refund'), button:has-text('تسجيل استرداد')")).first();
    await expect(recordRefundBtn).toBeEnabled({ timeout: 5_000 });
    await recordRefundBtn.click();

    // Verify success feedback
    await expect(page.locator("text=/Refund was recorded|تم تسجيل الاسترداد/i").first()).toBeVisible({ timeout: 15_000 });

    // 6.7 Database verification: verify refund persistence in finance.payment_refunds
    const refundDbOutput = queryPostgres(
      `SELECT id FROM finance.payment_refunds WHERE recorded_payment_id = '${fixturePaymentId}';`
    );
    expect(refundDbOutput).toContain("1 row");
    const refundMatch = refundDbOutput.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    expect(refundMatch).not.toBeNull();
    testFixtures.paymentRefundIds.add(refundMatch![1]);

    // 6.8 Return to Booking 360 and verify status badge is updated to "Refunded"
    await page.goto(`/venue/bookings/${fixtureEncryptedResId}`);
    await page.waitForLoadState("networkidle");
    const updatedPayBadge = page.locator("[data-testid='payment-status-badge']").first();
    await expect(updatedPayBadge).toContainText(/Refunded|مستردة/i, { timeout: 15_000 });

    // 6.9 Idempotency / Duplicate Refund check: attempting duplicate refund via API returns strictly 409 Conflict
    // Fetch encrypted payment ID and invoice ID from API for exact server decryption
    const getPaymentRes = await page.request.get(`http://127.0.0.1:5035/api/v1/finance/recorded-payments?reservationId=${fixtureEncryptedResId}`, {
      headers: { Authorization: `Bearer ${apiAdminToken}`, "x-tenant-id": tenantId },
    });
    expect(getPaymentRes.status()).toBe(200);
    const payData = await getPaymentRes.json();
    const encryptedPaymentId = payData.items[0]?.id;

    const getInvoiceRes = await page.request.get(`http://127.0.0.1:5035/api/v1/finance/customer-invoices?reservationId=${fixtureEncryptedResId}`, {
      headers: { Authorization: `Bearer ${apiAdminToken}`, "x-tenant-id": tenantId },
    });
    expect(getInvoiceRes.status()).toBe(200);
    const invData = await getInvoiceRes.json();
    const encryptedInvoiceId = invData.items[0]?.id;

    expect(encryptedPaymentId).toBeTruthy();
    expect(encryptedInvoiceId).toBeTruthy();

    const dupRefundRes = await page.request.post(`http://127.0.0.1:5035/api/v1/finance/recorded-payments/${encryptedPaymentId}/refunds`, {
      headers: authMutationHeaders(apiAdminToken, tenantId),
      data: {
        invoiceId: encryptedInvoiceId,
        amount: 1500.00,
        idempotencyKey: `dup-refund-${Date.now()}`,
        reason: "Attempt duplicate refund on already refunded payment",
      },
    });
    expect(dupRefundRes.status()).toBe(409);
  });
});

