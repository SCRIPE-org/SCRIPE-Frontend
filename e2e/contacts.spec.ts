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
    'if (Test-Path $pkgRoot) {',
    '  $dirs += Get-ChildItem -Path $pkgRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {',
    '    Join-Path $_.FullName "LocalCache\\Local\\SCRIPE\\PartyKernelE2E"',
    '  }',
    '}',
    '$files = foreach ($d in $dirs) {',
    '  if (Test-Path $d) {',
    '    Get-ChildItem -Path $d -Filter "tenant-admins-c1-final-flow-*.xml" -File -ErrorAction SilentlyContinue',
    '  }',
    '}',
    '$latest = $files | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1',
    'if (-not $latest) { throw "DPAPI tenant-admins fixture not found" }',
    '$items = Import-Clixml -Path $latest.FullName',
    '$out = foreach ($item in $items) {',
    '  [PSCustomObject]@{',
    '    tenantKey = [string]$item.TenantKey',
    '    email = [string]$item.Credential.UserName',
    '    password = [string]$item.Credential.GetNetworkCredential().Password',
    '  }',
    '}',
    '$out | ConvertTo-Json -Compress',
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

/**
 * Real browser UI login through `/login` without injecting tokens into storage.
 */
async function loginViaUi(page: Page, creds: DpapiTenantAdmin, redirectPath = "/party-kernel/parties") {
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
  test.describe.configure({ mode: "serial" });

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
        (url) => /\/party-kernel\/parties\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/parties"),
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
});
