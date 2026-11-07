import { Page } from "@playwright/test";
import {
  MOCK_ADMIN_PROFILE,
  MOCK_PASSKEYS,
  MOCK_SESSIONS,
  MOCK_AUDIT_LOGS,
  MOCK_EXTERNAL_LOGINS,
  MOCK_PERSONAL_TOKENS,
} from "./profile-mock-data";

/**
 * Injects mock WebAuthn Level 3 FIDO2 browser API (`navigator.credentials.create` & `get`).
 * Allows tests to exercise passkey enrollment and biometric sudo step-up in headless CI
 * without requiring a physical biometric sensor or hardware token.
 */
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
        (navigator as any).credentials = {};
      }

      navigator.credentials.create = async () => mockPublicKeyCredential as any;
      navigator.credentials.get = async () => mockPublicKeyCredential as any;
      (window as any).PublicKeyCredential = class {};
      (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => true;
    }
  });
}

/**
 * Intercepts profile-related HTTP API calls with deterministic fixtures.
 */
export async function setupProfileRouteMocks(
  page: Page,
  options?: {
    profileOverrides?: Partial<typeof MOCK_ADMIN_PROFILE>;
    initialPasskeys?: typeof MOCK_PASSKEYS;
    initialSessions?: typeof MOCK_SESSIONS;
    initialAuditLogs?: typeof MOCK_AUDIT_LOGS;
  }
) {
  let profile = { ...MOCK_ADMIN_PROFILE, ...(options?.profileOverrides || {}) };
  let passkeys = [...(options?.initialPasskeys || MOCK_PASSKEYS)];
  let sessions = [...(options?.initialSessions || MOCK_SESSIONS)];
  let auditLogs = [...(options?.initialAuditLogs || MOCK_AUDIT_LOGS)];
  let externalLogins = [...MOCK_EXTERNAL_LOGINS];
  let personalTokens = [...MOCK_PERSONAL_TOKENS];

  // 0. Ensure Client-side Authenticated Session in Browser Context
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
            roles: ["Platform Administrator"],
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

  // Mock Silent Refresh & Auth
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

  // Mock Menu & Routes to prevent navigation query fallbacks
  await page.route("**/api/v1/Menus/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        routes: [
          "/profile",
          "/profile/security",
          "/profile/sessions",
          "/profile/activity",
          "/profile/preferences",
          "/profile/integrations",
        ],
        workspaces: [],
      }),
    });
  });

  // 1. Current Profile (GET & PUT)
  await page.route("**/api/v1/Admins/me", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(profile),
      });
    } else if (route.request().method() === "PUT") {
      const data = route.request().postDataJSON();
      profile = { ...profile, ...data };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(profile),
      });
    } else {
      await route.continue();
    }
  });

  // Alternative profile endpoint alias
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    });
  });

  // 2. Avatar Upload & Delete
  await page.route("**/api/v1/Admins/me/avatar", async (route) => {
    if (route.request().method() === "POST") {
      profile.profileImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ imageUrl: profile.profileImageUrl }),
      });
    } else if (route.request().method() === "DELETE") {
      profile.profileImageUrl = null;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  // 3. Passkeys (GET, DELETE, Registration, Sudo)
  await page.route("**/api/v1/auth/passkeys", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(passkeys),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/auth/passkeys/registration/begin", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        challenge: "iOazQkEcbhHokMs9HyJF3w",
        rp: { id: "localhost", name: "SCRIPE Sports OS" },
        user: { id: "dXNlcl9pZA", name: profile.username, displayName: `${profile.firstName} ${profile.lastName}` },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      }),
    });
  });

  await page.route("**/api/v1/auth/passkeys/registration/complete", async (route) => {
    const newPasskey = {
      id: `passkey-${Date.now()}`,
      deviceName: "New Enrolled Key",
      deviceType: "platform",
      aaguid: "00000000-0000-0000-0000-000000000000",
      maskedCredentialId: "cred_new••••••••77a1",
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      signatureCounter: 1,
      isDiscoverable: true,
    };
    passkeys.push(newPasskey);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(newPasskey),
    });
  });

  await page.route("**/api/v1/auth/passkeys/authentication/begin", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        challenge: "iOazQkEcbhHokMs9HyJF3w",
        rpId: "localhost",
        allowCredentials: [],
        timeout: 60000,
      }),
    });
  });

  await page.route("**/api/v1/auth/**/sudo-verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sudoToken: "sudo_token_active_5min",
        expiresInSeconds: 300,
      }),
    });
  });

  await page.route("**/api/v1/auth/passkeys/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const urlParts = route.request().url().split("/");
      const id = urlParts[urlParts.length - 1];
      passkeys = passkeys.filter((p) => p.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  // 4. Sessions & Fleet Control (GET, DELETE single, POST revoke-all)
  await page.route("**/api/v1/auth/admin/sessions/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/revoke-all") && route.request().method() === "POST") {
      const beforeCount = sessions.length;
      sessions = sessions.filter((s) => s.isCurrent);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ revokedCount: Math.max(0, beforeCount - 1) }),
      });
    } else if (route.request().method() === "DELETE") {
      const urlParts = url.split("/");
      const tokenId = urlParts[urlParts.length - 1];
      sessions = sessions.filter((s) => s.tokenId !== tokenId && (s as any).id !== tokenId);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/auth/admin/sessions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(sessions),
      });
    } else {
      await route.continue();
    }
  });

  // 5. 2FA Setup & Wizard
  await page.route("**/api/v1/auth/admin/2fa/enable", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        qrCodeDataUri:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        manualEntryKey: "JBSWY3DPEHPK3PXP",
        backupCodes: [
          "1234-5678",
          "8765-4321",
          "1122-3344",
          "5566-7788",
          "9900-1122",
          "3344-5566",
          "7788-9900",
          "1212-3434",
          "5656-7878",
          "9090-1212",
        ],
      }),
    });
  });

  await page.route("**/api/v1/auth/admin/2fa/confirm", async (route) => {
    profile.isTwoFactorEnabled = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route("**/api/v1/auth/admin/2fa/disable", async (route) => {
    profile.isTwoFactorEnabled = false;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route("**/api/v1/auth/admin/2fa/backup-codes/regenerate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        backupCodes: [
          "1111-2222",
          "3333-4444",
          "5555-6666",
          "7777-8888",
          "9999-0000",
          "1234-5678",
          "2345-6789",
          "3456-7890",
          "4567-8901",
          "5678-9012",
        ],
      }),
    });
  });

  // 6. Security Log / Audit Ledger (GET)
  await page.route("**/api/v1/auth/admin/security-log*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: auditLogs,
        totalCount: auditLogs.length,
        page: 1,
        pageSize: 50,
      }),
    });
  });

  // 7. Password Change Form
  await page.route("**/api/v1/Admins/*/change-password", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  // 8. Integrations & SSO (GET & DELETE)
  await page.route("**/api/v1/auth/admin/external-logins", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(externalLogins),
    });
  });

  await page.route("**/api/v1/auth/admin/external-logins/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const urlParts = route.request().url().split("/");
      const id = urlParts[urlParts.length - 1];
      externalLogins = externalLogins.filter((e) => e.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  // 9. Personal Access Tokens (PAT)
  await page.route("**/api/v1/auth/admin/personal-access-tokens", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(personalTokens),
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      const newToken = {
        id: `pat-${Date.now()}`,
        name: body.name || "Custom Automation Token",
        prefix: "scr_pat_live_99aa",
        maskedToken: "scr_pat_live_99aa••••••••ff12",
        scopes: body.scopes || ["academy:read"],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (body.expiresInDays || 30) * 86400000).toISOString(),
        lastUsedAt: null as string | null,
      };
      personalTokens.push(newToken);
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

  await page.route("**/api/v1/auth/admin/personal-access-tokens/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const urlParts = route.request().url().split("/");
      const id = urlParts[urlParts.length - 1];
      personalTokens = personalTokens.filter((p) => p.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });
}
