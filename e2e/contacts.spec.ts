import { test, expect, Page } from "@playwright/test";
import { execFileSync } from "child_process";
import { randomUUID } from "crypto";

interface DpapiTenantAdmin {
  tenantKey: string;
  email: string;
  password: string;
}

function mutationHeaders(accessToken: string, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "X-Request-Timestamp": Date.now().toString(),
    "X-Request-Nonce": randomUUID(),
    ...extra,
  };
}

/**
 * Dynamically loads Tenant A and Tenant B admin credentials from the local
 * Windows DPAPI CliXml fixture outside the repository. Zero credentials are
 * hardcoded in source files.
 */
function loadDpapiTenantAdmins(): { alpha: DpapiTenantAdmin; beta: DpapiTenantAdmin } {
  const psScript = [
    '$dirs = @((Join-Path $env:LOCALAPPDATA "SCRIPE\\PartyKernelE2E"))',
    '$pkgRoot = Join-Path $env:USERPROFILE "AppData\\Local\\Packages"',
    "if (Test-Path $pkgRoot) {",
    "  $dirs += Get-ChildItem -Path $pkgRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {",
    '    Join-Path $_.FullName "LocalCache\\Local\\SCRIPE\\PartyKernelE2E"',
    "  }",
    "}",
    "$files = foreach ($d in $dirs) {",
    "  if (Test-Path $d) {",
    '    Get-ChildItem -Path $d -Filter "tenant-admins-c1-final-flow-*.xml" -File -ErrorAction SilentlyContinue',
    "  }",
    "}",
    "$latest = $files | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1",
    'if (-not $latest) { throw "DPAPI tenant-admins fixture not found" }',
    "$items = Import-Clixml -Path $latest.FullName",
    "$out = foreach ($item in $items) {",
    "  [PSCustomObject]@{",
    "    tenantKey = [string]$item.TenantKey",
    "    email = [string]$item.Credential.UserName",
    "    password = [string]$item.Credential.GetNetworkCredential().Password",
    "  }",
    "}",
    "$out | ConvertTo-Json -Compress",
  ].join("\n");

  const encoded = Buffer.from(psScript, "utf16le").toString("base64");
  const raw = execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
    { encoding: "utf8" }
  );
  const items = JSON.parse(raw.trim()) as DpapiTenantAdmin[];
  const alpha = items.find((i) => i.tenantKey === "party-kernel-e2e-alpha");
  const beta = items.find((i) => i.tenantKey === "party-kernel-e2e-beta");
  if (!alpha || !beta) {
    throw new Error("Missing party-kernel-e2e-alpha or party-kernel-e2e-beta in DPAPI fixture");
  }
  return { alpha, beta };
}

const TENANT_ADMINS = loadDpapiTenantAdmins();
const PARTY_API_BASE_URL = (
  process.env.PARTY_E2E_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5035/api"
).replace(/\/$/, "");

/**
 * Real browser UI login through `/login` without injecting tokens into storage.
 */
async function loginViaUi(
  page: Page,
  creds: DpapiTenantAdmin,
  redirectPath = "/party-kernel/parties"
) {
  const randomIp = `10.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
  await page.route("**/api/v1/auth/**", async (route) => {
    const headers = { ...route.request().headers(), "x-forwarded-for": randomIp };
    await route.continue({ headers });
  });

  await page.goto(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  await page.waitForLoadState("domcontentloaded");

  const identifierInput = page.locator("#identifier");
  const passwordInput = page.locator("#password");
  await expect(identifierInput).toBeVisible({ timeout: 15_000 });
  await expect(passwordInput).toBeVisible({ timeout: 15_000 });

  await identifierInput.fill(creds.email);
  await passwordInput.fill(creds.password);

  const submitBtn = page.locator("form button[type='submit']").first();
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
  await submitBtn.click();

  await page.waitForURL((url) => url.pathname.includes("/party-kernel/parties"), {
    timeout: 45_000,
  });
  await page.waitForLoadState("networkidle");
}

test.describe("Contacts & PartyKernel End-to-End Acceptance (Real UI Auth)", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  let createdPersonId = "";
  let createdOrgId = "";
  const uniqueTimestamp = Date.now().toString().slice(-6);
  const personFullName = `Dr. Amira Tariq ${uniqueTimestamp}`;
  const orgLegalName = `Al-Mansoor Sports Holdings ${uniqueTimestamp}`;
  const orgDisplayName = `Al-Mansoor ${uniqueTimestamp}`;

  test("1. Tenant A Everyday Lifecycle: Real /login UI, Org & Person CRUD, Person rowVersion 409 Recovery, ContactPoints, Roles, Relationships", async ({
    page,
  }) => {
    // ── Step 1: Real UI Login as Tenant A ─────────────────────────────────────
    await loginViaUi(page, TENANT_ADMINS.alpha);

    // Header & directory controls render truthfully
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // Extract the access token acquired naturally by the browser login flow for concurrent API test helper
    const accessToken = await page.evaluate(() => sessionStorage.getItem("dev_access_token"));
    expect(accessToken).toBeTruthy();

    // ── Step 2: Create Organization with distinct legalName and displayName ───
    const newOrgBtn = page.getByRole("button", { name: /new organization|منظمة جديدة/i });
    await expect(newOrgBtn).toBeVisible({ timeout: 5_000 });
    await newOrgBtn.click();

    const legalNameInput = page.locator("#org-legal-name");
    await expect(legalNameInput).toBeVisible({ timeout: 5_000 });
    await legalNameInput.fill(orgLegalName);

    const orgDisplayNameInput = page.locator("#org-display-name");
    await orgDisplayNameInput.fill(orgDisplayName);

    const orgPhoneInput = page.locator("#org-phone");
    if (await orgPhoneInput.isVisible()) {
      await orgPhoneInput.fill("+971401234567");
    }

    const orgEmailInput = page.locator("#org-email");
    if (await orgEmailInput.isVisible()) {
      await orgEmailInput.fill(`info.${uniqueTimestamp}@almansoor.ae`);
    }

    const submitOrgBtn = page.locator("form").getByRole("button", { name: /create|حفظ|إضافة/i });
    await submitOrgBtn.click();

    await page.waitForURL((url) => url.pathname.includes("/party-kernel/parties/"), {
      timeout: 15_000,
    });
    createdOrgId = page.url().split("/").pop() || "";
    expect(createdOrgId).toBeTruthy();

    // Verify distinct displayName and legalName exist in profile response
    const orgProfileRes = await page.request.get(
      `http://localhost:5179/api/v1/Parties/${createdOrgId}/profile`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    expect(orgProfileRes.status()).toBe(200);
    const orgProfileJson = await orgProfileRes.json();
    expect(orgProfileJson.displayName).toBe(orgDisplayName);
    expect(orgProfileJson.legalName).toBe(orgLegalName);

    // ── Step 3: Create Person ─────────────────────────────────────────────────
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    const newPersonBtn = page.getByRole("button", { name: /new person|شخص جديد/i });
    await expect(newPersonBtn).toBeVisible({ timeout: 5_000 });
    await newPersonBtn.click();

    const fullNameInput = page.locator("#person-full-name");
    await expect(fullNameInput).toBeVisible({ timeout: 5_000 });
    await fullNameInput.fill(personFullName);

    const personPhoneInput = page.locator("#person-phone");
    if (await personPhoneInput.isVisible()) {
      await personPhoneInput.fill("+971501234567");
    }

    const personEmailInput = page.locator("#person-email");
    if (await personEmailInput.isVisible()) {
      await personEmailInput.fill(`amira.${uniqueTimestamp}@example.com`);
    }

    const submitPersonBtn = page.locator("form").getByRole("button", { name: /create|حفظ|إضافة/i });
    await submitPersonBtn.click();

    await page.waitForURL(
      (url) =>
        url.pathname.includes("/party-kernel/parties/") && !url.pathname.includes(createdOrgId),
      { timeout: 15_000 }
    );
    createdPersonId = page.url().split("/").pop() || "";
    expect(createdPersonId).toBeTruthy();
    await page.waitForLoadState("networkidle");

    // ── Step 4: Person Optimistic Concurrency (409 Conflict -> Refresh -> Retry) ──
    const editNameBtn = page.getByRole("button", { name: /edit name|تعديل الاسم/i });
    await expect(editNameBtn).toBeVisible({ timeout: 10_000 });
    await editNameBtn.click();

    const editFullNameInput = page.locator("#edit-party-fullname");
    await expect(editFullNameInput).toBeVisible({ timeout: 5_000 });

    // Fetch current Person rowVersion and execute an out-of-band concurrent update
    // while the modal is open so the UI's cached rowVersion becomes stale
    const beforeConflictProfile = await (
      await page.request.get(`http://localhost:5179/api/v1/Parties/${createdPersonId}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ).json();
    expect(beforeConflictProfile.rowVersion).toBeTruthy();

    const concurrentUpdateRes = await page.request.put(
      `http://localhost:5179/api/v1/Parties/people/${createdPersonId}`,
      {
        headers: mutationHeaders(accessToken!),
        data: {
          partyId: createdPersonId,
          fullName: `${personFullName} ConcurrentWriter`,
          displayName: `Amira Concurrent ${uniqueTimestamp}`,
          rowVersion: beforeConflictProfile.rowVersion,
        },
      }
    );
    expect([200, 204]).toContain(concurrentUpdateRes.status());

    // Now submit the open EditPartyDialog (which holds the stale rowVersion in profileQuery.data)
    await editFullNameInput.fill(`${personFullName} StaleAttempt`);
    const editDisplayNameInput = page.locator("#edit-party-name");
    await editDisplayNameInput.fill(`Amira Stale ${uniqueTimestamp}`);

    const stalePutPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/Parties/people/${createdPersonId}`) &&
        res.request().method() === "PUT"
    );
    const saveBtn = page.locator("form").getByRole("button", { name: /save|حفظ/i });
    await saveBtn.click();

    const stalePutRes = await stalePutPromise;
    expect(stalePutRes.status()).toBe(409);

    // Verify inline conflict error banner remains visible inside EditPartyDialog even after profile refetch
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("form").getByText(/changed after it was read|modified by another|conflict/i)
    ).toBeVisible({ timeout: 5_000 });

    // Re-submit with the freshly refetched rowVersion and verify 200/204
    const finalPersonFullName = `${personFullName} Updated`;
    const finalPersonDisplayName = `Amira ${uniqueTimestamp}`;
    await editFullNameInput.fill(finalPersonFullName);
    await editDisplayNameInput.fill(finalPersonDisplayName);

    const retryPutPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/Parties/people/${createdPersonId}`) &&
        res.request().method() === "PUT"
    );
    await saveBtn.click();
    const retryPutRes = await retryPutPromise;
    expect([200, 204]).toContain(retryPutRes.status());
    await page.waitForLoadState("networkidle");

    // Verify updated name appears on profile
    await expect(page.locator(`text=${finalPersonDisplayName}`).first()).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 5: Contact Points Tab Lifecycle & Idempotency ────────────────────
    const contactsTab = page
      .locator("[role='tab'][value='contacts'], [role='tab'][data-value='contacts']")
      .or(page.getByRole("tab", { name: /contact methods|contacts|وسائل التواصل/i }))
      .first();
    await contactsTab.click();
    await page.waitForLoadState("networkidle");

    const addContactBtn = page
      .getByRole("button", { name: /add contact|إضافة جهة اتصال/i })
      .first();
    await expect(addContactBtn).toBeVisible({ timeout: 5_000 });
    await addContactBtn.click();

    const contactValInput = page.locator("#contact-val");
    await expect(contactValInput).toBeVisible({ timeout: 5_000 });
    await contactValInput.fill("+971509998888");

    const submitContactBtn = page.locator("form").getByRole("button", { name: /save|add|حفظ/i });
    await submitContactBtn.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=+971509998888")).toBeVisible({ timeout: 10_000 });

    // Verify ContactPoint Idempotency-Key behavior + Update + Delete against live runtime
    const idemKey = `e2e-idem-${uniqueTimestamp}`;
    const idemReq1 = await page.request.post("http://localhost:5179/api/v1/contact-points", {
      headers: mutationHeaders(accessToken!, { "Idempotency-Key": idemKey }),
      data: {
        partyId: createdPersonId,
        type: "Email",
        value: `idempotent.${uniqueTimestamp}@example.com`,
        isPrimary: false,
      },
    });
    expect([200, 201]).toContain(idemReq1.status());
    const idemBody1 = await idemReq1.json();
    const idemContactId = typeof idemBody1 === "string" ? idemBody1 : idemBody1.id;
    expect(idemContactId).toBeTruthy();

    // Same Idempotency-Key + identical payload -> returns identical ID without duplicate
    const idemReq2 = await page.request.post("http://localhost:5179/api/v1/contact-points", {
      headers: mutationHeaders(accessToken!, { "Idempotency-Key": idemKey }),
      data: {
        partyId: createdPersonId,
        type: "Email",
        value: `idempotent.${uniqueTimestamp}@example.com`,
        isPrimary: false,
      },
    });
    expect([200, 201]).toContain(idemReq2.status());
    const idemBody2 = await idemReq2.json();
    expect(idemBody2).toEqual(idemBody1);

    // Same Idempotency-Key + different payload -> 409 Conflict
    const idemMismatch = await page.request.post("http://localhost:5179/api/v1/contact-points", {
      headers: mutationHeaders(accessToken!, { "Idempotency-Key": idemKey }),
      data: {
        partyId: createdPersonId,
        type: "Email",
        value: `different.${uniqueTimestamp}@example.com`,
        isPrimary: false,
      },
    });
    expect(idemMismatch.status()).toBe(409);

    // ContactPoint Update (PUT /api/v1/contact-points/{id}) and Delete (DELETE /api/v1/contact-points/{id})
    const updateContactRes = await page.request.put(
      `http://localhost:5179/api/v1/contact-points/${idemContactId}`,
      {
        headers: mutationHeaders(accessToken!),
        data: {
          id: idemContactId,
          partyId: createdPersonId,
          type: "Email",
          value: `updated.${uniqueTimestamp}@example.com`,
          isPrimary: true,
        },
      }
    );
    expect([200, 204]).toContain(updateContactRes.status());

    const deleteContactRes = await page.request.delete(
      `http://localhost:5179/api/v1/contact-points/${idemContactId}`,
      {
        headers: mutationHeaders(accessToken!),
      }
    );
    expect([200, 204]).toContain(deleteContactRes.status());

    // ── Step 6: Roles Tab Lifecycle ───────────────────────────────────────────
    const rolesTab = page
      .locator("[role='tab'][value='roles'], [role='tab'][data-value='roles']")
      .or(page.getByRole("tab", { name: /roles|الأدوار/i }))
      .first();
    await rolesTab.click();
    await page.waitForLoadState("networkidle");

    const addRoleBtn = page
      .getByRole("button", { name: /assign role|add role|تعيين دور|إضافة دور/i })
      .first();
    await expect(addRoleBtn).toBeVisible({ timeout: 5_000 });
    await addRoleBtn.click();

    const submitRoleBtn = page
      .locator("form")
      .getByRole("button", { name: /save|assign role|حفظ|إضافة/i });
    await submitRoleBtn.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Customer").first()).toBeVisible({ timeout: 10_000 });

    // ── Step 7: Relationships Tab Lifecycle via Universal PartyPicker ─────────
    const relsTab = page
      .locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']")
      .or(page.getByRole("tab", { name: /relationships|العلاقات/i }))
      .first();
    await relsTab.click();
    await page.waitForLoadState("networkidle");

    const addRelBtn = page.getByRole("button", { name: /add relationship|إضافة علاقة/i }).first();
    await expect(addRelBtn).toBeVisible({ timeout: 5_000 });
    await addRelBtn.click();

    const pickerTrigger = page
      .locator("[data-testid='party-picker-trigger'], [role='combobox']")
      .first();
    await expect(pickerTrigger).toBeVisible({ timeout: 5_000 });
    await pickerTrigger.click();

    const pickerOption = page
      .locator("[role='option']")
      .filter({ hasText: orgDisplayName })
      .first();
    if (await pickerOption.isVisible({ timeout: 3_000 })) {
      await pickerOption.click();
    } else {
      const pickerSearch = page.locator("[data-testid='party-picker-search-input']");
      if (await pickerSearch.isVisible()) {
        await pickerSearch.fill(uniqueTimestamp);
        await page.waitForTimeout(500);
        await page.locator("[role='option']").first().click();
      }
    }

    const submitRelBtn = page.locator("form").getByRole("button", { name: /save|إضافة|حفظ/i });
    await submitRelBtn.click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Guardian").first()).toBeVisible({ timeout: 10_000 });

    // ── Step 8: Organization Update + Integrity Audit Verification ────────────
    const orgUpdateRes = await page.request.put(
      `http://localhost:5179/api/v1/Parties/${createdOrgId}`,
      {
        headers: mutationHeaders(accessToken!),
        data: {
          id: createdOrgId,
          type: "Organization",
          displayName: `${orgDisplayName} Updated`,
        },
      }
    );
    expect([200, 204]).toContain(orgUpdateRes.status());

    const auditRes = await page.request.get(
      "http://localhost:5179/api/v1/Parties/integrity-audit",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    expect(auditRes.status()).toBe(200);
    const auditBody = await auditRes.json();
    expect(auditBody.missingSubtypeCount ?? 0).toBe(0);
    expect(auditBody.dualSubtypeCount ?? 0).toBe(0);
    expect(auditBody.typeMismatchCount ?? 0).toBe(0);
  });

  test("2. Tenant A/B Multi-Tenant Isolation & Anonymous Guard: Tenant B cannot view or mutate Tenant A records", async ({
    page,
    context,
  }) => {
    // Anonymous guard check (no auth header -> 401)
    if (createdPersonId) {
      const anonRes = await page.request.get(
        `http://localhost:5179/api/v1/Parties/${createdPersonId}/profile`
      );
      expect(anonRes.status()).toBe(401);
    }

    // Clear Tenant A session and log in via real /login UI as Tenant B
    await context.clearCookies();
    await loginViaUi(page, TENANT_ADMINS.beta);

    // Verify Tenant A's created Person and Organization are NOT visible in Tenant B directory
    await expect(page.locator(`text=${personFullName}`)).toHaveCount(0);
    await expect(page.locator(`text=${orgLegalName}`)).toHaveCount(0);

    // Attempt Direct Cross-Tenant Read & Mutation Access as Tenant B (API + Browser UI)
    if (createdPersonId) {
      const tenantBToken = await page.evaluate(() => sessionStorage.getItem("dev_access_token"));
      expect(tenantBToken).toBeTruthy();

      const crossTenantRes = await page.request.get(
        `http://localhost:5179/api/v1/Parties/${createdPersonId}/profile`,
        {
          headers: { Authorization: `Bearer ${tenantBToken}` },
        }
      );
      expect(crossTenantRes.status()).toBe(404);

      const crossTenantPutRes = await page.request.put(
        `http://localhost:5179/api/v1/Parties/people/${createdPersonId}`,
        {
          headers: mutationHeaders(tenantBToken!),
          data: {
            partyId: createdPersonId,
            fullName: "Cross Tenant Tamper",
            displayName: "Cross Tenant Tamper",
            rowVersion: "AAAAAAAAAAAAAAAAAAAAAA==",
          },
        }
      );
      expect(crossTenantPutRes.status()).toBe(404);

      const crossTenantDeleteRes = await page.request.delete(
        `http://localhost:5179/api/v1/Parties/${createdPersonId}`,
        {
          headers: mutationHeaders(tenantBToken!),
        }
      );
      expect(crossTenantDeleteRes.status()).toBe(404);

      await page.goto(`/party-kernel/parties/${createdPersonId}`);
      await expect(page.locator("text=Party Profile Not Found")).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("3. Universal PartyPicker Self-Relationship Guard & Robustness", async ({ page }) => {
    await loginViaUi(page, TENANT_ADMINS.alpha);

    if (!createdPersonId) {
      const firstRow = page.locator("tbody tr, [data-testid='party-row']").first();
      await firstRow.click();
      await page.waitForURL(
        (url) =>
          /\/party-kernel\/parties\/[^/]+$/.test(url.pathname) &&
          !url.pathname.endsWith("/parties"),
        { timeout: 15_000 }
      );
      await page.waitForLoadState("networkidle");
      createdPersonId = page.url().split("/").pop() || "";
    } else {
      await page.goto(`/party-kernel/parties/${createdPersonId}`);
      await page.waitForLoadState("networkidle");
    }

    const relsTab = page
      .locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']")
      .or(page.getByRole("tab", { name: /relationships|العلاقات/i }))
      .first();
    await relsTab.click();

    const addRelBtn = page.getByRole("button", { name: /add relationship|إضافة علاقة/i }).first();
    await addRelBtn.click();

    const manualToggleBtn = page.getByRole("button", {
      name: /enter id manually|إدخال المعرف يدوياً|enterIdManually/i,
    });
    await expect(manualToggleBtn).toBeVisible({ timeout: 5_000 });
    await manualToggleBtn.click();

    const targetInput = page.locator("#rel-target");
    await expect(targetInput).toBeVisible({ timeout: 5_000 });
    await targetInput.fill(createdPersonId);

    const submitBtn = page.locator("form").getByRole("button", { name: /save|إضافة|حفظ/i });
    await submitBtn.click();

    await expect(
      page.locator("text=A contact cannot have a relationship with itself.")
    ).toBeVisible({ timeout: 5_000 });
  });

  test("4. Responsive Mobile Viewport & Arabic RTL Layout Verification", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await loginViaUi(page, TENANT_ADMINS.alpha);

    const header = page.locator("h1").first();
    await expect(header).toBeVisible({ timeout: 10_000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    const langBtn = page.getByRole("button", { name: /change language|تغيير اللغة/i }).first();
    await expect(langBtn).toBeVisible({ timeout: 5_000 });
    await langBtn.click();

    const arOption = page
      .locator("[role='menuitemradio']")
      .filter({ hasText: /العربية/i })
      .first();
    await expect(arOption).toBeVisible({ timeout: 5_000 });
    await arOption.click();
    await page.waitForTimeout(500);

    const isRtl = await page.evaluate(() => {
      return (
        document.documentElement.getAttribute("dir") === "rtl" ||
        document.body.classList.contains("rtl") ||
        getComputedStyle(document.body).direction === "rtl"
      );
    });
    expect(isRtl).toBeTruthy();
  });

  test("5. C1.1 Enterprise Product Polish: Contacts Overview (/party-kernel), Person DOB & Minor Roundtrip, Org TaxId Roundtrip, Directional Relationships, and 150+ Scale Pagination", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginViaUi(page, TENANT_ADMINS.alpha);

    const accessToken = await page.evaluate(() => sessionStorage.getItem("dev_access_token"));
    expect(accessToken).toBeTruthy();

    // ── Step 1: Contacts Overview (/party-kernel) renders without redirect ────
    await page.goto("/party-kernel");
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/party-kernel");

    await expect(page.getByTestId("kpi-total-contacts")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("kpi-people-count")).toBeVisible();
    await expect(page.getByTestId("kpi-organizations-count")).toBeVisible();
    await expect(page.getByTestId("kpi-duplicate-alerts")).toBeVisible();
    await expect(page.getByTestId("recent-contacts-card")).toBeVisible();
    await expect(page.getByTestId("attention-card")).toBeVisible();

    // Clicking People KPI card navigates to filtered Directory
    await page.getByTestId("kpi-people-count").click();
    await page.waitForURL((url) => url.pathname.includes("/party-kernel/parties"), {
      timeout: 15_000,
    });
    await page.waitForLoadState("networkidle");

    // ── Step 2: Person DOB, isMinor & Name Parts Create + Edit Roundtrip ──────
    const c11PersonFullName = `Layla Al-Rashid ${uniqueTimestamp}`;
    const newPersonBtn = page.getByRole("button", { name: /new person|شخص جديد/i });
    await expect(newPersonBtn).toBeVisible({ timeout: 5_000 });
    await newPersonBtn.click();

    await expect(page.locator("#person-full-name")).toBeVisible({ timeout: 5_000 });
    await page.locator("#person-full-name").fill(c11PersonFullName);

    const additionalNamesBtn = page.getByRole("button", {
      name: /additional name|أسماء إضافية/i,
    });
    await expect(additionalNamesBtn).toBeVisible({ timeout: 5_000 });
    await additionalNamesBtn.click();

    await page.locator("#person-given-name").fill("Layla");
    await page.locator("#person-middle-names").fill("Noor");
    await page.locator("#person-family-name").fill("Al-Rashid");
    await page.locator("#person-dob").fill("2012-05-14");
    await page.locator("#person-is-minor").click();

    const submitPersonBtn = page.locator("form").getByRole("button", { name: /create|حفظ|إضافة/i });
    await submitPersonBtn.click();

    await page.waitForURL(
      (url) =>
        /\/party-kernel\/parties\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/parties"),
      { timeout: 15_000 }
    );
    const c11PersonId = page.url().split("/").pop() || "";
    expect(c11PersonId).toBeTruthy();
    await page.waitForLoadState("networkidle");

    // Authorized DOB must render formatted date, never privacy-restricted banner
    await expect(page.locator("text=Date of birth protected under privacy policy")).toHaveCount(0);
    await expect(page.locator("text=/2012/").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=Layla").first()).toBeVisible();
    await expect(page.locator("text=Noor").first()).toBeVisible();
    await expect(page.locator("text=Al-Rashid").first()).toBeVisible();

    // Edit Person DOB roundtrip via EditPartyDialog
    const editPersonBtn = page.getByRole("button", { name: /edit name|تعديل الاسم/i });
    await expect(editPersonBtn).toBeVisible({ timeout: 5_000 });
    await editPersonBtn.click();

    const editDobInput = page.locator("#edit-person-dob");
    await expect(editDobInput).toBeVisible({ timeout: 5_000 });
    await expect(editDobInput).toHaveValue("2012-05-14");
    await editDobInput.fill("2011-08-20");

    const personPutPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/Parties/people/${c11PersonId}`) &&
        res.request().method() === "PUT"
    );
    await page
      .locator("form")
      .getByRole("button", { name: /save|حفظ/i })
      .click();
    const personPutRes = await personPutPromise;
    expect([200, 204]).toContain(personPutRes.status());
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=/2011/").first()).toBeVisible({ timeout: 10_000 });

    // ── Step 3: Organization TaxId & LegalName Create + Edit Roundtrip ────────
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    const c11OrgLegalName = `Emirates Falcon Academy LLC ${uniqueTimestamp}`;
    const c11OrgDisplayName = `Falcon Academy ${uniqueTimestamp}`;
    const c11OrgTaxId = `AE-TRN-${uniqueTimestamp}`;

    const newOrgBtn = page.getByRole("button", { name: /new organization|منظمة جديدة/i });
    await expect(newOrgBtn).toBeVisible({ timeout: 5_000 });
    await newOrgBtn.click();

    await expect(page.locator("#org-legal-name")).toBeVisible({ timeout: 5_000 });
    await page.locator("#org-legal-name").fill(c11OrgLegalName);
    await page.locator("#org-display-name").fill(c11OrgDisplayName);
    await page.locator("#org-tax-id").fill(c11OrgTaxId);

    await page
      .locator("form")
      .getByRole("button", { name: /create|حفظ|إضافة/i })
      .click();
    await page.waitForURL(
      (url) =>
        /\/party-kernel\/parties\/[^/]+$/.test(url.pathname) &&
        !url.pathname.endsWith("/parties") &&
        !url.pathname.endsWith(c11PersonId),
      { timeout: 15_000 }
    );
    const c11OrgId = page.url().split("/").pop() || "";
    expect(c11OrgId).toBeTruthy();
    await page.waitForLoadState("networkidle");

    await expect(page.locator(`text=${c11OrgTaxId}`).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${c11OrgLegalName}`).first()).toBeVisible();

    // Edit Organization LegalName and TaxId via EditPartyDialog
    const editOrgBtn = page.getByRole("button", { name: /edit name|تعديل الاسم/i });
    await editOrgBtn.click();

    const editLegalInput = page.locator("#edit-org-legal-name");
    const editTaxInput = page.locator("#edit-org-tax-id");
    await expect(editLegalInput).toBeVisible({ timeout: 5_000 });
    await expect(editLegalInput).toHaveValue(c11OrgLegalName);
    await expect(editTaxInput).toHaveValue(c11OrgTaxId);

    const updatedTaxId = `AE-TRN-UPD-${uniqueTimestamp}`;
    const updatedLegalName = `Emirates Falcon Sports LLC ${uniqueTimestamp}`;
    await editLegalInput.fill(updatedLegalName);
    await editTaxInput.fill(updatedTaxId);

    const orgPutPromise = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/Parties/organizations/${c11OrgId}`) &&
        res.request().method() === "PUT"
    );
    await page
      .locator("form")
      .getByRole("button", { name: /save|حفظ/i })
      .click();
    const orgPutRes = await orgPutPromise;
    expect([200, 204]).toContain(orgPutRes.status());
    await page.waitForLoadState("networkidle");

    await expect(page.locator(`text=${updatedTaxId}`).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(`text=${updatedLegalName}`).first()).toBeVisible();

    // ── Step 4: Guardian Org Guard + Direction-Aware Person-to-Person Navigation ──
    const orgRelsTab = page
      .locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']")
      .or(page.getByRole("tab", { name: /relationships|العلاقات/i }))
      .first();
    await orgRelsTab.click();
    await page.waitForLoadState("networkidle");

    const addOrgRelBtn = page
      .getByRole("button", { name: /add relationship|إضافة علاقة/i })
      .first();
    await addOrgRelBtn.click();

    const manualToggleBtn = page.getByRole("button", {
      name: /enter id manually|إدخال المعرف يدوياً|enterIdManually/i,
    });
    await expect(manualToggleBtn).toBeVisible({ timeout: 5_000 });
    await manualToggleBtn.click();

    await page.locator("#rel-target").fill(c11PersonId);
    await page
      .locator("form")
      .getByRole("button", { name: /save|إضافة|حفظ/i })
      .click();

    // Client-side party-type compatibility guard blocks Guardian on Organization
    await expect(page.getByRole("alert")).toContainText(
      /Guardian relationships can only be established between Person contacts/i
    );
    await page.getByRole("button", { name: /cancel|إلغاء/i }).click();

    // Create or use second Person for valid Person-to-Person Guardian relationship
    let secondPersonId = createdPersonId;
    if (!secondPersonId) {
      const createP2Res = await page.request.post("http://localhost:5179/api/v1/Parties/people", {
        headers: mutationHeaders(accessToken!),
        data: {
          fullName: `Tariq Al-Rashid ${uniqueTimestamp}`,
          displayName: `Tariq ${uniqueTimestamp}`,
        },
      });
      expect([200, 201]).toContain(createP2Res.status());
      const p2Body = await createP2Res.json();
      secondPersonId = typeof p2Body === "string" ? p2Body : p2Body.id;
    }

    await page.goto(`/party-kernel/parties/${c11PersonId}`);
    await page.waitForLoadState("networkidle");

    const personRelsTab = page
      .locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']")
      .or(page.getByRole("tab", { name: /relationships|العلاقات/i }))
      .first();
    await personRelsTab.click();
    await page.waitForLoadState("networkidle");

    await page
      .getByRole("button", { name: /add relationship|إضافة علاقة/i })
      .first()
      .click();
    await page
      .getByRole("button", { name: /enter id manually|إدخال المعرف يدوياً|enterIdManually/i })
      .click();
    await page.locator("#rel-target").fill(secondPersonId);
    await page
      .locator("form")
      .getByRole("button", { name: /save|إضافة|حفظ/i })
      .click();
    await page.waitForLoadState("networkidle");

    // Verify Outbound badge and View Related Contact navigation on source profile
    await expect(page.getByTestId("relationship-direction-badge").first()).toContainText(
      /outbound|صادر/i
    );
    const navBtn = page.getByTestId("relationship-navigate-btn").first();
    await expect(navBtn).toBeVisible();
    await navBtn.click();

    await page.waitForURL((url) => url.pathname.endsWith(`/${secondPersonId}`), {
      timeout: 15_000,
    });
    await page.waitForLoadState("networkidle");

    // Verify Inbound badge on target profile
    const targetRelsTab = page
      .locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']")
      .or(page.getByRole("tab", { name: /relationships|العلاقات/i }))
      .first();
    await targetRelsTab.click();
    await page.waitForLoadState("networkidle");

    await expect(
      page
        .getByTestId("relationship-direction-badge")
        .filter({ hasText: /inbound|وارد/i })
        .first()
    ).toBeVisible({ timeout: 10_000 });

    // ── Step 5: 150+ Contacts Scale, Pagination, and Deep-Page Sub-Resource Hydration ──
    const countRes = await page.request.get(
      "http://localhost:5179/api/v1/Parties?pageNumber=1&pageSize=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    expect(countRes.status()).toBe(200);
    const countJson = await countRes.json();
    const currentTotal = countJson.totalCount ?? 0;

    if (currentTotal < 152) {
      const needed = 152 - currentTotal;
      for (let seq = 1; seq <= needed; seq++) {
        const seedRes = await page.request.post("http://localhost:5179/api/v1/Parties/people", {
          headers: mutationHeaders(accessToken!, {
            "Idempotency-Key": `scale-seed-${uniqueTimestamp}-${seq}`,
          }),
          data: {
            fullName: `Scale Athlete ${seq} ${uniqueTimestamp}`,
            displayName: `Athlete ${seq}`,
          },
        });
        expect([200, 201]).toContain(seedRes.status());
      }
    }

    const postSeedCountRes = await page.request.get(
      "http://localhost:5179/api/v1/Parties?pageNumber=1&pageSize=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    expect(postSeedCountRes.status()).toBe(200);
    const postSeedCountJson = await postSeedCountRes.json();
    expect(postSeedCountJson.totalCount).toBeGreaterThanOrEqual(152);

    // Create the >150th contact with ContactPoint and PartyRole
    const deepCreateRes = await page.request.post("http://localhost:5179/api/v1/Parties/people", {
      headers: mutationHeaders(accessToken!, {
        "Idempotency-Key": `deep-contact-${uniqueTimestamp}`,
      }),
      data: {
        fullName: `Zayd Al-Nasser Deep150 ${uniqueTimestamp}`,
        displayName: `Zayd Deep150 ${uniqueTimestamp}`,
        dateOfBirth: "2008-11-03",
        isMinor: true,
      },
    });
    expect([200, 201]).toContain(deepCreateRes.status());
    const deepBody = await deepCreateRes.json();
    const deepPersonId = typeof deepBody === "string" ? deepBody : deepBody.id;
    expect(deepPersonId).toBeTruthy();

    const deepEmail = `zayd.deep150.${uniqueTimestamp}@example.com`;
    const deepCpRes = await page.request.post("http://localhost:5179/api/v1/contact-points", {
      headers: mutationHeaders(accessToken!),
      data: {
        partyId: deepPersonId,
        type: "Email",
        value: deepEmail,
        isPrimary: true,
      },
    });
    expect([200, 201]).toContain(deepCpRes.status());

    const deepRoleRes = await page.request.post("http://localhost:5179/api/v1/party-roles", {
      headers: mutationHeaders(accessToken!),
      data: {
        partyId: deepPersonId,
        roleType: "Customer",
      },
    });
    expect([200, 201]).toContain(deepRoleRes.status());

    // Verify 150+ pagination in Directory
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    const nextBtn = page.getByRole("button", { name: /^next$|^التالي$/i });
    await expect(nextBtn).toBeEnabled({ timeout: 10_000 });
    await nextBtn.click();
    await page.waitForLoadState("networkidle");

    // Open the >150th contact profile and verify sub-resources hydrate via ?partyId= without 100-row truncation
    await page.goto(`/party-kernel/parties/${deepPersonId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=/2008/").first()).toBeVisible({ timeout: 10_000 });

    const deepContactsTab = page
      .locator("[role='tab'][value='contacts'], [role='tab'][data-value='contacts']")
      .or(page.getByRole("tab", { name: /contact methods|contacts|وسائل التواصل/i }))
      .first();
    await deepContactsTab.click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${deepEmail}`)).toBeVisible({ timeout: 10_000 });

    const deepRolesTab = page
      .locator("[role='tab'][value='roles'], [role='tab'][data-value='roles']")
      .or(page.getByRole("tab", { name: /roles|الأدوار/i }))
      .first();
    await deepRolesTab.click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Customer").first()).toBeVisible({ timeout: 10_000 });
  });

  test("Quick Contact Lookup searches the authorized API result and opens its profile", async ({ page }) => {
    await loginViaUi(page, TENANT_ADMINS.alpha);
    const accessToken = await page.evaluate(() => sessionStorage.getItem("dev_access_token"));
    expect(accessToken).toBeTruthy();

    const fullName = `Quick Lookup ${randomUUID()}`;
    let encryptedPartyId = "";
    try {
      const createResponse = await page.request.post(`${PARTY_API_BASE_URL}/v1/Parties/people`, {
        headers: mutationHeaders(accessToken!, { "Idempotency-Key": `quick-lookup-${randomUUID()}` }),
        data: { fullName },
      });
      expect([200, 201]).toContain(createResponse.status());
      encryptedPartyId = (await createResponse.json()).id;
      expect(encryptedPartyId).toBeTruthy();

      await page.goto("/party-kernel/parties");
      await expect(page.getByTestId("open-party-picker-btn")).toBeVisible();
      await page.getByTestId("open-party-picker-btn").click();

      const searchInput = page.locator("[role='combobox'][aria-controls='quick-lookup-listbox']");
      await expect(searchInput).toBeVisible();
      const lookupResponsePromise = page.waitForResponse((response) =>
        response.url().includes("/api/v1/Parties/people/lookup") &&
        response.request().method() === "GET"
      );
      await searchInput.fill(fullName);
      const lookupResponse = await lookupResponsePromise;
      expect(lookupResponse.status()).toBe(200);
      const lookupBody = await lookupResponse.json();
      expect(lookupBody.items.some((item: { id: string }) => item.id === encryptedPartyId)).toBe(true);

      const matchingOption = page.getByRole("option").filter({ hasText: fullName });
      await expect(matchingOption).toBeVisible();
      await matchingOption.click();
      await page.waitForURL((url) => url.pathname.endsWith(`/party-kernel/parties/${encryptedPartyId}`));
      await expect(page.getByText(fullName, { exact: true }).first()).toBeVisible();
    } finally {
      if (encryptedPartyId) {
        const deleteResponse = await page.request.delete(
          `${PARTY_API_BASE_URL}/v1/Parties/${encryptedPartyId}`,
          { headers: mutationHeaders(accessToken!) }
        );
        expect([200, 204]).toContain(deleteResponse.status());
      }
    }
  });
});
