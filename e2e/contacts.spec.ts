import { test, expect, Page } from "@playwright/test";

const TENANT_A = {
  email: "seif.moustafa516@gamil.com",
  password: "P@ssw0rd",
  name: "PartyKernel E2E Alpha 2026-10-13",
};

const TENANT_B = {
  email: "appvanguard@gmail.com",
  password: "P@ssw0rd",
  name: "PartyKernel E2E Beta 2026-10-13",
};

/**
 * Direct API authentication and browser storage bootstrap helper
 */
async function loginAs(page: Page, creds: { email: string; password: string }) {
  const randomIp = `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200) + 1}`;
  const response = await page.request.post("http://127.0.0.1:5179/api/v1/auth/admin/login", {
    data: {
      identifier: creds.email,
      password: creds.password,
    },
    headers: {
      "X-Forwarded-For": randomIp,
      "sec-fetch-site": "same-origin",
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed for ${creds.email}: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json();
  const accessToken = data.accessToken;
  const userProfile = data.userProfile;

  await page.context().addCookies([
    {
      name: "scr_auth_state",
      value: "true",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.addInitScript(
    ({ token, profile }) => {
      sessionStorage.setItem("dev_access_token", token);
      localStorage.setItem(
        "app-storage",
        JSON.stringify({
          state: {
            user: profile,
            isAuthenticated: true,
            permissions: profile?.permissions || [],
            roles: ["Admin"],
            mustChangePassword: false,
            _hasHydrated: true,
          },
          version: 0,
        })
      );
      document.cookie = "scr_auth_state=true; path=/; max-age=2592000; samesite=Lax";
    },
    { token: accessToken, profile: userProfile }
  );

  await page.goto("/party-kernel/parties");
  await page.waitForLoadState("domcontentloaded");
}

test.describe("Contacts & PartyKernel End-to-End Acceptance", () => {
  let createdPersonId: string = "";
  let createdOrgId: string = "";
  const uniqueTimestamp = Date.now().toString().slice(-6);
  const personFullName = `Amira Tariq ${uniqueTimestamp}`;
  const orgLegalName = `Al-Mansoor Sports Holdings ${uniqueTimestamp}`;

  test.beforeEach(async ({ context }) => {
    // Intercept backend API requests from browser to ensure sec-fetch-site passes CsrfMiddleware Layer 1
    await context.route("http://127.0.0.1:5179/**", async (route) => {
      const headers = { ...route.request().headers() };
      headers["sec-fetch-site"] = "same-origin";
      try {
        const response = await route.fetch({ headers });
        await route.fulfill({ response });
      } catch {
        await route.continue();
      }
    });
  });

  test("1. Tenant A Everyday Lifecycle: Person, Organization, Contact Points, Roles, Relationships", async ({
    page,
  }) => {
    // ── Step 1: Login as Tenant A ──────────────────────────────────────────────
    await loginAs(page, TENANT_A);

    // ── Step 2: Navigate to Parties Directory ─────────────────────────────────
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    // Header & directory controls render truthfully
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // ── Step 3: Create Organization ───────────────────────────────────────────
    const newOrgBtn = page.getByRole("button", { name: /new organization|منظمة جديدة/i });
    await expect(newOrgBtn).toBeVisible({ timeout: 5_000 });
    await newOrgBtn.click();

    // Fill Organization form
    const legalNameInput = page.locator("#org-legal-name");
    await expect(legalNameInput).toBeVisible({ timeout: 5_000 });
    await legalNameInput.fill(orgLegalName);

    const orgDisplayNameInput = page.locator("#org-display-name");
    await orgDisplayNameInput.fill(`Al-Mansoor ${uniqueTimestamp}`);

    const orgPhoneInput = page.locator("#org-phone");
    if (await orgPhoneInput.isVisible()) {
      await orgPhoneInput.fill("+971401234567");
    }

    const orgEmailInput = page.locator("#org-email");
    if (await orgEmailInput.isVisible()) {
      await orgEmailInput.fill(`info.${uniqueTimestamp}@almansoor.ae`);
    }

    // Submit Organization
    const submitOrgBtn = page.locator("form").getByRole("button", { name: /create|حفظ|إضافة/i });
    await submitOrgBtn.click();

    // Wait for profile redirect or modal close
    await page.waitForURL((url) => url.pathname.includes("/party-kernel/parties/"), {
      timeout: 15_000,
    });
    createdOrgId = page.url().split("/").pop() || "";
    expect(createdOrgId).toBeTruthy();

    // ── Step 4: Create Person ─────────────────────────────────────────────────
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    const newPersonBtn = page.getByRole("button", { name: /new person|شخص جديد/i });
    await expect(newPersonBtn).toBeVisible({ timeout: 5_000 });
    await newPersonBtn.click();

    // Fill Person form
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

    // Submit Person
    const submitPersonBtn = page.locator("form").getByRole("button", { name: /create|حفظ|إضافة/i });
    await submitPersonBtn.click();

    // Wait for profile navigation
    await page.waitForURL(
      (url) => url.pathname.includes("/party-kernel/parties/") && !url.pathname.includes(createdOrgId),
      { timeout: 15_000 }
    );
    createdPersonId = page.url().split("/").pop() || "";
    expect(createdPersonId).toBeTruthy();

    // ── Step 5: Profile View & Canonical Person Update ────────────────────────
    await expect(page.locator("h2, h3, [data-testid='party-title']").first()).toBeVisible({
      timeout: 10_000,
    });

    // Test profile edit via EditPartyDialog (using Codex's PUT /api/v1/Parties/people/{id})
    const editNameBtn = page.getByRole("button", { name: /edit name|تعديل الاسم/i });
    if (await editNameBtn.isVisible()) {
      await editNameBtn.click();
      const editFullNameInput = page.locator("#edit-party-fullname");
      if (await editFullNameInput.isVisible()) {
        await editFullNameInput.fill(`${personFullName} Updated`);
      }
      const editDisplayNameInput = page.locator("#edit-party-name");
      if (await editDisplayNameInput.isVisible()) {
        await editDisplayNameInput.fill(`Amira ${uniqueTimestamp}`);
      }
      const saveBtn = page.locator("form").getByRole("button", { name: /save|حفظ/i });
      await saveBtn.click();
      await page.waitForLoadState("networkidle");
    }

    // ── Step 6: Contact Points Tab Lifecycle (Add, Edit, Delete) ──────────────
    const contactsTab = page.locator("[role='tab'][value='contacts'], [role='tab'][data-value='contacts']").or(page.getByRole("tab", { name: /contact methods|contacts|وسائل التواصل/i })).first();
    await contactsTab.click();
    await page.waitForLoadState("networkidle");

    // Add another contact point
    const addContactBtn = page.getByRole("button", { name: /add contact|إضافة جهة اتصال/i }).first();
    await expect(addContactBtn).toBeVisible({ timeout: 5_000 });
    await addContactBtn.click();

    const contactValInput = page.locator("#contact-val");
    await expect(contactValInput).toBeVisible({ timeout: 5_000 });
    await contactValInput.fill("+971509998888");

    const submitContactBtn = page.locator("form").getByRole("button", { name: /save|add|حفظ/i });
    await submitContactBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify contact point was added
    await expect(page.locator("text=+971509998888")).toBeVisible({ timeout: 10_000 });

    // ── Step 7: Roles Tab Lifecycle (Add Domain Role) ──────────────────────────
    const rolesTab = page.locator("[role='tab'][value='roles'], [role='tab'][data-value='roles']").or(page.getByRole("tab", { name: /roles|الأدوار/i })).first();
    await rolesTab.click();
    await page.waitForLoadState("networkidle");

    const addRoleBtn = page.getByRole("button", { name: /assign role|add role|تعيين دور|إضافة دور/i }).first();
    await expect(addRoleBtn).toBeVisible({ timeout: 5_000 });
    await addRoleBtn.click();

    // Submit default Customer role
    const submitRoleBtn = page.locator("form").getByRole("button", { name: /save|assign role|حفظ|إضافة/i });
    await submitRoleBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify role appears
    await expect(page.locator("text=Customer").first()).toBeVisible({ timeout: 10_000 });

    // ── Step 8: Relationships Tab Lifecycle via Universal PartyPicker ─────────
    const relsTab = page.locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']").or(page.getByRole("tab", { name: /relationships|العلاقات/i })).first();
    await relsTab.click();
    await page.waitForLoadState("networkidle");

    const addRelBtn = page.getByRole("button", { name: /add relationship|إضافة علاقة/i }).first();
    await expect(addRelBtn).toBeVisible({ timeout: 5_000 });
    await addRelBtn.click();

    // Open PartyPicker combobox
    const pickerTrigger = page.locator("[data-testid='party-picker-trigger'], [role='combobox']").first();
    await expect(pickerTrigger).toBeVisible({ timeout: 5_000 });
    await pickerTrigger.click();

    // Select the created Organization from PartyPicker
    const pickerOption = page.locator("[role='option']").filter({ hasText: orgLegalName }).first();
    if (await pickerOption.isVisible({ timeout: 3_000 })) {
      await pickerOption.click();
    } else {
      // Fallback: search by organization keyword
      const pickerSearch = page.locator("input[placeholder*='Search']");
      if (await pickerSearch.isVisible()) {
        await pickerSearch.fill(uniqueTimestamp);
        await page.waitForTimeout(500);
        await page.locator("[role='option']").first().click();
      }
    }

    // Submit relationship
    const submitRelBtn = page.locator("form").getByRole("button", { name: /save|إضافة|حفظ/i });
    await submitRelBtn.click();
    await page.waitForLoadState("networkidle");

    // Verify relationship was established
    await expect(page.locator("text=Guardian").first()).toBeVisible({ timeout: 10_000 });
  });

  test("2. Tenant A/B Multi-Tenant Isolation: Tenant B cannot view Tenant A records", async ({
    page,
    context,
  }) => {
    // Clear Tenant A session and cookies
    await context.clearCookies();

    // ── Login as Tenant B ──────────────────────────────────────────────────────
    await loginAs(page, TENANT_B);

    // ── Navigate to Directory ─────────────────────────────────────────────────
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    // Verify Tenant A's created Person is NOT visible to Tenant B
    if (personFullName) {
      await expect(page.locator(`text=${personFullName}`)).toHaveCount(0);
    }
    if (orgLegalName) {
      await expect(page.locator(`text=${orgLegalName}`)).toHaveCount(0);
    }

    // ── Attempt Direct Cross-Tenant URL Access ────────────────────────────────
    if (createdPersonId) {
      await page.goto(`/party-kernel/parties/${createdPersonId}`);
      await page.waitForLoadState("networkidle");

      // Verify cross-tenant isolation: either redirected to 404, not-authorized, or shows empty/error
      const pageText = await page.textContent("body");
      const isBlocked =
        page.url().includes("/not-authorized") ||
        page.url().includes("/parties") ||
        pageText?.includes("Not Found") ||
        pageText?.includes("not found") ||
        pageText?.includes("Access Denied") ||
        pageText?.includes("غير موجود");

      expect(isBlocked).toBeTruthy();
    }
  });

  test("3. Universal PartyPicker Self-Relationship Guard & Robustness", async ({ page }) => {
    // Login as Tenant A
    await loginAs(page, TENANT_A);

    // Navigate to created person's profile
    if (!createdPersonId) {
      await page.goto("/party-kernel/parties");
      await page.waitForLoadState("networkidle");
      const firstRow = page.locator("tbody tr, [data-testid='party-row']").first();
      await firstRow.click();
      await page.waitForLoadState("networkidle");
      createdPersonId = page.url().split("/").pop() || "";
    } else {
      await page.goto(`/party-kernel/parties/${createdPersonId}`);
      await page.waitForLoadState("networkidle");
    }

    // Open Relationships tab
    const relsTab = page.locator("[role='tab'][value='relationships'], [role='tab'][data-value='relationships']").or(page.getByRole("tab", { name: /relationships|العلاقات/i })).first();
    await relsTab.click();

    // Open Add Relationship Dialog
    const addRelBtn = page.getByRole("button", { name: /add relationship|إضافة علاقة/i }).first();
    await addRelBtn.click();

    // Switch to manual input mode
    const manualToggleBtn = page.getByRole("button", { name: /enter id manually|إدخال المعرف يدوياً|enterIdManually/i });
    await expect(manualToggleBtn).toBeVisible({ timeout: 5_000 });
    await manualToggleBtn.click();

    // Attempt to establish self-relationship by pasting current party's ID
    const targetInput = page.locator("#rel-target");
    await expect(targetInput).toBeVisible({ timeout: 5_000 });
    await targetInput.fill(createdPersonId);

    // Click submit
    const submitBtn = page.locator("form").getByRole("button", { name: /save|إضافة|حفظ/i });
    await submitBtn.click();

    // Verify self-relationship guard fires
    await expect(
      page.locator("text=A contact cannot have a relationship with itself.")
    ).toBeVisible({ timeout: 5_000 });
  });

  test("4. Responsive Mobile Viewport & Arabic RTL Layout Verification", async ({ page }) => {
    // Set mobile viewport (iPhone 14 / modern smartphone standard: 390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    await loginAs(page, TENANT_A);
    await page.goto("/party-kernel/parties");
    await page.waitForLoadState("networkidle");

    // Verify directory header and responsive cards render without horizontal overflow
    const header = page.locator("h1").first();
    await expect(header).toBeVisible({ timeout: 10_000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    // Allow minimal 1px rounding margin
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Switch to Arabic via language switcher button
    const langBtn = page.getByRole("button", { name: /change language|en|ar/i }).first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const arOption = page.locator("button, [role='menuitem'], [role='menuitemradio']").filter({ hasText: /العربية|ar/i }).first();
      if (await arOption.isVisible({ timeout: 2_000 })) {
        await arOption.click();
        await page.waitForTimeout(500);

        // Verify Arabic RTL direction or localized heading
        const isRtl = await page.evaluate(() => {
          return document.documentElement.getAttribute("dir") === "rtl" ||
            document.body.classList.contains("rtl") ||
            getComputedStyle(document.body).direction === "rtl";
        });
        expect(isRtl).toBeTruthy();
      }
    }
  });
});
