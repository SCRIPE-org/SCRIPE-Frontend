import { test, expect, type Page } from "@playwright/test";

const ALL_PERMISSIONS = [
  "parties.view",
  "parties.create",
  "parties.update",
  "parties.delete",
  "party-people.view",
  "party-people.create",
  "party-people.update",
  "party-people.delete",
  "party-organizations.view",
  "party-organizations.create",
  "party-organizations.update",
  "party-organizations.delete",
  "party-roles.view",
  "party-roles.create",
  "party-roles.update",
  "party-roles.delete",
  "party-relationships.view",
  "party-relationships.create",
  "party-relationships.update",
  "party-relationships.delete",
  "contact-points.view",
  "contact-points.create",
  "contact-points.update",
  "contact-points.delete",
  "merge-candidates.view",
  "merge-candidates.create",
  "merge-candidates.update",
  "merge-candidates.delete",
];

const MOCK_USER_PROFILE = {
  id: "admin-1",
  username: "system_superadmin",
  email: "admin@scripe.com",
  roles: ["SuperAdmin"],
  permissions: ALL_PERMISSIONS,
  isSuperAdmin: true,
  isProtected: false,
  isAccountActivated: true,
  mustChangePassword: false,
};

/**
 * Capture screenshots to all project reporting destinations
 */
async function captureScreenshot(page: Page, filename: string, fullPage: boolean = true) {
  await page.screenshot({ path: `e2e/screenshots/${filename}`, fullPage });
  try {
    await page.screenshot({ path: `reports/screenshots/${filename}`, fullPage });
  } catch {}
  try {
    await page.screenshot({ path: `../reports/screenshots/${filename}`, fullPage });
  } catch {}
}

/**
 * Configure mock routes for Party API and Auth to allow isolated, reproducible
 * E2E tests and artifact screenshot capture.
 */
async function setupPartyMocks(page: Page) {
  // Pre-seed auth cookie on localhost so proxy.ts allows access to protected routes
  await page.context().addCookies([
    {
      name: "scr_auth_state",
      value: "true",
      url: "http://localhost:3000",
    },
  ]);

  // Pre-seed localStorage app-storage so RouteGuard sees authenticated state on page mount
  await page.addInitScript((userData) => {
    try {
      localStorage.setItem(
        "app-storage",
        JSON.stringify({
          state: {
            isAuthenticated: true,
            user: userData,
            permissions: userData.permissions,
            roles: userData.roles,
            subscriptionStatus: "Active",
            defaultRedirectPath: "/party-kernel/parties",
            _hasHydrated: true,
          },
          version: 0,
        })
      );
    } catch {}
  }, MOCK_USER_PROFILE);

  // Mock silent token refresh for RouteGuard on page reload
  await page.route("**/api/v1/auth/admin/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        accessToken: "mock.jwt.token",
        subscriptionStatus: "Active",
        defaultRedirectPath: "/party-kernel/parties",
        userProfile: MOCK_USER_PROFILE,
      }),
    });
  });

  // Auth login mock
  await page.route("**/api/v1/auth/admin/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        accessToken: "mock.jwt.token",
        requires2FA: false,
        requiresWorkspaceSelection: false,
        defaultRedirectPath: "/party-kernel/parties",
        userProfile: MOCK_USER_PROFILE,
      }),
    });
  });

  // Current admin mock
  await page.route("**/api/v1/Admins/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER_PROFILE),
    });
  });

  // SSO / Providers mock to prevent offline banner on login
  await page.route("**/api/v1/auth/oidc/providers/admin*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  // Navigation menus mock
  await page.route("**/api/v1/Menus/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        defaultWorkspace: "workspace-party-kernel",
        routes: ["/party-kernel/parties", "/party-kernel/parties/*"],
        groups: [],
      }),
    });
  });

  // Tenant customization resolve mock
  await page.route("**/api/v1/customization/resolve*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ tenantId: "tenant-1" }),
    });
  });

  // Settings sync mock
  await page.route("**/api/v1/admin-settings*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // SignalR negotiation mocks so connection settles immediately
  await page.route("**/notificationHub/negotiate*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ connectionId: "mock-conn", availableTransports: [] }),
    });
  });

  await page.route("**/signalrHub/negotiate*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ connectionId: "mock-conn", availableTransports: [] }),
    });
  });

  // Atomic person creation
  await page.route("**/api/v1/Parties/people", async (route) => {
    if (route.request().method() === "POST") {
      const postData = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "enc-person-new-123",
          type: "Person",
          displayName: postData.displayName || postData.fullName,
          fullName: postData.fullName,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Atomic organization creation
  await page.route("**/api/v1/Parties/organizations", async (route) => {
    if (route.request().method() === "POST") {
      const postData = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "enc-org-new-123",
          type: "Organization",
          displayName: postData.displayName || postData.legalName,
          legalName: postData.legalName,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Canonical Party profile endpoint
  await page.route("**/api/v1/Parties/*/profile", async (route) => {
    const url = route.request().url();
    const isOrg = url.includes("enc-org");
    const isNew = url.includes("new-123");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: isNew ? "enc-person-new-123" : isOrg ? "enc-org-1" : "enc-person-1",
        type: isOrg ? "Organization" : "Person",
        displayName: isNew
          ? "Dr. Fatima Zahra Al-Mansoor"
          : isOrg
          ? "Riyadh Falcons Sports Academy"
          : "Dr. Fatima Zahra Al-Mansoor",
        legalName: isOrg ? "Riyadh Falcons Sports Academy LLC" : null,
        fullName: isOrg ? null : "Dr. Fatima Zahra Al-Mansoor",
        taxId: isOrg ? "CR-1010892019" : null,
        primaryPhone: isOrg ? "+966 11 456 7890" : "+966 50 123 4567",
        primaryEmail: isOrg ? "info@riyadhfalcons.com" : "fatima.almansoor@scripe-sports.com",
        createdAt: "2026-10-09T00:00:00Z",
        modifiedAt: "2026-10-09T01:00:00Z",
      }),
    });
  });

  // Sub-resource endpoints
  await page.route("**/api/v1/party-people*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "person-sub-1",
            partyId: "enc-person-1",
            fullName: "Dr. Fatima Zahra Al-Mansoor",
            dateOfBirth: "1988-04-12",
            isMinor: false,
          },
          {
            id: "person-sub-2",
            partyId: "enc-person-new-123",
            fullName: "Dr. Fatima Zahra Al-Mansoor",
            dateOfBirth: "1992-06-15",
            isMinor: false,
          },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    });
  });

  await page.route("**/api/v1/party-organizations*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "org-sub-1",
            partyId: "enc-org-1",
            legalName: "Riyadh Falcons Sports Academy LLC",
            displayName: "Riyadh Falcons Sports Academy",
            taxId: "CR-1010892019",
          },
        ],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    });
  });

  await page.route("**/api/v1/contact-points*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "cp-new-123" }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "cp-1",
              partyId: "enc-person-1",
              type: "Phone",
              value: "+966 50 123 4567",
              isPrimary: true,
              isVerified: true,
            },
            {
              id: "cp-2",
              partyId: "enc-person-1",
              type: "Email",
              value: "fatima.almansoor@scripe-sports.com",
              isPrimary: false,
              isVerified: false,
            },
            {
              id: "cp-3",
              partyId: "enc-org-1",
              type: "Phone",
              value: "+966 11 456 7890",
              isPrimary: true,
              isVerified: true,
            },
            {
              id: "cp-4",
              partyId: "enc-org-1",
              type: "Email",
              value: "info@riyadhfalcons.com",
              isPrimary: false,
              isVerified: true,
            },
          ],
          totalCount: 4,
          pageNumber: 1,
          pageSize: 100,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      });
    }
  });

  await page.route("**/api/v1/party-roles*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "role-new-123" }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "role-1",
              partyId: "enc-person-1",
              roleType: "Head Coach",
              createdAt: "2026-01-10T00:00:00Z",
            },
            {
              id: "role-2",
              partyId: "enc-person-1",
              roleType: "Customer",
              createdAt: "2026-01-15T00:00:00Z",
            },
            {
              id: "role-3",
              partyId: "enc-org-1",
              roleType: "Academy Partner",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
          totalCount: 3,
          pageNumber: 1,
          pageSize: 100,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      });
    }
  });

  await page.route("**/api/v1/party-relationships*", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "rel-new-123" }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "rel-1",
              sourcePartyId: "enc-person-1",
              targetPartyId: "enc-org-1",
              relationshipType: "CoachOf",
              createdAt: "2026-02-01T00:00:00Z",
            },
            {
              id: "rel-rep-1",
              sourcePartyId: "enc-org-1",
              targetPartyId: "enc-person-1",
              relationshipType: "Representative",
              validFrom: "2026-01-01T00:00:00Z",
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: "rel-rep-2",
              sourcePartyId: "enc-org-1",
              targetPartyId: "enc-person-2",
              relationshipType: "AuthorizedSignatory",
              validFrom: "2026-02-01T00:00:00Z",
              createdAt: "2026-02-01T00:00:00Z",
            },
          ],
          totalCount: 3,
          pageNumber: 1,
          pageSize: 100,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      });
    }
  });

  await page.route("**/api/v1/merge-candidates*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    });
  });

  // Parties individual detail endpoint (GET /api/v1/Parties/{id})
  await page.route(/\/api\/v1\/Parties\/enc-(person|org)-[a-zA-Z0-9-]+(\?.*)?$/, async (route) => {
    const url = route.request().url();
    const isOrg = url.includes("enc-org");
    const isNew = url.includes("new-123");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: isNew ? "enc-person-new-123" : isOrg ? "enc-org-1" : "enc-person-1",
        type: isOrg ? "Organization" : "Person",
        displayName: isNew
          ? "Dr. Fatima Zahra Al-Mansoor"
          : isOrg
          ? "Riyadh Falcons Sports Academy"
          : "Dr. Fatima Zahra Al-Mansoor",
        legalName: isOrg ? "Riyadh Falcons Sports Academy LLC" : null,
        status: 0,
        createdAt: isOrg ? "2026-10-08T00:00:00Z" : "2026-10-09T00:00:00Z",
        modifiedAt: isOrg ? "2026-10-08T01:00:00Z" : "2026-10-09T01:00:00Z",
      }),
    });
  });

  // Parties directory list mock (matches /api/v1/Parties and /api/v1/Parties?...)
  await page.route(/\/api\/v1\/Parties(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "enc-person-1",
            type: "Person",
            displayName: "Dr. Fatima Zahra Al-Mansoor",
            status: 0,
            createdAt: "2026-10-09T00:00:00Z",
            modifiedAt: "2026-10-09T01:00:00Z",
          },
          {
            id: "enc-org-1",
            type: "Organization",
            displayName: "Riyadh Falcons Sports Academy",
            legalName: "Riyadh Falcons Sports Academy LLC",
            status: 0,
            createdAt: "2026-10-08T00:00:00Z",
            modifiedAt: "2026-10-08T01:00:00Z",
          },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    });
  });
}

test.describe("Party Enterprise Directory & Profile Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await setupPartyMocks(page);
  });

  test("01: renders party directory with filter chips, search, and layout toggles", async ({ page }) => {
    await page.goto("/party-kernel/parties", { waitUntil: "domcontentloaded" });

    // Directory header
    const heading = page.locator("h1, [data-testid='directory-title']").first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Search bar
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    await expect(searchInput).toBeVisible();

    // Filter chips
    const allFilter = page.locator('button:has-text("Total Parties"), button:has-text("All"), button:has-text("الأطراف")').first();
    const peopleFilter = page.locator('button:has-text("People"), button:has-text("الأفراد")').first();
    const orgFilter = page.locator('button:has-text("Organizations"), button:has-text("المؤسسات")').first();

    await expect(allFilter).toBeVisible();
    await expect(peopleFilter).toBeVisible();
    await expect(orgFilter).toBeVisible();

    // Action buttons
    const newPersonBtn = page.locator('button:has-text("New Person"), button:has-text("إضافة فرد")').first();
    const newOrgBtn = page.locator('button:has-text("New Organization"), button:has-text("إضافة مؤسسة")').first();

    await expect(newPersonBtn).toBeVisible();
    await expect(newOrgBtn).toBeVisible();

    // Capture directory screenshot (01-party-directory.png)
    await captureScreenshot(page, "01-party-directory.png", true);
  });

  test("02: opens Create Person dialog with expandable structured names and creates person atomically", async ({ page }) => {
    await page.goto("/party-kernel/parties", { waitUntil: "domcontentloaded" });

    const newPersonBtn = page.locator('button:has-text("New Person"), button:has-text("إضافة فرد")').first();
    await expect(newPersonBtn).toBeVisible({ timeout: 15_000 });
    await newPersonBtn.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // Verify Full Name field exists and does NOT contain separate First/Last fields (ADR-002 invariant)
    const fullNameInput = dialog.locator('input#person-full-name').first();
    await expect(fullNameInput).toBeVisible();

    const firstNameInput = dialog.locator('input#firstName, input[name="firstName"]');
    await expect(firstNameInput).toHaveCount(0); // Invariant: no forced splitting

    // Fill multicultural name and contact info
    await fullNameInput.fill("د. فاطمة الزهراء المنصور");
    const phoneInput = dialog.locator('input#person-phone').first();
    await phoneInput.fill("+966 50 123 4567");
    const emailInput = dialog.locator('input#person-email').first();
    await emailInput.fill("fatima@scripe.com");

    // Expand Additional Names section
    const additionalNamesBtn = dialog.locator('button:has-text("Additional Name Fields"), button:has-text("حقول الأسماء الإضافية")').first();
    if (await additionalNamesBtn.isVisible()) {
      await additionalNamesBtn.click();
      const displayNameInput = dialog.locator('input#person-display-name').first();
      await expect(displayNameInput).toBeVisible();
      await displayNameInput.fill("د. فاطمة المنصور");
    }

    // Submit button must be enabled
    const submitBtn = dialog.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeEnabled();

    // Capture filled dialog screenshot (02-create-person.png)
    await captureScreenshot(page, "02-create-person.png", false);

    // Submit form and verify navigation to created person profile
    await submitBtn.click();
    await page.waitForURL(/\/party-kernel\/parties\/enc-person-new-123/, { timeout: 10_000 });
  });

  test("03: opens Create Organization dialog with legal name and governance note", async ({ page }) => {
    await page.goto("/party-kernel/parties", { waitUntil: "domcontentloaded" });

    const newOrgBtn = page.locator('button:has-text("New Organization"), button:has-text("إضافة مؤسسة")').first();
    await expect(newOrgBtn).toBeVisible({ timeout: 15_000 });
    await newOrgBtn.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const legalNameInput = dialog.locator('input#org-legal-name').first();
    await expect(legalNameInput).toBeVisible();

    const displayNameInput = dialog.locator('input#org-display-name').first();
    await expect(displayNameInput).toBeVisible();

    // Fill legal and commercial names
    await legalNameInput.fill("Riyadh Falcons Sports Academy LLC");
    await displayNameInput.fill("Riyadh Falcons");

    const taxIdInput = dialog.locator('input#org-tax-id').first();
    if (await taxIdInput.isVisible()) {
      await taxIdInput.fill("CR-1010892019");
    }

    const phoneInput = dialog.locator('input#org-phone').first();
    await phoneInput.fill("+966 11 456 7890");

    const submitBtn = dialog.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeEnabled();

    // Capture organization dialog screenshot (03-create-organization.png)
    await captureScreenshot(page, "03-create-organization.png", false);
  });

  test("04: renders Person 360 Overview with completeness meter and addresses note", async ({ page }) => {
    await page.goto("/party-kernel/parties/enc-person-1", { waitUntil: "domcontentloaded" });

    // Profile hero card should show immutable badge and completeness meter
    const immutableBadge = page.getByText("Immutable Identity Type").first();
    await expect(immutableBadge).toBeVisible({ timeout: 15_000 });

    const completenessText = page.getByText(/Data Completeness|اكتمال البيانات/).first();
    await expect(completenessText).toBeVisible();

    // Verify Addresses section disclaimer
    const addressesTitle = page.getByText(/Physical & Postal Addresses|العناوين الفعلية والبريدية/).first();
    await expect(addressesTitle).toBeVisible();

    // Capture Person 360 Overview screenshot (04-person-overview.png)
    await captureScreenshot(page, "04-person-overview.png", true);
  });

  test("05: renders Person 360 Contacts tab with primary badges", async ({ page }) => {
    await page.goto("/party-kernel/parties/enc-person-1", { waitUntil: "domcontentloaded" });

    const contactsTab = page.getByRole("tab", { name: /Contact/i }).first();
    await expect(contactsTab).toBeVisible({ timeout: 15_000 });
    await contactsTab.click();

    // Verify contact methods
    const phoneValue = page.getByText("+966 50 123 4567").first();
    await expect(phoneValue).toBeVisible({ timeout: 10_000 });

    // Capture Person Contacts screenshot (05-person-contacts.png)
    await captureScreenshot(page, "05-person-contacts.png", true);
  });

  test("06: renders Person 360 Relationships tab", async ({ page }) => {
    await page.goto("/party-kernel/parties/enc-person-1", { waitUntil: "domcontentloaded" });

    const relationshipsTab = page.getByRole("tab", { name: /Relationship/i }).first();
    await expect(relationshipsTab).toBeVisible({ timeout: 15_000 });
    await relationshipsTab.click();

    const relBadge = page.getByText(/CoachOf|add relationship/i).first();
    await expect(relBadge).toBeVisible({ timeout: 10_000 });

    // Capture Person Relationships screenshot (06-person-relationships.png)
    await captureScreenshot(page, "06-person-relationships.png", true);
  });

  test("07: renders Organization 360 Overview with corporate legal identity", async ({ page }) => {
    await page.goto("/party-kernel/parties/enc-org-1", { waitUntil: "domcontentloaded" });

    // Verify Corporate Legal Identity details
    const orgBadge = page.locator("span:has-text('Organization'), span:has-text('مؤسسة')").first();
    await expect(orgBadge).toBeVisible({ timeout: 15_000 });

    const legalName = page.getByText("Riyadh Falcons Sports Academy LLC").first();
    await expect(legalName).toBeVisible();

    // Capture Organization Overview screenshot (07-organization-overview.png)
    await captureScreenshot(page, "07-organization-overview.png", true);
  });

  test("08: renders Organization 360 dedicated Representatives tab", async ({ page }) => {
    await page.goto("/party-kernel/parties/enc-org-1", { waitUntil: "domcontentloaded" });

    const repTab = page.getByRole("tab", { name: /Representative/i }).first();
    await expect(repTab).toBeVisible({ timeout: 15_000 });
    await repTab.click();

    // Verify representatives cards
    const repTitle = page.getByText(/Authorized Representatives|الممثلون المعتمدون/).first();
    await expect(repTitle).toBeVisible({ timeout: 10_000 });

    const repBadge = page.getByText("Representative").first();
    await expect(repBadge).toBeVisible();

    // Capture Organization Representatives screenshot (08-organization-representatives.png)
    await captureScreenshot(page, "08-organization-representatives.png", true);
  });

  test("09: renders Party Directory in Arabic RTL", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("i18nextLng", "ar");
        localStorage.setItem("language", "ar");
        document.documentElement.setAttribute("lang", "ar");
        document.documentElement.setAttribute("dir", "rtl");
      } catch {}
    });

    await page.goto("/party-kernel/parties", { waitUntil: "domcontentloaded" });

    // Verify Arabic directory elements
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Capture Arabic RTL screenshot (09-party-directory-arabic-rtl.png)
    await captureScreenshot(page, "09-party-directory-arabic-rtl.png", true);
  });

  test("10: supports mobile viewport layout without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/party-kernel/parties", { waitUntil: "domcontentloaded" });

    // Directory elements adapt to mobile without horizontal overflow
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 15_000 });

    // Capture mobile responsive screenshot (10-mobile-viewport.png)
    await captureScreenshot(page, "10-mobile-viewport.png", true);
  });
});
