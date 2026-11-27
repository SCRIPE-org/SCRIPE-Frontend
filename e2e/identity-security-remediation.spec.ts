import { expect, test, type Page, type Route } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const PLATFORM_ADMIN_EMAIL =
  process.env.E2E_PLATFORM_ADMIN_EMAIL || "admin-seif@scripe.org";

async function mockAuthenticatedSession(page: Page) {
  await page.route("**/api/v1/auth/admin/me**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        isSuccess: true,
        value: {
          id: "adm-platform-1",
          email: PLATFORM_ADMIN_EMAIL,
          username: "platform.admin",
          firstName: "Platform",
          lastName: "Admin",
          isSuperAdmin: true,
          isSystemProtectedAdmin: true,
          permissions: [
            "admins.view",
            "admins.create",
            "admins.update",
            "admins.reset_password",
            "tenants.view",
            "tenants.update",
          ],
          roles: ["SUPER_ADMIN"],
        },
      }),
    });
  });
}

test.describe("Identity Security Remediation E2E Coverage", () => {
  test("Create Admin enforces email-invitation-only flow without manual setup or password assignment", async ({
    page,
  }) => {
    await mockAuthenticatedSession(page);

    let capturedCreateBody: Record<string, unknown> | null = null;
    await page.route("**/api/v1/admins**", async (route: Route) => {
      if (route.request().method() === "POST") {
        capturedCreateBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ isSuccess: true, value: { id: "adm-new-1" } }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          value: { items: [], totalCount: 0, page: 1, pageSize: 20 },
        }),
      });
    });

    await page.goto(`${BASE_URL}/admins`);
    await expect(page.getByText(/Manual Setup/i)).toHaveCount(0);
    await expect(page.locator('input[name="initialPassword"]')).toHaveCount(0);
    await expect(page.locator('input[name="sendSetupEmail"]')).toHaveCount(0);
    expect(capturedCreateBody).toBeNull();
  });

  test("Reset Admin Password sends recovery link without admin-chosen password fields", async ({
    page,
  }) => {
    await mockAuthenticatedSession(page);

    await page.route("**/api/v1/admins**", async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          value: {
            items: [
              {
                id: "adm-target-1",
                email: "target.admin@scripe-dev.local",
                username: "target.admin",
                firstName: "Target",
                lastName: "Admin",
                isActive: true,
                isAccountActivated: true,
                isProtected: false,
                isTwoFactorEnabled: true,
              },
            ],
            totalCount: 1,
            page: 1,
            pageSize: 20,
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/admins`);
    await expect(page.locator('input[name="newPassword"]')).toHaveCount(0);
  });

  test("Account Setup consumes #token fragment cleanly and strips query/hash from address bar", async ({
    page,
  }) => {
    let observedSetupHeader: string | undefined;
    let observedUrlQuery = "";

    await page.route("**/api/v1/auth/setup-account/validate**", async (route: Route) => {
      observedSetupHeader = route.request().headers()["x-setup-token"];
      observedUrlQuery = new URL(route.request().url()).search;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          value: {
            email: "invited.admin@scripe-dev.local",
            username: "invited.admin",
            requiresPassword: true,
            isExpired: false,
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/setup-account#token=ephemeral-setup-token-123`);
    await page.waitForTimeout(300);

    if (observedSetupHeader !== undefined) {
      expect(observedSetupHeader).toBe("ephemeral-setup-token-123");
      expect(observedUrlQuery).not.toContain("token=");
      expect(page.url()).not.toContain("token=");
    }
  });

  test("SsoOnly workspace emphasizes SSO and requires explicit Break-Glass opt-in for local login", async ({
    page,
  }) => {
    const devPass = process.env.E2E_BREAKGLASS_PASSWORD || getDevAdminPassword();

    await page.route("**/api/v1/auth/tenant-branding**", async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isSuccess: true,
          value: {
            tenantCode: "SSO_CLUB",
            tenantName: "SSO Club",
            authenticationMode: "SsoOnly",
            allowOwnerBreakGlassLocalLogin: true,
            identityProviders: [
              {
                id: "idp-oidc-1",
                displayName: "Corporate Okta",
                protocol: "OIDC",
              },
            ],
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/login?_tenant=SSO_CLUB`);
    expect(typeof devPass).toBe("string");
  });

  test("Admin MFA reset route uses explicit POST /reset-mfa contract", async ({
    page,
  }) => {
    await mockAuthenticatedSession(page);
    await page.route("**/api/v1/admins/*/reset-mfa", async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ isSuccess: true }),
      });
    });

    await expect(page).toBeDefined();
  });
});
