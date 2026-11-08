import { Page } from "@playwright/test";
import {
  MOCK_ACCOUNT_DOSSIER,
  MOCK_CREDENTIALS_SLICE,
  MOCK_SECURITY_SLICE,
  MOCK_SESSIONS_SLICE,
  MOCK_DEVICES_SLICE,
  MOCK_GOVERNANCE_SLICE,
  MOCK_ACTIVITY_SLICE,
  MOCK_PRIVACY_SLICE,
  MOCK_PREFERENCES_SLICE,
  MOCK_ACCESSIBILITY_SLICE,
  MOCK_AI_COPILOT_SLICE,
  MOCK_NOTIFICATIONS_SLICE,
  MOCK_PLAN_SLICE,
  MOCK_BILLING_SLICE,
  MOCK_INTEGRATIONS_SLICE,
} from "./account-mock-data";

export const SOVEREIGN_ACCOUNT_ROUTES = [
  { slug: "dossier", path: "/account/dossier", index: "01" },
  { slug: "credentials", path: "/account/credentials", index: "02" },
  { slug: "security", path: "/account/security", index: "03" },
  { slug: "sessions", path: "/account/sessions", index: "04" },
  { slug: "devices", path: "/account/devices", index: "05" },
  { slug: "governance", path: "/account/governance", index: "06" },
  { slug: "activity", path: "/account/activity", index: "07" },
  { slug: "privacy", path: "/account/privacy", index: "08" },
  { slug: "preferences", path: "/account/preferences", index: "09" },
  { slug: "accessibility", path: "/account/accessibility", index: "10" },
  { slug: "ai-copilot", path: "/account/ai-copilot", index: "11" },
  { slug: "notifications", path: "/account/notifications", index: "12" },
  { slug: "plan", path: "/account/plan", index: "13" },
  { slug: "billing", path: "/account/billing", index: "14" },
  { slug: "integrations", path: "/account/integrations", index: "15" },
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
  let dossier = structuredClone(MOCK_ACCOUNT_DOSSIER);
  let credentialsSlice = structuredClone(MOCK_CREDENTIALS_SLICE);
  let securitySlice = structuredClone(MOCK_SECURITY_SLICE);
  let sessionsSlice = structuredClone(MOCK_SESSIONS_SLICE);
  let devicesSlice = structuredClone(MOCK_DEVICES_SLICE);
  let governanceSlice = structuredClone(MOCK_GOVERNANCE_SLICE);
  const activitySlice = structuredClone(MOCK_ACTIVITY_SLICE);
  let privacySlice = structuredClone(MOCK_PRIVACY_SLICE);
  let preferencesSlice = structuredClone(MOCK_PREFERENCES_SLICE);
  let accessibilitySlice = structuredClone(MOCK_ACCESSIBILITY_SLICE);
  let aiCopilotSlice = structuredClone(MOCK_AI_COPILOT_SLICE);
  let notificationsSlice = structuredClone(MOCK_NOTIFICATIONS_SLICE);
  const planSlice = structuredClone(MOCK_PLAN_SLICE);
  let billingSlice = structuredClone(MOCK_BILLING_SLICE);
  let integrationsSlice = structuredClone(MOCK_INTEGRATIONS_SLICE);

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
            roles: ["Platform Administrator", "Director of Football"],
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
      dossier = {
        ...dossier,
        ...payload,
        tacticalIdentity: payload.tacticalIdentity
          ? { ...dossier.tacticalIdentity, ...payload.tacticalIdentity }
          : dossier.tacticalIdentity,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(dossier),
      });
    } else {
      await route.continue();
    }
  });

  // 2. Credentials
  await page.route("**/api/v1/account/credentials/seal", async (route) => {
    const body = route.request().postDataJSON() || {};
    credentialsSlice = {
      ...credentialsSlice,
      digitalSealSvg: body.digitalSealSvg || credentialsSlice.digitalSealSvg,
      signingKeyPublicPem: body.signingKeyPublicPem || credentialsSlice.signingKeyPublicPem,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(credentialsSlice),
    });
  });

  await page.route("**/api/v1/account/credentials/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      credentialsSlice.credentials = credentialsSlice.credentials.filter((c) => c.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/credentials", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(credentialsSlice),
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() || {};
      const added = {
        id: `cred-${Date.now()}`,
        category: body.category || "CoachingLicense",
        issuingBody: body.issuingBody || "UEFA",
        credentialTitle: body.credentialTitle || "UEFA A Coaching License",
        certificateNumber: body.certificateNumber || "UEFA-A-7712",
        issuedAtUtc: body.issuedAtUtc || new Date().toISOString(),
        expiresAtUtc: body.expiresAtUtc || new Date(Date.now() + 31536000000).toISOString(),
        verificationStatus: "Verified",
        stadiumZones: body.stadiumZones || ["Pitch-Side", "Technical Area"],
      };
      credentialsSlice.credentials.push(added);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(added),
      });
    } else {
      await route.continue();
    }
  });

  // 3. Security & Passkeys & 2FA
  await page.route("**/api/v1/account/security/policy", async (route) => {
    const body = route.request().postDataJSON() || {};
    securitySlice = {
      ...securitySlice,
      travelShieldEnabled:
        typeof body.travelShieldEnabled === "boolean"
          ? body.travelShieldEnabled
          : securitySlice.travelShieldEnabled,
      allowedCidrs: Array.isArray(body.allowedCidrs) ? body.allowedCidrs : securitySlice.allowedCidrs,
      hasDuressPinConfigured: body.duressPin ? true : securitySlice.hasDuressPinConfigured,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(securitySlice),
    });
  });

  await page.route("**/api/v1/account/security/support-pin", async (route) => {
    securitySlice = {
      ...securitySlice,
      supportVerificationPin: "910428",
      supportPinExpiresAtUtc: new Date(Date.now() + 900_000).toISOString(),
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        supportVerificationPin: securitySlice.supportVerificationPin,
        expiresAtUtc: securitySlice.supportPinExpiresAtUtc,
      }),
    });
  });

  await page.route("**/api/v1/account/security/lockdown", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lockedDown: true, revokedSessions: 2 }),
    });
  });

  await page.route("**/api/v1/account/security", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(securitySlice),
    });
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

  // 4. Sessions
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

  // 5. Devices
  await page.route("**/api/v1/account/devices/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      devicesSlice.devices = devicesSlice.devices.filter((d) => d.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/devices", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(devicesSlice),
      });
    } else if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() || {};
      const added = {
        id: `dev-${Date.now()}`,
        deviceName: body.deviceName || "Pitch-Side iPad Mini 7",
        deviceCategory: body.deviceCategory || "PitchTablet",
        platformOs: body.platformOs || "iPadOS 18.3",
        hardwareFingerprint: body.hardwareFingerprint || "IPADMINI-9921",
        postureScore: 97,
        isTrusted: true,
        lastOfflineSyncAtUtc: new Date().toISOString(),
        offlinePackages: body.offlinePackages || ["SquadRosters"],
      };
      devicesSlice.devices.push(added);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(added),
      });
    } else {
      await route.continue();
    }
  });

  // 6. Governance
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
      delegateAdminId: body.delegateAdminId || "00000000-0000-0000-0000-000000000002",
      delegateDisplayName: body.delegateDisplayName || "Assistant Technical Director",
      delegationType: body.delegationType || "VacationActingAs",
      grantedScopes: body.grantedScopes || ["football.tactics.view"],
      justification: body.justification || "Matchday tactical delegation",
      startsAtUtc: new Date().toISOString(),
      expiresAtUtc: body.expiresAtUtc || new Date(Date.now() + 86400000 * 3).toISOString(),
      revokedAtUtc: null,
    };
    governanceSlice.delegations.push(added);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(added),
    });
  });

  await page.route("**/api/v1/account/governance/break-glass", async (route) => {
    const body = route.request().postDataJSON() || {};
    const added = {
      id: `bg-${Date.now()}`,
      delegateAdminId: dossier.id,
      delegateDisplayName: `${dossier.firstName} ${dossier.lastName} (Break-Glass)`,
      delegationType: "BreakGlass",
      grantedScopes: body.requestedScopes || ["*"],
      justification: body.justification || "Emergency Matchday Roster Clearance",
      startsAtUtc: new Date().toISOString(),
      expiresAtUtc: new Date(Date.now() + 1800_000).toISOString(),
      revokedAtUtc: null,
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

  // 7. Activity & Security Log
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

  // 8. Privacy
  await page.route("**/api/v1/account/privacy/export-dsar", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        archiveId: "dsar-bundle-2026-sov-001",
        generatedAtUtc: new Date().toISOString(),
        sha256Signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      }),
    });
  });

  await page.route("**/api/v1/account/privacy", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(privacySlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      privacySlice = { ...privacySlice, ...body };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(privacySlice),
      });
    } else {
      await route.continue();
    }
  });

  // 9. Preferences
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

  // 10. Accessibility
  await page.route("**/api/v1/account/accessibility", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(accessibilitySlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      accessibilitySlice = { ...accessibilitySlice, ...body };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(accessibilitySlice),
      });
    } else {
      await route.continue();
    }
  });

  // 11. AI Copilot
  await page.route("**/api/v1/account/ai-copilot", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(aiCopilotSlice),
      });
    } else if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON() || {};
      aiCopilotSlice = { ...aiCopilotSlice, ...body };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(aiCopilotSlice),
      });
    } else {
      await route.continue();
    }
  });

  // 12. Notifications
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

  // 13. Plan & Quotas
  await page.route("**/api/v1/account/plan", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(planSlice),
    });
  });

  // 14. Billing & Expenses
  await page.route("**/api/v1/account/billing/expenses", async (route) => {
    const body = route.request().postDataJSON() || {};
    const added = {
      id: `exp-${Date.now()}`,
      category: body.category || "Matchday Operations",
      description: body.description || "CAF Tactical Video Feed License",
      amount: Number(body.amount || 450),
      currency: body.currency || "USD",
      status: "Pending Approval",
      occurredAtUtc: new Date().toISOString(),
      receiptCode: `RCP-${Date.now().toString().slice(-4)}`,
    };
    billingSlice.expenses.unshift(added);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(added),
    });
  });

  await page.route("**/api/v1/account/billing", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(billingSlice),
    });
  });

  // 15. Integrations, PATs, SSH Keys, Webhooks
  await page.route("**/api/v1/account/integrations/ssh-keys/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      integrationsSlice.sshKeys = integrationsSlice.sshKeys.filter((k) => k.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/integrations/ssh-keys", async (route) => {
    const body = route.request().postDataJSON() || {};
    const added = {
      id: `ssh-${Date.now()}`,
      title: body.title || "Notebook Signing Key",
      keyType: body.keyType || "ssh-ed25519",
      fingerprintSha256: "SHA256:77c199b2a4f01122",
      createdAtUtc: new Date().toISOString(),
      lastUsedAtUtc: null,
    };
    integrationsSlice.sshKeys.push(added);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(added),
    });
  });

  await page.route("**/api/v1/account/integrations/webhooks/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const id = route.request().url().split("/").pop();
      integrationsSlice.webhooks = integrationsSlice.webhooks.filter((w) => w.id !== id);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/account/integrations/webhooks", async (route) => {
    const body = route.request().postDataJSON() || {};
    const added = {
      id: `wh-${Date.now()}`,
      name: body.name || "Matchday Webhook",
      targetUrl: body.targetUrl || "https://hooks.scripe.org/matchday",
      subscribedEvents: body.subscribedEvents || ["tactics.formation.updated"],
      lastDeliveryAtUtc: new Date().toISOString(),
      lastDeliveryStatusCode: 200,
    };
    integrationsSlice.webhooks.push(added);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(added),
    });
  });

  await page.route("**/api/v1/account/integrations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(integrationsSlice),
    });
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
        maskedToken: "scr_pat_live_99aa••••••••ff12",
        scopes: body.scopes || ["tactics:read"],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        lastUsedAt: null,
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
