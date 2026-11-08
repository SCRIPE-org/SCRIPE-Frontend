import { Page } from "@playwright/test";
import {
  MOCK_ACCOUNT_CONTEXT,
  MOCK_ACCOUNT_DOSSIER,
  MOCK_SECURITY_SLICE,
  MOCK_SESSIONS_SLICE,
  MOCK_GOVERNANCE_SLICE,
  MOCK_ACTIVITY_SLICE,
  MOCK_PREFERENCES_SLICE,
  MOCK_NOTIFICATIONS_SLICE,
  MOCK_PLAN_SLICE,
  MOCK_INTEGRATIONS_SLICE,
} from "./account-mock-data";

export const SOVEREIGN_ACCOUNT_ROUTES = [
  { slug: "dossier", path: "/account/dossier", index: "01" },
  { slug: "security", path: "/account/security", index: "02" },
  { slug: "sessions", path: "/account/sessions", index: "03" },
  { slug: "governance", path: "/account/governance", index: "04" },
  { slug: "activity", path: "/account/activity", index: "05" },
  { slug: "preferences", path: "/account/preferences", index: "06" },
  { slug: "notifications", path: "/account/notifications", index: "07" },
  { slug: "plan", path: "/account/plan", index: "08" },
  { slug: "integrations", path: "/account/integrations", index: "09" },
] as const;

export async function mockWebAuthn(page: Page) {
  await page.addInitScript(() => {
    if (typeof window !== "undefined") {
      const mockPublicKeyCredential = {
        id: "cred_8f3a99b2c011e4aa",
        rawId: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
        type: "public-key",
        response: {
          clientDataJSON: new TextEncoder().encode(
            JSON.stringify({
              type: "webauthn.create",
              challenge: "iOazQkEcbhHokMs9HyJF3w",
              origin: window.location.origin,
            })
          ).buffer,
          attestationObject: new Uint8Array([163, 1, 2, 3]).buffer,
          authenticatorData: new Uint8Array([1, 2, 3, 4]).buffer,
          signature: new Uint8Array([5, 6, 7, 8]).buffer,
          userHandle: new TextEncoder().encode("00000000-0000-0000-0000-000000000001").buffer,
        },
        getClientExtensionResults: () => ({}),
      };

      if (!navigator.credentials) {
        (navigator as unknown as { credentials: Record<string, unknown> }).credentials = {};
      }

      navigator.credentials.create = async () => mockPublicKeyCredential as unknown as Credential;
      navigator.credentials.get = async () => mockPublicKeyCredential as unknown as Credential;
      (window as unknown as Record<string, unknown>).PublicKeyCredential = class {
        static async isUserVerifyingPlatformAuthenticatorAvailable() {
          return true;
        }
      };
    }
  });
}

export async function applyThemeMode(page: Page, mode: "dark" | "light") {
  await page.evaluate((targetMode) => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(targetMode);
    html.setAttribute("data-theme", targetMode);
    html.style.colorScheme = targetMode;
    try {
      window.localStorage.setItem("theme", targetMode);
    } catch {
      // ignore storage errors
    }
  }, mode);
  await page.waitForTimeout(200);
}

export async function setupSovereignAccountRouteMocks(page: Page) {
  const contextData = structuredClone(MOCK_ACCOUNT_CONTEXT);
  let dossier = structuredClone(MOCK_ACCOUNT_DOSSIER);
  let securitySlice = structuredClone(MOCK_SECURITY_SLICE);
  const sessionsSlice = structuredClone(MOCK_SESSIONS_SLICE);
  const governanceSlice = structuredClone(MOCK_GOVERNANCE_SLICE);
  const activitySlice = structuredClone(MOCK_ACTIVITY_SLICE);
  let preferencesSlice = structuredClone(MOCK_PREFERENCES_SLICE);
  let notificationsSlice = structuredClone(MOCK_NOTIFICATIONS_SLICE);
  const planSlice = structuredClone(MOCK_PLAN_SLICE);
  const integrationsSlice = structuredClone(MOCK_INTEGRATIONS_SLICE);

  await page.context().addCookies([
    {
      name: "scr_auth_state",
      value: "true",
      url: "http://localhost:3000",
    },
    {
      name: "scr_refresh_token",
      value: "mock_refresh_token",
      url: "http://localhost:3000",
    },
  ]);

  await page.addInitScript(() => {
    try {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggTW9yZ2FuIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      window.sessionStorage.setItem("dev_access_token", mockToken);

      const appStorage = {
        state: {
          isAuthenticated: true,
          user: {
            id: "00000000-0000-0000-0000-000000000001",
            username: "superadmin",
            email: "admin@scripe.com",
            firstName: "Alex",
            lastName: "Morgan",
            roles: ["Platform Administrator", "VP of Enterprise Operations"],
          },
          permissions: ["*"],
          _hasHydrated: true,
          mustChangePassword: false,
          subscriptionStatus: "Active",
          editionName: "Enterprise Ultra",
        },
        version: 0,
      };
      window.localStorage.setItem("app-storage", JSON.stringify(appStorage));
    } catch {
      // ignore in non-browser context
    }
  });

  // Silent Refresh
  await page.route("**/api/v1/auth/admin/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggTW9yZ2FuIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        refreshToken: "mock-refresh-token",
        subscriptionStatus: "Active",
        mustChangePassword: false,
        editionName: "Enterprise Ultra",
      }),
    });
  });

  // Menu routes
  await page.route("**/api/v1/Menus/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        routes: SOVEREIGN_ACCOUNT_ROUTES.map((r) => r.path),
        workspaces: [],
      }),
    });
  });

  // 0. Context
  await page.route("**/api/v1/account/context", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(contextData),
    });
  });

  // 1. Dossier & Avatar
  await page.route("**/api/v1/account/dossier/avatar", async (route) => {
    if (route.request().method() === "POST") {
      dossier.profileImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ imageUrl: dossier.profileImageUrl }),
      });
    } else if (route.request().method() === "DELETE") {
      dossier.profileImageUrl = null;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/dossier", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(dossier),
      });
    } else if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON() || {};
      dossier = { ...dossier, ...payload };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(dossier),
      });
    } else {
      await route.continue();
    }
  });

  // 2. Security & Passkeys & 2FA
  await page.route("**/api/v1/account/security", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(securitySlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      securitySlice = {
        ...securitySlice,
        allowedCidrs: Array.isArray(body.allowedCidrs) ? body.allowedCidrs : securitySlice.allowedCidrs,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(securitySlice),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/auth/passkeys", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(securitySlice.passkeys),
    });
  });

  await page.route("**/api/v1/auth/**/sudo-verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sudoToken: "sudo_token_active_15min",
        expiresInSeconds: 900,
      }),
    });
  });

  // 3. Sessions
  await page.route("**/api/v1/account/sessions/*/ping", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ latencyMs: 18, reachable: true }),
    });
  });

  await page.route("**/api/v1/account/sessions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionsSlice),
    });
  });

  await page.route("**/api/v1/auth/admin/sessions/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/revoke-all") && route.request().method() === "POST") {
      sessionsSlice.sessions = sessionsSlice.sessions.filter((s) => s.isCurrent);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ revokedCount: 1 }),
      });
    } else if (route.request().method() === "DELETE") {
      const tokenId = url.split("/").pop();
      sessionsSlice.sessions = sessionsSlice.sessions.filter((s) => s.tokenId !== tokenId);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/auth/admin/sessions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(sessionsSlice.sessions),
    });
  });

  // 4. Governance
  await page.route("**/api/v1/account/governance/delegations/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      governanceSlice.delegations = governanceSlice.delegations.filter((d) => d.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/governance/delegations", async (route) => {
    const body = route.request().postDataJSON() || {};
    const added = {
      id: `del-${Date.now()}`,
      principalAdminId: dossier.id,
      delegateAdminId: body.delegateAdminId || "00000000-0000-0000-0000-000000000002",
      delegateDisplayName: body.delegateDisplayName || "Deputy Operations Director",
      delegationType: body.delegationType || "VacationActingAs",
      grantedScopes: body.grantedScopes || ["CRM.Pipelines.View"],
      justification: body.justification || "Annual Leave Delegation",
      startsAtUtc: new Date().toISOString(),
      expiresAtUtc: body.expiresAtUtc || new Date(Date.now() + 86400000 * 3).toISOString(),
      revokedAtUtc: null,
      status: "ACTIVE",
    };
    governanceSlice.delegations.push(added);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(added),
    });
  });

  await page.route("**/api/v1/account/governance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(governanceSlice),
    });
  });

  // 5. Activity & Security Log
  await page.route("**/api/v1/account/activity*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(activitySlice),
    });
  });

  await page.route("**/api/v1/auth/admin/security-log*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(activitySlice),
    });
  });

  // 6. Preferences
  await page.route("**/api/v1/account/preferences", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(preferencesSlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      preferencesSlice = { ...preferencesSlice, ...body };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(preferencesSlice),
      });
    } else {
      await route.continue();
    }
  });

  // 7. Notifications
  await page.route("**/api/v1/account/notifications/test", async (route) => {
    notificationsSlice.recentNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: "Live B2B Test Notification",
      message: "SignalR push & HTML Email Queue verified.",
      category: "Security",
      createdAt: new Date().toISOString(),
      isRead: false,
    });
    notificationsSlice.unreadNotificationsCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sent: true }),
    });
  });

  await page.route("**/api/v1/account/notifications", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(notificationsSlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      notificationsSlice = { ...notificationsSlice, ...body };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(notificationsSlice),
      });
    } else {
      await route.continue();
    }
  });

  // 8. Plan & Quotas
  await page.route("**/api/v1/account/plan/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ submitted: true }),
    });
  });

  await page.route("**/api/v1/account/plan", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(planSlice),
    });
  });

  // 9. Integrations (SSO & PATs)
  await page.route("**/api/v1/account/integrations/*/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      integrationsSlice.personalAccessTokens = integrationsSlice.personalAccessTokens.filter(
        (t) => t.id !== id
      );
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/integrations", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(integrationsSlice),
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() || {};
      const newToken = {
        id: `pat-${Date.now()}`,
        name: body.name || "Enterprise Automation Token",
        prefix: "scr_pat_live_99aa",
        tokenPrefix: "scr_pat_live_99aa",
        maskedToken: "scr_pat_live_99aa••••••••",
        scopes: body.scopes || ["CRM.Read"],
        createdAt: new Date().toISOString(),
        createdAtUtc: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        expiresAtUtc: new Date(Date.now() + 86400000 * 30).toISOString(),
        lastUsedAt: null,
        lastUsedAtUtc: null,
      };
      integrationsSlice.personalAccessTokens.push(newToken);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(newToken),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/auth/admin/external-logins", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(integrationsSlice.externalLogins),
    });
  });

  await page.route("**/api/v1/auth/admin/personal-access-tokens", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(integrationsSlice.personalAccessTokens),
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() || {};
      const newToken = {
        id: `pat-${Date.now()}`,
        name: body.name || "Custom Automation Token",
        prefix: "scr_pat_live_99aa",
        tokenPrefix: "scr_pat_live_99aa",
        maskedToken: "scr_pat_live_99aa••••••••ff12",
        scopes: body.scopes || ["CRM.Read"],
        createdAt: new Date().toISOString(),
        createdAtUtc: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        expiresAtUtc: new Date(Date.now() + 86400000 * 30).toISOString(),
        lastUsedAt: null,
        lastUsedAtUtc: null,
      };
      integrationsSlice.personalAccessTokens.push(newToken);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: newToken,
          secret: "scr_pat_live_99aa_full_plaintext_secret_token_key_12345",
        }),
      });
    } else {
      await route.continue();
    }
  });
}
