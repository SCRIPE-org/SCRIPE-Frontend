import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { usePatOneTimeSecretStore } from "@core/store/usePatOneTimeSecretStore";
import { authBroadcast } from "@core/common/broadcast-auth";
import { broadcastTenantContext } from "@core/services/api-factory";
import {
  consumeDeferredAdminSettingsFlush,
  stageDeferredAdminSettingsFlush,
} from "@core/providers/admin-settings-deferred-flush";
import {
  clearAllLocalStorage,
  clearSessionOnLoginMount,
} from "@modules/auth/core/data/utils/auth-storage-cleanup";
import { TemplateStorageService } from "@modules/admin/customization/branding/src/data/services/TemplateStorageService";
import {
  getActiveTenantId,
  getSavedFacilityId,
  saveFacilityId,
} from "@modules/venue/shared/src/presentation/utils/venueFacilityPersistence";
import { clearOpportunityCommercialPackageCache } from "@modules/crm/opportunities/src/presentation/viewmodels/useOpportunityCommercialPackage";
import {
  clearBookingIntent,
  getOrCreateBookingIntent,
} from "@modules/venue/booking/src/data/services/bookingIntentStore";

type SwListener = (event: Record<string, unknown>) => void;

function loadServiceWorkerInSandbox() {
  const swSource = fs.readFileSync(path.resolve(process.cwd(), "public/sw.js"), "utf-8");
  const listeners = new Map<string, SwListener>();
  const cacheBuckets = new Map<string, Map<string, Response>>();
  const keyOf = (req: Request | string) => (typeof req === "string" ? req : req.url);

  const cachesMock = {
    open: vi.fn(async (name: string) => {
      if (!cacheBuckets.has(name)) cacheBuckets.set(name, new Map());
      const bucket = cacheBuckets.get(name)!;
      return {
        addAll: vi.fn(async (urls: string[]) => urls.forEach((u) => bucket.set(u, new Response("static")))),
        match: vi.fn(async (req: Request | string) => bucket.get(keyOf(req))),
        put: vi.fn(async (req: Request | string, res: Response) => {
          bucket.set(keyOf(req), res);
        }),
      };
    }),
    keys: vi.fn(async () => Array.from(cacheBuckets.keys())),
    delete: vi.fn(async (name: string) => cacheBuckets.delete(name)),
    match: vi.fn(async (req: Request | string) => {
      for (const b of cacheBuckets.values()) if (b.has(keyOf(req))) return b.get(keyOf(req));
      return undefined;
    }),
  };

  const fetchMock = vi.fn(async () => {
    const res = new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
    Object.defineProperty(res, "type", { value: "basic" });
    return res;
  });

  vm.runInNewContext(swSource, {
    self: {
      location: new URL("https://scripe.admin.scripe.org"),
      addEventListener: (type: string, cb: SwListener) => listeners.set(type, cb),
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn() },
    },
    caches: cachesMock,
    fetch: fetchMock,
    URL,
    Response,
    Headers,
    Promise,
  });
  return { listeners, cacheBuckets, fetchMock };
}

describe("Service Worker static-only cache isolation (SW-01)", () => {
  it("excludes '/' from APP_SHELL, purges legacy v2 dynamic caches on activate, and never intercepts /api/*, ?_rsc=, cross-origin, or Authorization fetches", async () => {
    const { listeners, cacheBuckets, fetchMock } = loadServiceWorkerInSandbox();

    // Pre-populate legacy poisoned dynamic cache
    cacheBuckets.set("scripe-v2-relay-dynamic", new Map([["/api/v1/crm/leads", new Response("{}")]]));

    let installPromise: Promise<unknown> = Promise.resolve();
    listeners.get("install")!({
      waitUntil: (p: Promise<unknown>) => {
        installPromise = p;
      },
    });
    await installPromise;

    const staticBucket = cacheBuckets.get("scripe-v3-static-only-static");
    expect(staticBucket).toBeDefined();
    expect(staticBucket!.has("/")).toBe(false);
    expect(staticBucket!.has("/offline.html")).toBe(true);

    let activatePromise: Promise<unknown> = Promise.resolve();
    listeners.get("activate")!({
      waitUntil: (p: Promise<unknown>) => {
        activatePromise = p;
      },
    });
    await activatePromise;
    expect(cacheBuckets.has("scripe-v2-relay-dynamic")).toBe(false);

    const forbiddenRequests = [
      new Request("https://api.scripe.org/api/v1/crm/leads"),
      new Request("https://scripe.admin.scripe.org/api/auth/session/refresh"),
      new Request("https://scripe.admin.scripe.org/overview?_rsc=abc123"),
      new Request("https://scripe.admin.scripe.org/brand/logo.png", {
        headers: { Authorization: "Bearer secret-jwt" },
      }),
    ];

    for (const request of forbiddenRequests) {
      const respondWith = vi.fn();
      listeners.get("fetch")!({ request, respondWith });
      expect(respondWith).not.toHaveBeenCalled();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

const origLs = {
  getItem: window.localStorage.getItem,
  setItem: window.localStorage.setItem,
  removeItem: window.localStorage.removeItem,
  clear: window.localStorage.clear,
};

function installBackingLocalStorage(): Map<string, string> {
  const store = new Map<string, string>();
  const define = (k: keyof typeof origLs, fn: unknown) =>
    Object.defineProperty(window.localStorage, k, { configurable: true, value: fn });
  define("getItem", vi.fn((key: string) => store.get(key) ?? null));
  define("setItem", vi.fn((key: string, val: string) => void store.set(key, String(val))));
  define("removeItem", vi.fn((key: string) => void store.delete(key)));
  define("clear", vi.fn(() => store.clear()));
  return store;
}

function restoreBackingLocalStorage(): void {
  for (const [k, fn] of Object.entries(origLs)) {
    Object.defineProperty(window.localStorage, k, { configurable: true, value: fn });
  }
}

describe("Principal & tenant-bound deferred admin settings flush (LS-01)", () => {
  beforeEach(() => {
    installBackingLocalStorage();
    window.localStorage.clear();
    window.sessionStorage.clear();
    broadcastTenantContext(null);
    useAppStore.getState().logout();
  });

  afterEach(() => {
    restoreBackingLocalStorage();
  });

  it("consumes deferred settings ONLY when both principalId and tenantId match the active session", () => {
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "admin-alpha", tenantId: "tenant-1" } as never,
    });
    expect(stageDeferredAdminSettingsFlush('{"theme":"dark"}')).toBe(true);

    // Different principal on same browser -> must discard without returning payload
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "admin-beta", tenantId: "tenant-1" } as never,
    });
    expect(consumeDeferredAdminSettingsFlush()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH)).toBeNull();

    // Same principal but switched into a different tenant context -> must discard
    useAppStore.setState({
      isAuthenticated: true,
      user: { id: "admin-alpha", tenantId: "tenant-1" } as never,
    });
    stageDeferredAdminSettingsFlush('{"density":"compact"}');
    broadcastTenantContext("tenant-2");
    expect(consumeDeferredAdminSettingsFlush()).toBeNull();

    // Legacy raw unscoped JSON -> must discard
    broadcastTenantContext(null);
    window.localStorage.setItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH, '{"theme":"light"}');
    expect(consumeDeferredAdminSettingsFlush()).toBeNull();

    // Matching principal + matching tenant -> succeeds and removes envelope
    stageDeferredAdminSettingsFlush('{"theme":"dark","density":"compact"}');
    expect(consumeDeferredAdminSettingsFlush()).toBe('{"theme":"dark","density":"compact"}');
    expect(window.localStorage.getItem(STORAGE_KEYS.PENDING_SETTINGS_FLUSH)).toBeNull();
  });
});

describe("Logout, cross-tab broadcast, cookie & module storage isolation (SS-01, LS-02, LS-03, CK-03)", () => {
  beforeEach(() => {
    installBackingLocalStorage();
    window.localStorage.clear();
    window.sessionStorage.clear();
    useAppStore.getState().logout();
    clearOpportunityCommercialPackageCache();
    clearBookingIntent();
  });

  afterEach(() => {
    restoreBackingLocalStorage();
  });

  it("expires scr_auth_state, dispatches scripe:auth-logout, and sweeps scoped session artifacts on clearAllLocalStorage, login mount, and cross-tab LOGOUT", async () => {
    const logoutEvtSpy = vi.fn();
    window.addEventListener("scripe:auth-logout", logoutEvtSpy);
    document.cookie = `${STORAGE_KEYS.scr_auth_state}=true; path=/`;
    window.sessionStorage.setItem("scr_active_principal_key", "admin:t1:u1");
    window.sessionStorage.setItem(STORAGE_KEYS.JUST_LOGGED_IN, "1");
    window.sessionStorage.setItem("sso_code_verifier", "pkce-secret");
    window.sessionStorage.setItem("scripe:crm:deal-package:t1:u1:opp-9", '{"quoteItems":[{"id":"1"}]}');
    window.sessionStorage.setItem("scripe_venue_wizard_draft:t1", '{"branchName":"Main"}');
    window.sessionStorage.setItem(STORAGE_KEYS.SIGNUP_WIZARD, '{"step":2}');
    await getOrCreateBookingIntent("resource-1:2026-11-24T10:00:00Z");
    expect(window.sessionStorage.getItem("scripe.venue.booking.intent.v1")).not.toBeNull();

    clearAllLocalStorage();

    expect(window.sessionStorage.getItem("scr_active_principal_key")).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEYS.JUST_LOGGED_IN)).toBeNull();
    expect(window.sessionStorage.getItem("sso_code_verifier")).toBeNull();
    expect(window.sessionStorage.getItem("scripe:crm:deal-package:t1:u1:opp-9")).toBeNull();
    expect(window.sessionStorage.getItem("scripe_venue_wizard_draft:t1")).toBeNull();
    expect(window.sessionStorage.getItem("scripe.venue.booking.intent.v1")).toBeNull();
    // Pre-auth Stripe signup round-trip state is preserved
    expect(window.sessionStorage.getItem(STORAGE_KEYS.SIGNUP_WIZARD)).toBe('{"step":2}');

    // Cross-tab LOGOUT resets Sudo & PAT receipts on sibling tabs (#357 #2)
    useSudoStore.getState().markVerified({
      sudoToken: "sudo-tab-b",
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      methodUsed: "totp",
    });
    usePatOneTimeSecretStore.getState().setPendingReceipt({
      tokenId: "p1",
      tokenName: "TabB",
      plainTextSecret: "scr_pat_xyz",
      fingerprintOrPrefix: "scr_pat",
      isRotated: false,
    });
    (authBroadcast as unknown as { handleMessage: (evt: unknown) => void }).handleMessage({
      type: "LOGOUT",
    });
    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(usePatOneTimeSecretStore.getState().pendingReceipt).toBeNull();

    window.sessionStorage.setItem("sso_state", "abandoned-state");
    clearSessionOnLoginMount();
    expect(window.sessionStorage.getItem("sso_state")).toBeNull();
    expect(logoutEvtSpy).toHaveBeenCalled();
    window.removeEventListener("scripe:auth-logout", logoutEvtSpy);
  });

  it("scopes venue facility selection via sessionStorage scr_tenant_ctx.id and isolates builder templates per tenant", () => {
    window.sessionStorage.setItem(
      STORAGE_KEYS.tenant_context,
      JSON.stringify({ id: "tenant-ahly", name: "Al Ahly" })
    );
    expect(getActiveTenantId()).toBe("tenant-ahly");
    saveFacilityId("fac-2");
    expect(window.localStorage.getItem("scripe_venue_facility_tenant-ahly")).toBe("fac-2");
    expect(window.localStorage.getItem("scripe_venue_selected_facility")).toBeNull();
    expect(getSavedFacilityId([{ id: "fac-1" }, { id: "fac-2" }])).toBe("fac-2");

    TemplateStorageService.save(
      [{ id: "t1", name: "Ahly Theme", components: [], gridRows: 12, background: {} as never, createdAt: "" }],
      "tenant-ahly"
    );
    expect(TemplateStorageService.load("tenant-ahly")).toHaveLength(1);
    expect(TemplateStorageService.load("tenant-city")).toHaveLength(0);
  });
});
